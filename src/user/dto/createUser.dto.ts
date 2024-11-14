import { isNotEmpty, IsNotEmpty, Matches, MinLength } from "class-validator";

export class CreateUserDto{
    @IsNotEmpty({ message: 'first name is required' })
    first_name: string;
    @IsNotEmpty({ message: 'last name is required' })
    last_name: string;
    @IsNotEmpty({ message: 'username is required' })
    username: string;
    @IsNotEmpty({ message: 'password is required' })
    password: string;
    dob: Date;
    gender: string;
    address: string;
    @IsNotEmpty()
    roleId: number;
    @IsNotEmpty()
    departmentId: number;
}