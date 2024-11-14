import { IsNotEmpty, Matches, MinLength } from "class-validator";

export class UserLoginDto{
    @IsNotEmpty({message: "Username must not be empty"})
    username: string;
    @IsNotEmpty({message: "Password must not be empty"})
    password: string;
}