import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "./student.entity";
import { StudentService } from "./student.service";
import { UserModule } from "src/user/user.module";
import { StudentController } from "./student.controller";
import { AuthModule } from "src/auth/auth.module";
import { RoleModule } from "src/role/role.module";
import { RedisModule } from "src/redis/redis.module";
import { ClassModule } from "src/class/class.module";
import { StudentClass } from "./studentClass.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Student, StudentClass]),
        forwardRef(() => UserModule),
        forwardRef(() => AuthModule),
        RoleModule,
        RedisModule,
        forwardRef(() => ClassModule) 
    ],
    providers: [StudentService],
    exports: [StudentService],
    controllers: [StudentController]
})
export class StudentModule { }