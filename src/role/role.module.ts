import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./role.entity";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Role])
    ],
    controllers:[RoleController],
    providers: [RoleService],
    exports: [RoleService]
})
export class RoleModule { }