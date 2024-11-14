import { Department } from "src/department/department.entity";
import { Grade } from "src/grade/grade.entity";
import { GradingCriteria } from "src/grade/gradingCriteria.entity";
import { Student } from "src/student/student.entity";
import { Teacher } from "src/teacher/teacher.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('classes')
export class Class{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    quantity: number;
    @Column()
    start_date: Date;
    @Column()
    end_date: Date;

    @Column()
    status: string;
    
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
    
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at?: Date;
    @ManyToMany(() => Student, (student) => student.classes)
    students: Student[];

    @ManyToOne(() => Teacher, (teacher) => teacher.classes)
    teacher: Teacher;

    @OneToMany(() => GradingCriteria, gradingCriteria => gradingCriteria.classEntity)
    gradingCriteria: GradingCriteria[];

    @ManyToOne(() => Department, (department) => department.classes)
    department: Department;
}