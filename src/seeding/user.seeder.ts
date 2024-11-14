import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Student } from "../student/student.entity";
import { User } from "../user/user.entity";
import { Repository } from "typeorm";
import { Class } from "src/class/class.entity";
import { Grade } from "src/grade/grade.entity";
import { GradingCriteria } from "src/grade/gradingCriteria.entity";
import { StudentClass } from "src/student/studentClass.entity";

@Injectable()
export class SeedingUser{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
        @InjectRepository(Class)
        private readonly classRepository: Repository<Class>,
        @InjectRepository(Grade)
        private readonly gradeRepository: Repository<Grade>,
        @InjectRepository(GradingCriteria)
        private readonly gradingCriteriaRepository: Repository<GradingCriteria>,
        @InjectRepository(StudentClass)
        private readonly studentClassRepository: Repository<StudentClass>
    ) { }
    async seedUsers(): Promise<any> {
        const firstNames = ['Nguyen', 'Bui', 'Tran', 'Phan'];
        const lastNames = ['Duy', 'Ngoc', 'Hai', 'Nghia', 'Quynh', 'Tu', 'Ti', 'Duong'];
        const genders = ['Male', 'Female'];
        const students = []
        const users = []

        for (let i = 0; i < 50000; i++) {
            const user = this.userRepository.create({
                first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
                last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
                username: `user${i}`,
                password: 'Buiduy131@',
                dob: '2002-01-14',
                address: 'Ha Noi',
                gender: genders[Math.floor(Math.random() * genders.length)],
            });
            users.push(user);
            
            // const savedUser = await this.userRepository.save(user);

            const student = this.studentRepository.create({
                userId: user.id,
                user: user,
            });

            // await this.studentRepository.save(student);
        }
        await this.userRepository.save(students);
        console.log('success');
        
    }
    async deletestudenClass(): Promise<any> {
        for (let i = 20191; i <= 40190; i++){
            await this.studentClassRepository.delete(i);
        }
        console.log('success');
        
    }
    async seedStudentClass(): Promise<any> {
        console.log('begin');
        
        const cls = await this.classRepository.findOneBy({ id: 24 });
        const gradingCriterias = await this.gradingCriteriaRepository.find({
            where: {
                classEntity: cls
            }
        });
        const grades = [];
        for (let i = 190; i <= 20189; i++) {
            const studentClass = await this.studentClassRepository.findOneBy({ id: i });
            for (const criteria of gradingCriterias) {
                const grade = this.gradeRepository.create({
                    studentClass: studentClass,
                    gradingCriteria: criteria,
                    score: Math.floor(Math.random() * (10 - 5 + 1)) + 5,
                });
      
                grades.push(grade);
            }
        }
        const dataInsert = [...grades, ...grades];
        await this.gradeRepository.save(dataInsert);
        console.log('success');
        
    }
}
