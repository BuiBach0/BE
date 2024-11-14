import { IsNotEmpty } from "class-validator";

export class EditDepartmentDto{
    @IsNotEmpty({message: 'Name of department must be provided'})
    name: string;
}