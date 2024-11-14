import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./permission.entity";
import { PermissionsService } from "./permission.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Permission])
    ],
    providers: [PermissionsService],
    exports: [PermissionsService]
})
export class PermissionsModule{}