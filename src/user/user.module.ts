import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UsersController } from "./user.controller";
import { PermissionsModule } from "src/permission/permission.module";
import { DepartmentModule } from "src/department/department.module";
import { RedisModule } from "src/redis/redis.module";
import { RoleModule } from "src/role/role.module";
import { FileModule } from "src/file/file.module";
import { ClassModule } from "src/class/class.module";
import { StudentModule } from "src/student/student.module";
import { TeacherModule } from "src/teacher/teacher.module";

@Module({
    imports: [
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([User]),
        PermissionsModule,
        DepartmentModule,
        RedisModule,
        RoleModule,
        FileModule,
        forwardRef(() => ClassModule),
        forwardRef(() => StudentModule),
        forwardRef(() => TeacherModule)
    ],
    providers: [UserService],
    exports: [UserService],
    controllers: [UsersController]
})
export class UserModule { }