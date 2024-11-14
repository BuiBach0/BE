import { IsNotEmpty, IsInt, Min, Max, IsDate, ValidateIf, IsPositive, IsNumber, IsOptional, Validate, ValidationArguments } from 'class-validator';
import { Type } from 'class-transformer';

class GradeDetail{
    @IsNotEmpty({ message: 'Type must be not empty' })
    name: string;
    @IsInt({ message: 'Type must be an integer' })
    weight: number;

}

export class CreateClassDto {
    @IsNotEmpty({ message: "Class name must be not empty" })
    name: string;

    @IsInt({ message: "Quantity must be an integer" })
    @Min(10, { message: "Quantity must be at least 10" })
    @Max(80, { message: "Quantity must be at most 80" })
    quantity: number;

    @Type(() => Date)
    @IsDate({ message: "Start date must be a valid date" })
    start_date: Date;

    @Type(() => Date)
    @IsDate({ message: "End date must be a valid date" })
    @ValidateIf(o => o.end_date > o.start_date)
    end_date: Date;

    grade_details: GradeDetail[];

    @IsNotEmpty({ message: "Teacher ID must not be empty" })
    @IsInt({ message: "Teacher ID must be an integer" })
    @IsPositive({ message: "Teacher ID must be a positive integer" })
    teacherId: number;

    @IsNotEmpty({ message: "Department ID must not be empty" })
    @IsInt({ message: "Department ID must be an integer" })
    @IsPositive({ message: "Department ID must be a positive integer" })
    departmentId: number;
}