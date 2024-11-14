import { Permission } from "../permission/permission.entity";
import { User } from "../user/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('roles')

export class Role{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => User, (user) => user.role)
    users: User[]

    @OneToMany(() => Permission, (permission) => permission.role)
    permissions: Permission[]
}