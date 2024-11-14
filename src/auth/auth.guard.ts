import { ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { UserService } from "src/user/user.service";
import { RedisService } from "src/redis/redis.service";
import * as dotenv from "dotenv";
import { Role } from "src/role/role.entity";
import { RoleService } from "src/role/role.service";
import { ClassService } from "src/class/class.service";
dotenv.config({ path: '../.env' });
@Injectable()
export class AuthGuard {
    constructor(
        private readonly jwtService: JwtService,
        private readonly roleService: RoleService,
        private readonly userService: UserService,
        private readonly redisService: RedisService,
        private readonly classService: ClassService,
        private reflector: Reflector
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRole = this.reflector.get<string[]>('roles', context.getHandler());

        const request = context.switchToHttp().getRequest();
        // const token = request.cookies['accessToken'];
        const token = request.headers?.authorization?.split(' ')[1];
        if (!token) {
            return false;
        } 
        try {
            const checkExistingToken = await Promise.any([
                this.userService.checkExistingToken(token, 'access_token'),
                this.redisService.get(token)
            ]); 
            if (!checkExistingToken) {
                return false;
            }
            const secret: string = process.env.ACCESS_TOKEN_KEY;
            const decodedToken = this.jwtService.verify(token, { secret });
            const userId = decodedToken.id;
            const class_id = +request.params.class_id;
            const student_id = +request.params.student_id;
            if (requiredRole) {
                const userRole = await Promise.any([
                    this.getUserRole(userId),
                    this.redisService.get(`${token}_role`)
                ]);
                if (userRole === 'teacher') {
                    const hasPermission: boolean = await this.checkTeacherPermission(userId, class_id, student_id);
                    if (hasPermission === false) { 
                        return false;
                    }
                }
                const hasRole: boolean = this.checkRole(userRole, requiredRole);
                if (hasRole === false) { 
                    return false;
                }
            }
            request.user = decodedToken;
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    private async checkTeacherPermission(userId: number, class_id: number, student_id: number): Promise<boolean> {
        if (class_id) {
            const hasClass: boolean = await this.classService.checkClassOfTeacher(class_id, userId);
            if (hasClass === false) {
                return false;
            }
            if (student_id) {
                const classHasStudent = await this.classService.checkStudentOfClass(class_id, student_id);
                if (classHasStudent === false) {
                    return false;
                }
            }
        }
        return true;
    }
    
    private async getUserRole(userId: number): Promise<string> {
        const role = await this.roleService.getRoleOfUser(userId);
        return role.name;
    }

    private checkRole(userRole: string, requiredRoles: string[]): boolean {
        return requiredRoles.includes(userRole);
    }
}