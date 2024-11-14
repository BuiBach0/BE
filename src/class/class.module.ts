import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Class } from "./class.entity";
import { DepartmentModule } from "src/department/department.module";
import { TeacherModule } from "src/teacher/teacher.module";
import { UserModule } from "src/user/user.module";
import { ClassService } from "./class.service";
import { ClassController } from "./class.controller";
import { AuthModule } from "src/auth/auth.module";
import { RoleModule } from "src/role/role.module";
import { RedisModule } from "src/redis/redis.module";
import { StudentModule } from "src/student/student.module";
import { GradingCriteria } from "src/grade/gradingCriteria.entity";
import { Grade } from "src/grade/grade.entity";
import { StudentClass } from "src/student/studentClass.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Class, GradingCriteria, Grade, StudentClass]),
        forwardRef(() => DepartmentModule),
        TeacherModule,
        forwardRef(() => UserModule),
        forwardRef(() => AuthModule),
        RoleModule,
        RedisModule,
        forwardRef(() => StudentModule) 
    ],
    providers: [ClassService],
    controllers: [ClassController],
    exports: [ClassService]
})
export class ClassModule { }