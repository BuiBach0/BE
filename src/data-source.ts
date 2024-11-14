import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { Role } from './role/role.entity'; 
import { Permission } from './permission/permission.entity';
import { Department } from './department/department.entity';
import * as dotenv from 'dotenv';
import { Student } from './student/student.entity';
dotenv.config({ path: '../.env' });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, Student],
  migrations: ['./migrations/**/*{.ts,.js}'],
  synchronize: false, 
});