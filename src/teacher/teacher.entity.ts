import { Class } from "src/class/class.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('teachers')
export class Teacher{
    @PrimaryColumn()
    userId: number;
    
    @OneToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User

    @OneToMany(() => Class, (classs) => classs.teacher)
    classes: Class[];
}