import { Controller, Get } from "@nestjs/common";
import { TeacherService } from "./teacher.service";

@Controller('teachers')
export class TeacherController{
    constructor(
        private readonly teacherService: TeacherService
    ) { }
}