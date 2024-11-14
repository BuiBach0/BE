import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StudentClass } from "src/student/studentClass.entity";
import { GradingCriteria } from "./gradingCriteria.entity";

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudentClass, studentClass => studentClass.grades)
  studentClass: StudentClass;

  @ManyToOne(() => GradingCriteria, gradingCriteria => gradingCriteria.grades)
  gradingCriteria: GradingCriteria;

  @Column()
  score: number;
}