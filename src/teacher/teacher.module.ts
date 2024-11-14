import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Teacher } from "./teacher.entity";
import { TeacherService } from "./teacher.service";
import { AuthModule } from "src/auth/auth.module";
import { TeacherController } from "./teacher.controller";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Teacher]),
        forwardRef(() => AuthModule),
        forwardRef(() => UserModule)
    ],
    controllers: [TeacherController],
    providers: [TeacherService],
    exports: [TeacherService]
})
export class TeacherModule { }