import { IsNotEmpty } from "class-validator";
export class EditUserDto {
    @IsNotEmpty({ message: 'first name is required' })
    first_name: string;
    @IsNotEmpty({ message: 'last name is required' })
    last_name: string;
    dob: Date;
    gender: string;
    address: string;
}
