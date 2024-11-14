import { IsNotEmpty } from "class-validator";

export class CreateDepartmentDto{
    @IsNotEmpty({ message: "Name must not be empty" })
    name:string;
}