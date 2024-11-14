import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ClassService } from "./class.service";
import { Roles } from "src/auth/auth.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateClassDto } from "./dto/create_class.dto";
import { UserService } from "src/user/user.service";
import { StudentService } from "src/student/student.service";
import { Student } from "src/student/student.entity";
import { Request } from "express";
import { CreateGradeDto } from "src/grade/dto/create_grade.dto";

@Controller('classes')
export class ClassController {
    constructor(
        private readonly classService: ClassService,
        private userService: UserService,
        private readonly studentService: StudentService
    ) { }
    @Get('/class')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async getAllClasses(): Promise<any> {
        try {
            const classes = await this.classService.getAllClasses();
            return classes
        } catch (error) {
            console.error('Error fetching classes:', error);
            throw new HttpException('Cannot fetch classes', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/register')
    @Roles(['student'])
    @UseGuards(AuthGuard)
    async getClassesForStudent(
        @Req() req: Request,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<any> {
        const { user } = req as any;
        const studentId = user.id;
        return await this.classService.getClassesForStudent(studentId, page, limit);
    }

    @Get('/attened')
    @Roles(['student'])
    @UseGuards(AuthGuard)
    async getAttendedClasses(
        @Req() req: Request,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<any> {
        const { user } = req as any;
        const studentId = user.id;
        return await this.classService.getClassesAttened(studentId, page, limit);
    }
    
    @Post('/create-class')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async createClass(
        @Body() body: CreateClassDto
    ): Promise<void> {
        return await this.classService.createClass(body);
    }

    @Delete(':class_id/delete')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async deleteClass(
        @Param('class_id') class_id: number
    ): Promise<any> { 
        return await this.classService.deleteClass(class_id);
    }

    @Put(':class_id/change-status')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async changeClassStatus(
        @Param('class_id') class_id: number
    ): Promise<any> { 
        return await this.classService.changeClassStatus(class_id);
    }

    @Get('/teacher-classes')
    @Roles(['teacher'])
    @UseGuards(AuthGuard)
    async getClassesOfTeacher(
        @Req() req: Request,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<any> {
        const { user } = req as any;
        const userId = user.id;
        return await this.classService.getClassesOfTeacher(userId, +page, +limit);
    }    

    @Get(':class_id/students')
    @Roles(['admin', 'teacher'])
    @UseGuards(AuthGuard)
    async getStudentOfClass(
        @Param('class_id') class_id: number,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<any> {
        return await this.studentService.getStudents(class_id, +page, +limit);
    }

    @Get(':class_id/students/:student_id')
    @Roles(['admin', 'teacher']) 
    @UseGuards(AuthGuard)
    async getStudentById(
        @Param('class_id') class_id: number,
        @Param('student_id') student_id: number
    ): Promise<Student> {
        return await this.studentService.getStudentById(student_id, class_id);
    }

        
    @Post(':class_id/add-student')
    @Roles(['student'])
    @UseGuards(AuthGuard)
    async addStudentToClass(
        @Req() req: Request,
        @Param('class_id') class_id: number
    ): Promise<any> {
        const { user } = req as any;
        const studentId = user.id;
        return this.classService.addStudentToClass(studentId, class_id);
    }

    @Get(':class_id/criterias')
    @Roles(['admin', 'teacher'])
    @UseGuards(AuthGuard)
    async getGradeCriteriaOfClass(
        @Param('class_id') class_id: number
    ): Promise<any> {
        return await this.classService.getGradeCriteriaOfClass(class_id);
    }

    @Post(':class_id/create-grade')
    @Roles(['teacher'])
    @UseGuards(AuthGuard)
    async createGrade(
        @Param('class_id') class_id: number,
        @Body() body: CreateGradeDto[]
    ): Promise<any> {
        return await this.classService.createGrade(class_id, body);
    }

    @Get(':class_id/grades')
    @Roles(['admin', 'teacher'])
    @UseGuards(AuthGuard)
    async getGradesOfClass(
        @Param('class_id') class_id: number,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<any> { 
        return this.classService.getGradesOfClass(class_id, +page, +limit);
    }
    
}