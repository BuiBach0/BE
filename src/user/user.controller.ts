import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/auth.decorator";
import { CreateUserDto } from "./dto/createUser.dto";
import { User } from "./user.entity";
import { Request } from "express";
import { EditUserDto } from "./dto/editUser.dto";
import { ChangeUsernamePasswordDto } from "./dto/changeUsernamePassword.dto";
import { diskStorage } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";
import { extname } from "path";
import { FileService } from "src/file/file.service";
import { StudentService } from "src/student/student.service";
import { TeacherService } from "src/teacher/teacher.service";
import { Role } from "src/role/role.entity";

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UserService,
        private readonly fileService: FileService,
        private readonly studentService: StudentService,
        private teacherService: TeacherService
    ) { }

    @Get('/all')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async getUsers() {
        return await this.userService.getAll();
    }

    @Post('/create-user')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: 'src/public/uploads',
                filename: (req, file, cb) => {
                    const filename = Date.now() + extname(file.originalname);
                    cb(null, filename);
                },
            }),
        }),
    )
    async createUser(
        @Body() body: CreateUserDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<any> {
        const user = await this.userService.createUser(body);
        await Promise.all([
            user.role.name === 'student' ?
                this.studentService.createStudent(user) : this.teacherService.createTeacher(user),
            this.fileService.saveFile(file.filename, file.path, "server", user.id),
            this.fileService.saveCloud(file, "cloud", user.id)
        ]);
        return;
    }

    @Get('/profile')
    @UseGuards(AuthGuard)
    async getProfile(
        @Req() req: Request
    ): Promise<User> { 
        const { user } = req as any;
        const userId = user.id;
        return await this.userService.getUserById(userId);
    }

    @Put('/edit')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: 'src/public/uploads',
                filename: (req, file, cb) => {
                    const filename = Date.now() + extname(file.originalname);
                    cb(null, filename);
                },
            }),
        }),
    )
    async editUser(
        @Body() body: EditUserDto,
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File
    ): Promise<any> {
        const { user } = req as any;
        const emp_id = user.id;
        await this.userService.updateUser((Number)(emp_id), body);
        if (file) {
            this.fileService.saveCloud(file, "cloud", emp_id);
        }
        return;
    }

    @Put('/change-username-password')
    @UseGuards(AuthGuard)
    async changeUsernameAndPassword(
        @Body() body: ChangeUsernamePasswordDto,
        @Req() req: Request
    ): Promise<any> { 
        const { user } = req as any;
        const userId = user.id;
        return await this.userService.changeUsernameAndPassword(userId, body);
    }

    @Post('/logout')
    @UseGuards(AuthGuard)
    async logout(@Req() req: Request) { 
        const { user } = req as any;
        const userId = user.id;
        return await this.userService.deleteToken(userId);
    }  

    @Get('/search-name')
    @UseGuards(AuthGuard)
    async searchByName(
        @Query('name') name: string,  
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<User[]> {  
        return await this.userService.searchUserByName(name, +page, +limit);
    }

    @Get('/search-dob')
    @UseGuards(AuthGuard)
    async searchByDob(
        @Query('startDate') start: string,
        @Query('endDate') end: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<User[]> {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return this.userService.searchUserByDob(startDate, endDate, +page, +limit);
    }

    @Get(':user_id')
    @Roles(['admin'])
    async getUserById(
        @Param('user_id') userId: number
    ): Promise<any> {
        return await this.userService.getUserById(userId);
    }

    @Put(':user_id/edit')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: 'src/public/uploads',
                filename: (req, file, cb) => {
                    const filename = Date.now() + extname(file.originalname);
                    cb(null, filename);
                },
            }),
        }),
    )
    async adminEditUser(
        @Body() body: EditUserDto,
        @Param('user_id') user_id: number,
        @UploadedFile() file: Express.Multer.File
    ): Promise<any> {
        await this.userService.updateUser(+user_id, body);
        if (file) {
            await this.fileService.saveCloud(file, "cloud", user_id);
        }    
        
        return ;
    }

    @Delete(':user_id/delete')
    @Roles(['admin'])
    @UseGuards(AuthGuard)
    async adminDeleteUser(
        @Param('user_id') user_id: number
    ): Promise<any> { 
        return await this.userService.deleteUser(user_id);
    }
}