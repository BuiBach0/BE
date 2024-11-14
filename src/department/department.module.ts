import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Department } from "./department.entity";
import { DepartmentService } from "./department.service";
import { DepartmentController } from "./department.controller";
import { AuthModule } from "src/auth/auth.module";
import { PermissionsModule } from "src/permission/permission.module";
import { UserModule } from "src/user/user.module";
import { RedisModule } from "src/redis/redis.module";
import { FileModule } from "src/file/file.module";
import { TeacherModule } from "src/teacher/teacher.module";
import { RoleModule } from "src/role/role.module";
import { StudentModule } from "src/student/student.module";
import { ClassModule } from "src/class/class.module";


@Module({
    imports: [
        TypeOrmModule.forFeature([Department]),
        forwardRef(() => AuthModule),
        PermissionsModule,
        forwardRef(() => UserModule),
        RedisModule,
        FileModule,
        TeacherModule,
        RoleModule,
        StudentModule,
        TeacherModule,
        ClassModule
    ],
    providers: [DepartmentService],
    exports: [DepartmentService],
    controllers: [DepartmentController]
})
export class DepartmentModule{}