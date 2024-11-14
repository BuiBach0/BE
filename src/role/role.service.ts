import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./role.entity";
import { Repository } from "typeorm";

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>
    ) { }
    async findOne(id: number): Promise<Role> {
        return await this.roleRepository.findOneBy({ id });
    }

    async getRoleOfUser(userId: number): Promise<any> {
        return await this.roleRepository.createQueryBuilder('role')
            .innerJoin('role.users', 'user')
            .where('user.id = :userId', { userId })
            .select('role.name')
            .getOne();
    } 
    async getAllRole(){
        return await this.roleRepository.find()
    }
}