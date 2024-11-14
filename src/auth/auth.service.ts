import { HttpException, HttpStatus, Injectable, Res } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'
import { UserLoginDto } from "../user/dto/userLogin.dto";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { RedisService } from "src/redis/redis.service";
import { Response } from "express";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    async login(userLoginDto: UserLoginDto, @Res({ passthrough: true }) res: Response): Promise<any> {
        const user = await this.userService.checkExistingUser(userLoginDto.username);
        const role: string = user.role.name;
        
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (await bcrypt.compare(userLoginDto.password, user.password)) {
            const accessToken = this.createAccessToken(user);
            const refreshToken = this.createRefreshToken(user);
            const { id, username, password, access_token, refresh_token, ...userWithoutUsernamePassword } = user;
            
            await Promise.all([
                this.userService.updateToken(id, accessToken, refreshToken),
                this.redisService.set(accessToken, accessToken),
                this.redisService.set(`${accessToken}_role`, role)
            ]);
            // res.cookie('accessToken', accessToken, {
            //     httpOnly: true,      
            //     secure: false,        
            //     sameSite: 'strict',  
            //     maxAge: 1000 * 60 * 20
            // });
            return { user: userWithoutUsernamePassword, accessToken, refreshToken };
        }
        throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }


    private createAccessToken(user: User): string {
        const payload = { id: user.id };
        return this.jwtService.sign(payload, {
            secret: process.env.ACCESS_TOKEN_KEY,
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
        });
    }

    private createRefreshToken(user: User): string {
        const payload = { id: user.id, username: user.username };
        return this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_KEY,
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
        });
    }

    async refreshToken(token: string, @Res({ passthrough: true }) res: Response): Promise<any> { 
        const user = await this.userService.checkExistingToken(token, 'refresh_token');
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const accessToken = this.createAccessToken(user);
        await Promise.all([
            this.userService.updateAccessToken(user.id, accessToken),
            this.redisService.set(accessToken, accessToken)
        ]) 
        // res.cookie('accessToken', accessToken, {
        //     httpOnly: false,      
        //     secure: false,        
        //     sameSite: 'strict',  
        //     maxAge: 1000 * 60 * 20
        // });
        return { accessToken };
    }

}