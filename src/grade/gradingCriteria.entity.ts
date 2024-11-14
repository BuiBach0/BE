import { Class } from 'src/class/class.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Grade } from './grade.entity';


@Entity('grading_criteria')
export class GradingCriteria {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => Grade, grade => grade.gradingCriteria)
    grades: Grade[];

    @ManyToOne(() => Class, classEntity => classEntity.gradingCriteria)
    classEntity: Class;

    @Column()
    name: string;

    @Column()
    weight: number;
}
