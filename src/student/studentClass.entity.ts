import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, OneToMany, Column } from 'typeorm';
import { Student } from './student.entity';
import { Class } from 'src/class/class.entity';
import { Grade } from 'src/grade/grade.entity';


@Entity('student_classes')
@Unique(['student', 'classEntity'])
export class StudentClass {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => Grade, grade => grade.studentClass)
    grades: Grade[];

    @ManyToOne(() => Student, student => student.classes)
    student: Student;

    @ManyToOne(() => Class, classEntity => classEntity.students)
    classEntity: Class;

}
