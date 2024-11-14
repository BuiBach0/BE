import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { StudentService } from "./student.service";
import { Roles } from "src/auth/auth.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { Request } from "express";
import { promises } from "dns";
import { ClassService } from "src/class/class.service";

@Controller('/students')
export class StudentController {
    constructor(
        private readonly classService: ClassService
    ) { }

    @Get('/grades')
    @Roles(['student'])
    @UseGuards(AuthGuard)
    async getGradesOfStudent(
        @Req() req: Request,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<any> {
        const { user } = req as any;
        const userId = user.id;
        return await this.classService.getAllGradesOfStudent(userId, +page, +limit);
    }

    @Get(':student_id/grades')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async getGradesOfStudentForAdmin(
        @Param('student_id') studentId: number,
        @Query('page') page: number,
        @Query('limit') limit: number
    ): Promise<any> {
        return await this.classService.getAllGradesOfStudent(studentId, +page, +limit);
    }

}