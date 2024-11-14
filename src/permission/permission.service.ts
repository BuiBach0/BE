import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Permission } from "./permission.entity";
import { Repository } from "typeorm";

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>
    ) { }

    async getPermissions(userId: number): Promise<any> {
        return await this.permissionRepository.createQueryBuilder('permission')
            .innerJoin('roles', 'role')
            .innerJoin('users', 'user')
            .where('user.id = :userId', { userId })
            .select(['permission.name'])
            .getMany();
    }
}