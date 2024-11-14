import { Class } from "src/class/class.entity";
import { User } from "../user/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('departments')
export class Department{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => User, (user) => user.department)
    users?: User[];

    @OneToMany(() => Class, (cls) => cls.department)
    classes: Class[];
}