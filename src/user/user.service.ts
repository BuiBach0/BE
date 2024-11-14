import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { UserLoginDto } from "./dto/userLogin.dto";
import { DepartmentService } from "src/department/department.service";
import { CreateUserDto } from "./dto/createUser.dto";
import * as bcrypt from "bcrypt";
import { RoleService } from "src/role/role.service";
import { EditUserDto } from "./dto/editUser.dto";
import { ChangeUsernamePasswordDto } from "./dto/changeUsernamePassword.dto";
import { RedisService } from "src/redis/redis.service";
import { totalmem } from "os";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly roleService: RoleService,
        private readonly departmentService: DepartmentService,
    ) { }

    async checkExistingUser(username: string): Promise<any> {
        return await this.userRepository.findOne({
            where: { username },
            relations: ['role', 'department', 'files'],
        });
    }

    async createUser(createUserDto: CreateUserDto): Promise<any> {
        const { password, username, roleId, departmentId, dob, ...rest } = createUserDto;
        const [role, department] = await Promise.all([
            this.roleService.findOne(roleId),
            this.departmentService.findOne(departmentId)
        ])
        const existingUser = await this.checkExistingUser(username);
        if (existingUser) {
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
        }
        const hashPassword: string = await bcrypt.hash(createUserDto.password, 10);
        const dateInUTC = new Date(dob);
        const dateInLocalTime = new Date(dateInUTC.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
        const newUser = this.userRepository.create({
            ...rest,
            dob: dateInLocalTime,
            role,
            department,
            username,
            password: hashPassword
        })
        return await this.userRepository.save(newUser);
    }

    async getTeacherOfDepartment(dep_id: number, page: number = 1, limit: number = 10): Promise<any> {
        const [users, total] = await this.userRepository.createQueryBuilder('user')
            .innerJoin('user.department', 'department')
            .innerJoin('teachers', 'teacher', 'teacher.userId = user.id')
            .select([
                'user.id', 
                'user.first_name',
                'user.last_name',
                'user.dob',
                'user.address',
                'user.gender',
            ])
            .where('department.id = :dep_id', { dep_id })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        const data = {
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
        return data;
    }

    async getStudentOfDepartment(dep_id: number, page: number = 1, limit: number = 10): Promise<any> {
        const [users, total] = await this.userRepository.createQueryBuilder('user')
            .innerJoin('user.department', 'department')
            .innerJoin('user.student', 'student')
            .select([
                'user.id',
                'user.first_name',
                'user.last_name',
                'user.dob',
                'user.address',
                'user.gender',
            ])
            .where('department.id = :dep_id', { dep_id })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        const data = {
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
        return data;
    }

    async checkExistingToken(token: string, type: any): Promise<User> {
        let user: User;
        if (type === 'access_token') {
            user = await this.userRepository.findOne({
                where: {
                    access_token: token
                }
            })
        } else {
            user = await this.userRepository.findOne({
                where: {
                    refresh_token: token
                }
            })
        }
        return user;
    }
    async getAll() {
        return this.userRepository.find({
            relations: {
                role: true
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                gender: true,
                dob: true,
                address: true
            }
        })
    }

    async updateToken(userId: number, access_token: string, refresh_token: string): Promise<any> {
        return await this.userRepository.createQueryBuilder().update(User)
            .set({ access_token, refresh_token }).where("id = :id", { id: userId }).execute();
    }

    async updateAccessToken(userId: number, access_token: string): Promise<any> {
        return await this.userRepository.createQueryBuilder().update(User)
            .set({ access_token }).where("id = :id", { id: userId }).execute();
    }

    async getUserById(userId: number): Promise<User> {
        return this.userRepository.findOne({
            select: {
                id: true,
                first_name: true,
                last_name: true,
                dob: true,
                gender: true,
                address: true,
            },
            relations: {
                role: true,
                files: true
            },
            where: {
                id: userId
            }
        })
    }

    async updateUser(userId: number, editUserDto: EditUserDto): Promise<any> {
        const { first_name, last_name, gender, dob, address } = editUserDto;
        return await this.userRepository.createQueryBuilder().update({
            first_name, last_name, gender, dob, address
        }).where("id = :id", { id: userId }).execute();
    }

    async deleteUser(userId: number): Promise<any> {
        return await this.userRepository.createQueryBuilder()
            .softDelete().where("id = :id", { id: userId }).execute();
    }

    private async checkOldPassword(userId: number, oldPassword: string): Promise<boolean> {
        const user = await this.userRepository.findOne({
            select: ['password'],
            where: {
                id: userId
            }
        }
        )
        return oldPassword == user.password;
    }

    async changeUsernameAndPassword(userId: number, changePasswordDto: ChangeUsernamePasswordDto): Promise<any> {
        const { username, oldPassword, newPassword, confirmPassword } = changePasswordDto;
        const existUsername = await this.userRepository.findOneBy({ username });
        if (existUsername && userId !== existUsername.id) {
            throw new HttpException(`User ${username} already exists`, HttpStatus.BAD_REQUEST);
        }
        const checkOldPassword = await this.checkOldPassword(userId, oldPassword);
        if (!checkOldPassword) { 
            throw new HttpException("Invalid password", HttpStatus.NOT_FOUND);
        }
        if (newPassword !== confirmPassword) {
            throw new HttpException('Password and Confirm Password must be same', HttpStatus.BAD_REQUEST);
        }
        const hashPassword = newPassword;
        return await this.userRepository.createQueryBuilder().update({ password: hashPassword })
            .where("id = :id", { id: userId }).execute();
    }

    async deleteToken(userId: number): Promise<any> {
        return await this.userRepository.createQueryBuilder().update(User)
            .set({
                access_token: null,
                refresh_token: null
            }).where("id = :id", { id: userId }).execute();
    }

    async searchUserByName(name: string, page: number = 1, limit: number = 10): Promise<any> {
        const nameParts = name.split(/\s+/);
        let firstOrLastName: string | undefined;
        let lastName: string | undefined;
        let firstName: string | undefined;
        if (nameParts.length === 1) {
            firstOrLastName = nameParts[0];
        } else {
            firstName = nameParts.slice(0, -1).join(' ').trim();
            lastName = nameParts[nameParts.length - 1];
        }
        let query = this.userRepository.createQueryBuilder('user');
        if (firstOrLastName) {
            query = query.andWhere('user.first_name LIKE :firstOrLastName',
                { firstOrLastName: `%${firstOrLastName}%` }
            ).orWhere('user.last_name LIKE :firstOrLastName',
                { firstOrLastName: `%${firstOrLastName}%` }
            )
        }
        if (firstName && lastName) {
            query = query.andWhere('user.first_name LIKE :firstName', {
                firstName: `%${firstName}%`
            }).andWhere('user.last_name LIKE :lastName', {
                lastName: `%${lastName}%`
            });
        }
        const [users, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
        return {
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    }

    async searchUserByDob(startDate: Date, endDate: Date, page: number = 1, limit: number = 10): Promise<any> {
        const [users, total] = await this.userRepository.createQueryBuilder('user')
            .where('user.dob BETWEEN :startDate AND :endDate', {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            })
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    }

}
