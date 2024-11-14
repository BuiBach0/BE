import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Department } from "./department.entity";
import { In, Repository } from "typeorm";
import { EditDepartmentDto } from "./dto/edit_department.dto";
import { Class } from "src/class/class.entity";
import { CreateDepartmentDto } from "./dto/create_department.dto";

@Injectable()
export class DepartmentService { 
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>
    ) { }
    
    async findOne(id: number): Promise<Department> { 
        return this.departmentRepository.findOneBy({ id });
    }

    async getDepartmentByUserId(userId: number): Promise<number> {
        const department = await this.departmentRepository.createQueryBuilder('department')
            .innerJoin('department.users', 'user')
            .innerJoin('user.student', 'student')
            .where('student.userId = :userId', { userId }).getOne();        
        return department.id;
    }

    async getDepartmentOfTeacher(teacherId: number): Promise<Department> { 
        return await this.departmentRepository.createQueryBuilder('department')
            .innerJoin('department.users', 'user')
            .innerJoin('user.teacher', 'teacher')
            .where('teacher.id = :teacherId', { id: teacherId }).getOne();
    }

    async getDepartments(page: number = 1, limit: number = 10): Promise<any> {
        const [departments, total] = await this.departmentRepository.createQueryBuilder('department')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        if (total === 0) { 
            throw new HttpException(`No department found`, HttpStatus.NOT_FOUND);
        }
        return {
            departments,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    }

    async editDepartment(dep_id: number, editDepartmentDto: EditDepartmentDto): Promise<any> {
        return await this.departmentRepository.createQueryBuilder().update(Department)
            .set({ name: editDepartmentDto.name }).where("id = :dep_id", { dep_id }).execute();
    }

    async getClassesOfDepartment(dep_id: number, page: number = 1, limit: number = 10): Promise<any> {
        const [classes, total] = await this.departmentRepository.createQueryBuilder('department')
            .innerJoin('department.classes', 'class')
            .innerJoin('class.teacher', 'teacher')
            .innerJoin('teacher.user', 'user')
            .select([
                'class.id',
                'class.name',
                'class.quantity',
                'class.start_date',
                'class.end_date',
                'teacher.userId',
                'user.first_name',
                'user.last_name',
            ])
            .where('department.id = :dep_id', { dep_id })
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

    async createDepartment(createDepartmentDto: CreateDepartmentDto): Promise<any> {
        const { name } = createDepartmentDto;
        const department = await this.departmentRepository.findOneBy({ name });
        if (department) {
            throw new HttpException("Department already exists", HttpStatus.BAD_REQUEST);
        }
        const newDepartment = this.departmentRepository.create({ name });
        await this.departmentRepository.save(newDepartment);
        return;
    }
    async getAllDepartments(): Promise<Department[]> {
        return await this.departmentRepository.find(); 
    }
}