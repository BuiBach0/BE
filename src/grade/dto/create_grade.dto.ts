import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateGradeDto {
    @IsNotEmpty({ message: "Student ID must not be empty" })
    @IsNumber({}, { message: "Student ID must be a number" })
    studentId: number;

    @IsNotEmpty({ message: "Grade Criteria ID must not be empty" })
    @IsNumber({}, { message: "Grade Criteria ID must be a number" })
    gradeCriteriaId: number;

    @IsNotEmpty({ message: "Score must not be empty" })
    @IsNumber({}, { message: "Score must be a number" })
    score: number;
}
