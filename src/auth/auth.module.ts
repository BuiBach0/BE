import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { RedisModule } from "src/redis/redis.module";
import { DepartmentModule } from "src/department/department.module";
import * as dotenv from "dotenv";
import { RoleModule } from "src/role/role.module";
import { ClassModule } from "src/class/class.module";
dotenv.config({ path: '../.env' });
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.ACCESS_TOKEN_KEY,
            signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
        }),
        JwtModule.register({
            secret: process.env.REFRESH_TOKEN_KEY,
            signOptions: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE },
        }),
        forwardRef(() => UserModule),
        RedisModule,
        DepartmentModule,
        RoleModule,
        ClassModule
    ],
    providers: [AuthService],
    exports: [JwtModule],
    controllers: [AuthController]
})
export class AuthModule { }