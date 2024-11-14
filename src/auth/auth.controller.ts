import { Body, Controller, Post, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserLoginDto } from "src/user/dto/userLogin.dto";
import { RefreshTokenDto } from "./dto/refreshToken.dto";
import { Response } from "express";

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @Post('/login')
    @UsePipes(new ValidationPipe())
    async login(@Body() body: UserLoginDto, @Res({ passthrough: true }) res: Response): Promise<any> {
        return await this.authService.login(body, res);
    }

    @Post('/refresh-token')
    async refreshToken(
        @Body() body: RefreshTokenDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        return await this.authService.refreshToken(body.token, res);
    }

}