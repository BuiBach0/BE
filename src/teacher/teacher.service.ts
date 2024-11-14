import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Teacher } from "./teacher.entity";
import { Repository } from "typeorm";
import { User } from "src/user/user.entity";

@Injectable()
export class TeacherService { 
    constructor(
        @InjectRepository(Teacher)
        private readonly teacherRepository: Repository<Teacher>
    ) { }

    async findOne(teacherId: number): Promise<any> {
        return await this.teacherRepository.createQueryBuilder('teacher')
            .innerJoin('teacher.user', 'user')
            .where('teacher.userId = :teacherId', { teacherId })
            .select([
                'teacher.userId',
                'user.id',
                'user.first_name',
                'user.last_name',
            ]).getOne();
    }
    
    async getTeacherOfDepartment(dep_id: number, page: number = 1, limit: number = 10): Promise<any> {
        const [teachers, total] = await this.teacherRepository.createQueryBuilder('teacher')
            .innerJoin('teacher.user', 'user')
            .innerJoin('user.department', 'department')
            .where('department.id = :dep_id', { dep_id })
            .select([
                'user.id',
                'user.first_name',
                'user.last_name',
                'user.dob',
                'user.address',
                'user.gender',
            ])
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            teachers,
            total,
            totalPage: Math.ceil(total / limit),
            currentPage: page
        }
    }

    async getTeachers(page: number = 1, limit: number = 10): Promise<any> {
        const [teachers, total] = await this.teacherRepository.createQueryBuilder('teacher')
            .innerJoin('teacher.user', 'user')
            .innerJoin('user.department', 'department')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            teachers,
            total,
            totalPage: Math.ceil(total / limit),
            currentPage: page
        }
    }

    async createTeacher(user: User): Promise<any> {
        const teacherData = { user };
        const teacher = this.teacherRepository.create(teacherData);
        return await this.teacherRepository.save(teacher);
    }
}