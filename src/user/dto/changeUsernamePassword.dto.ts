import { IsNotEmpty, MinLength, Matches } from "class-validator";

export class ChangeUsernamePasswordDto{
    @IsNotEmpty({ message: "Username must not be empty" })
    username: string;
    @IsNotEmpty({ message: "Old password must be not empty"})
    oldPassword: string;
    @IsNotEmpty({ message: "Passwords must be not empty"})
    newPassword: string;
    @IsNotEmpty({message: "Confirm password must not be empty"})
    confirmPassword: string;
}