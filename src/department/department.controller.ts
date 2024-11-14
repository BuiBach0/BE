import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { DepartmentService } from "./department.service";
import { AuthGuard } from "src/auth/auth.guard";
import { Request } from "express";
import { UserService } from "src/user/user.service";
import { Roles } from "src/auth/auth.decorator";
import { EditDepartmentDto } from "./dto/edit_department.dto";
import { ClassService } from "src/class/class.service";
import { CreateDepartmentDto } from "./dto/create_department.dto";

@Controller('departments')
export class DepartmentController {
    constructor(
        private readonly departmentService: DepartmentService,
        private readonly classService: ClassService,
        private readonly userService: UserService,
    ) { }
    
    @Get()
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async getDepartments(): Promise<any> { // Xóa các tham số page và limit
        return this.departmentService.getAllDepartments(); // Sử dụng phương thức mới không phân trang
    }

    @Post('/create')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async createDepartment(
        @Body() body: CreateDepartmentDto
    ): Promise<any> {
        return this.departmentService.createDepartment(body);
    }

    @Put(':dep_id/edit')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async editDepartment(
        @Param('dep_id') dep_id: number,
        @Body() body: EditDepartmentDto
    ): Promise<any> { 
        return this.departmentService.editDepartment(dep_id, body);
    }

    @Get(':dep_id/classes')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async getClassesOfDepartment(
        @Param('dep_id') dep_id: number,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<any> { 
        return await this.classService.getClassesOfDepartment(dep_id, page, limit);
    }

    @Delete(':dep_id/users/:emp_id/delete')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async deleteUser(
        @Param('dep_id') dep_id: number,
        @Param('emp_id') emp_id: number
    ): Promise<any> { 
        return await this.userService.deleteUser(emp_id);
    }

    @Get(':dep_id/students')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async findAllStudent(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Param('dep_id') dep_id: number
    ): Promise<any> {
        return await this.userService.getStudentOfDepartment(dep_id, +page, +limit);
    }

    @Get(':dep_id/teachers')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async findAllTeacher(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Param('dep_id') dep_id: number
    ): Promise<any> {
        return await this.userService.getTeacherOfDepartment(dep_id, +page, +limit);
    }
}
