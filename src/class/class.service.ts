import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Class } from "./class.entity";
import { In, Repository } from "typeorm";
import { CreateClassDto } from "./dto/create_class.dto";
import { DepartmentService } from "src/department/department.service";
import { TeacherService } from "src/teacher/teacher.service";
import { StudentService } from "src/student/student.service";
import { GradingCriteria } from "src/grade/gradingCriteria.entity";
import { Grade } from "src/grade/grade.entity";
import { CreateGradeDto } from "src/grade/dto/create_grade.dto";
import { StudentClass } from "src/student/studentClass.entity";
import { RedisService } from "src/redis/redis.service";

enum classStatus {
    init = "init",
    inProgress = "inProgress",
    finished = "finished"
}

@Injectable()
export class ClassService {
    constructor(
        @InjectRepository(Class)
        private readonly classRepository: Repository<Class>,
        @InjectRepository(GradingCriteria)
        private readonly gradingCriteriaRepository: Repository<GradingCriteria>,
        @InjectRepository(Grade)
        private readonly gradeRepository: Repository<Grade>,
        @InjectRepository(StudentClass)
        private readonly studentClassRepository: Repository<StudentClass>,
        private readonly departmentService: DepartmentService,
        private readonly teacherService: TeacherService,
        private readonly studentService: StudentService,
        private readonly redisService: RedisService
    ) { }

    async createClass(createClassDto: CreateClassDto): Promise<any> {
        const { teacherId, departmentId, name, grade_details, ...classData } = createClassDto;
        const hasClass: boolean = await this.checkExistingClass(name);
        if (hasClass) {
            throw new HttpException(`Class ${name} already exists`, HttpStatus.BAD_REQUEST);
        }
        const [department, teacher] = await Promise.all([
            this.departmentService.findOne(departmentId),
            this.teacherService.findOne(teacherId)
        ]);

        if (!department) {
            throw new HttpException("Department not found", HttpStatus.NOT_FOUND);
        }
        if (!teacher) {
            throw new HttpException("Teacher not found", HttpStatus.NOT_FOUND);
        }
        const newClass = this.classRepository.create({
            ...classData,
            name,
            teacher,
            department,
        });
        await this.classRepository.save(newClass);
        const gradingCriterias = grade_details.map(detail => {
            return this.gradingCriteriaRepository.create({
                name: detail.name,
                weight: detail.weight,
                classEntity: newClass,
            });
        });

        await this.gradingCriteriaRepository.save(gradingCriterias);
        return;
    }

    async deleteClass(classId: number): Promise<any> {
        return this.classRepository.createQueryBuilder()
            .softDelete().where("id = :classId", { classId }).execute();
    }

    async changeClassStatus(class_id: number): Promise<any> {
        return await this.classRepository.createQueryBuilder()
            .update(Class).set({
                status: classStatus.inProgress
            }).where('id = :class_id', { class_id }).execute();
    }

    async getClassesOfTeacher(teacherId: number, page: number = 1, limit: number = 10): Promise<any> {
        const [classes, total] = await this.classRepository.createQueryBuilder('class')
            .innerJoin('class.teacher', 'teacher').where('teacher.userId = :teacherId', { teacherId })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            classes,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    }

    async checkClassOfTeacher(classId: number, teacherId: number): Promise<boolean> {
        const cls = await this.classRepository.createQueryBuilder('class')
            .innerJoin('class.teacher', 'teacher').where('teacher.userId = :teacherId', { teacherId })
            .andWhere('class.id = :classId', { classId }).select('class.name').getOne();
        return !!cls;
    }

    async checkStudentOfClass(classId: number, studentId: number): Promise<boolean> {
        const student = await this.classRepository.createQueryBuilder('class')
            .innerJoin('class.students', 'student').where('class.id = :classId', { classId })
            .andWhere('student.studentId = :studentId', { studentId }).select('class.name').getOne();
        return !!student;
    }

    async addStudentToClass(studentId: number, classId: number): Promise<any> {
        const [student, cls] = await Promise.all([
            this.studentService.getStudentById(studentId),
            this.classRepository.findOne({
                where: {
                    id: classId
                },
                relations: {
                    students: true
                }
            })
        ]);
        if (!student) {
            throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
        }
        if (!cls) {
            throw new HttpException('Class not found', HttpStatus.NOT_FOUND);
        }
        if (cls.status !== classStatus.init) {
            throw new HttpException('Outside of class registration time', HttpStatus.BAD_REQUEST);
        }
        if (cls.students.length < cls.quantity) {
            cls.students.push(student);
            await this.classRepository.save(cls);
            return;
        }

        throw new HttpException("The class is full", HttpStatus.BAD_REQUEST);
    }

    private async checkExistingClass(name: string): Promise<boolean> {
        const cls = await this.classRepository.findOneBy({ name });
        return !!cls;
    }

    private async getClasseIdsAttended(student_id: number): Promise<number[]> {
        const classes = await this.classRepository.createQueryBuilder('class')
            .innerJoin('class.students', 'student')
            .where('student.userId = :student_id', { student_id }).getMany();
        const ids: number[] = classes.map(cls => cls.id);
        return ids;
    }

    async getClassesForStudent(student_id: number, page: number = 1, limit: number = 10): Promise<any> {
        const [departmentId, attendedClasses] = await Promise.all([
            this.departmentService.getDepartmentByUserId(student_id),
            this.getClasseIdsAttended(student_id)
        ]);

        const [classes, total] = await this.classRepository.createQueryBuilder('class')
            .leftJoinAndSelect('class.students', 'student')
            .leftJoinAndSelect('class.teacher', 'teacher')
            .leftJoinAndSelect('teacher.user', 'user')
            .where('class.departmentId = :departmentId', { departmentId })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        const results = classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            quantity: cls.quantity,
            remainingSeats: cls.quantity - cls.students.length,
            start_date: cls.start_date,
            end_date: cls.end_date,
            status: attendedClasses.includes(cls.id) ? "joined" : "not joined",
            teacher: {
                teacher_id: cls.teacher.userId,
                teacher_name: `${cls.teacher.user.first_name} ${cls.teacher.user.last_name}`
            }
        }))

        return {
            results,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    }

    async getClassesAttened(student_id: number, page: number = 1, limit: number = 10): Promise<any> {
        const [classes, total] = await this.classRepository.createQueryBuilder('class')
            .innerJoin('class.teacher', 'teacher')
            .innerJoin('class.students', 'student')
            .innerJoin('teacher.user', 'user')
            .select([
                'class.id',
                'class.name',
                'class.start_date',
                'class.end_date',
                'teacher.userId',
                'user.first_name',
                'user.last_name',
            ])
            .where('student.userId = :student_id', { student_id })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            classes,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    }

    async getClassesOfDepartment(dep_id: number, page: number = 1, limit: number = 10): Promise<any> {
        const results = await this.classRepository.createQueryBuilder('class')
            .leftJoinAndSelect('class.department', 'department')
            .leftJoinAndSelect('class.teacher', 'teacher')
            .leftJoinAndSelect('class.students', 'student')
            .leftJoinAndSelect('teacher.user', 'user')
            .select([
                'class.id AS class_id',
                'class.name AS class_name',
                'class.quantity AS class_quantity',
                'class.start_date AS class_start_date',
                'class.end_date AS class_end_date',
                'teacher.userId AS teacher_id',
                'user.first_name AS teacher_first_name',
                'user.last_name AS teacher_last_name',
                'COUNT(class.id) AS student_count'
            ])
            .where('department.id = :dep_id', { dep_id })
            .groupBy('class.id')
            .offset((page - 1) * limit)
            .limit(limit)
            .getRawMany();

        const totalRecords = await this.classRepository.createQueryBuilder('class')
            .innerJoin('class.department', 'department')
            .where('department.id = :dep_id', { dep_id })
            .getCount();

        return {
            classes: results,
            total: totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page
        };
    }

    async getGradeCriteriaOfClass(class_id: number): Promise<any> {
        const criterias = await this.classRepository.find({
            where: {
                id: class_id
            },
            relations: {
                gradingCriteria: true
            },
            select: {
                id: true,
                gradingCriteria: true
            }
        })
        if (!criterias) {
            throw new HttpException('No criteria found for class', HttpStatus.NOT_FOUND);
        }
        return criterias;
    }

    async createGrade(classId: number, createGradeDtos: CreateGradeDto[]): Promise<any> {
        const studentIds = createGradeDtos.map(dto => dto.studentId);
        const [studentClasses, gradingCriterias] = await Promise.all([
            this.studentClassRepository.find({
                where: {
                    student: {
                        userId: In(studentIds)
                    },
                    classEntity: {
                        id: classId
                    }
                },
                relations: ['student', 'classEntity']
            }),
            this.gradingCriteriaRepository.find(
                {
                    where: {
                        classEntity: {
                            id: classId
                        }
                    }
                }
            )
        ])

        if (!studentClasses) {
            throw new HttpException('Student or class not found', HttpStatus.NOT_FOUND);
        }
        if (studentClasses[0].classEntity.status !== classStatus.inProgress) {
            throw new HttpException('Out of grade update time', HttpStatus.BAD_REQUEST);
        }
        if (!gradingCriterias) {
            throw new HttpException('Grading Criteria not found', HttpStatus.NOT_FOUND);
        }

        const grades = [];
        const gradingCriteriaLength = gradingCriterias.length

        for (let i = 0; i < createGradeDtos.length; i += gradingCriteriaLength) {
            const dtoGroup = createGradeDtos.slice(i, i + gradingCriteriaLength);
            const scores = dtoGroup.map((dto, index) => {
                if (dto.score === undefined) {
                    throw new Error(`Score is missing in DTO at index ${index}`);
                }
                return dto.score;
            });
            const studentClass = studentClasses[Math.floor((i + 1) / gradingCriteriaLength)];

            for (let j = 0; j < scores.length; j++) {
                const newGrade = this.gradeRepository.create({
                    gradingCriteria: gradingCriterias[j],
                    studentClass,
                    score: scores[j],
                });
                grades.push(newGrade);
            }
        }
        studentClasses[0].classEntity.status = classStatus.finished;
        await Promise.all([
            this.gradeRepository.save(grades),
            this.classRepository.save(studentClasses[0].classEntity)
        ]);
        return;
    }

    async getGradesOfClass(classId: number, page: number = 1, limit: number = 10): Promise<any> {
        const cacheKey = `gradesOfClass:${classId}:page=${page}:limit=${limit}`;
        const cachedData = await this.redisService.get(cacheKey);
        let grades: any;
        let totalRecords: number;
        if (!cachedData) {
            const [studentGrades, total] = await Promise.all([
                this.studentClassRepository
                    .createQueryBuilder('studentClass')
                    .innerJoin('studentClass.student', 'student')
                    .innerJoin('studentClass.classEntity', 'class')
                    .innerJoin('studentClass.grades', 'grade')
                    .innerJoin('grade.gradingCriteria', 'gradingCriteria')
                    .innerJoin('student.user', 'user')
                    .where('class.id = :classId', { classId })
                    .groupBy('student.userId')
                    .orderBy('user.last_name', 'ASC')
                    .select([
                        'student.userId AS id',
                        'user.first_name AS first_name',
                        'user.last_name AS last_name',
                        'GROUP_CONCAT(gradingCriteria.name ORDER BY gradingCriteria.name ASC SEPARATOR ", ") AS criteriaNames',
                        'GROUP_CONCAT(gradingCriteria.weight ORDER BY gradingCriteria.name ASC SEPARATOR ", ") AS weights',
                        'GROUP_CONCAT(grade.score ORDER BY gradingCriteria.name ASC SEPARATOR ", ") AS scores',
                        'SUM(grade.score * gradingCriteria.weight / 100) AS average_score'
                    ])
                    .limit(limit)
                    .offset((page - 1) * limit)
                    .getRawMany(),
                this.studentClassRepository.count({
                    where: {
                        classEntity: { id: classId }
                    }
                })
            ]);
            await this.redisService.set(cacheKey, JSON.stringify({
                studentGrades,
                total
            }), 60*60);
            grades = studentGrades;
            totalRecords = total;
        } else {
            const data = JSON.parse(cachedData);
            grades = data.studentGrades;
            totalRecords = data.total;
        }

        return {
            grades,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page
        };
    }

    async getAllGradesOfStudent(studentId: number, page: number = 1, limit: number = 10): Promise<any> {
        const [grades, total] = await Promise.all([
            this.studentClassRepository.createQueryBuilder('studentClass')
                .leftJoin('studentClass.student', 'student')
                .leftJoin('studentClass.classEntity', 'class')
                .leftJoin('studentClass.grades', 'grade')
                .leftJoin('grade.gradingCriteria', 'gradingCriteria')
                .where('student.userId = :studentId', { studentId })
                .groupBy('class.id')
                .select([
                    'class.id AS classId',
                    'class.name AS className',
                    'GROUP_CONCAT(gradingCriteria.name ORDER BY gradingCriteria.name ASC SEPARATOR ", ") AS criteriaNames',
                    'GROUP_CONCAT(gradingCriteria.weight ORDER BY gradingCriteria.name ASC SEPARATOR ", ") AS weights',
                    'GROUP_CONCAT(grade.score ORDER BY gradingCriteria.name ASC SEPARATOR ", ") AS scores',
                    'SUM(grade.score * gradingCriteria.weight / 100) AS average_score'
                ])
                .limit(limit)
                .offset((page - 1) * limit)
                .getRawMany(),
            this.classRepository.count({
                where: {
                    students: {
                        userId: studentId
                    }
                }
            })
        ]);
        return {
            grades,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    }
    async getAllClasses(): Promise<Class[]> {
        return await this.classRepository.find(); 
    }


}