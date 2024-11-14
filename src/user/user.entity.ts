
import { Department } from "../department/department.entity";
import { Role } from "../role/role.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { File } from "src/file/file.entity";
import { Student } from "src/student/student.entity";
import { Message } from "src/chat/message.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    username: string;

    @Column()
    password?: string;

    @Column()
    dob: Date

    @Column()
    address: string;

    @Column()
    gender: string;

    @Column()
    access_token: string;

    @Column()
    refresh_token: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
    
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at?: Date;

    @ManyToOne(() => Role, (role) => role.users)
    role: Role

    @ManyToOne(() => Department, (department) => department.users)
    department: Department

    @OneToMany(() => File, (file) => file.user)
    files: File[];

    @OneToOne(() => Student, (student) => student.user)
    student: Student;

    @OneToMany(() => Message, message => message.sender)
    sentMessages: Message[];

    @OneToMany(() => Message, message => message.receiver)
    receivedMessages: Message[];
}