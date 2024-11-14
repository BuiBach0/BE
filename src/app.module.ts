import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PermissionsModule } from './permission/permission.module';
import { DepartmentModule } from './department/department.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { ClassModule } from './class/class.module';
import { StudentModule } from './student/student.module';
import { SeederModule } from './seeding/seeder.module';
import { User } from './user/user.entity';
import { Student } from './student/student.entity';
import { Class } from './class/class.entity';
import { StudentClass } from './student/studentClass.entity';
import { Teacher } from './teacher/teacher.entity';
import { Grade } from './grade/grade.entity';
import { GradingCriteria } from './grade/gradingCriteria.entity';
import { Role } from './role/role.entity';
import { Permission } from './permission/permission.entity';
import { File } from './file/file.entity';
import { Department } from './department/department.entity';
import { Message } from './chat/message.entity';
import { ChatModule } from './chat/chat.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME, 
      entities: [User, Student, Class, StudentClass, Teacher, Grade, GradingCriteria, Role, Permission, File, Department, Message],
      migrations: ["dist/migration/**/*{.ts,.js}"],
      migrationsTableName: "custom_migration_table",
      timezone: 'UTC +7',
      logging: false 
    }),
    AuthModule,
    UserModule,
    PermissionsModule,
    DepartmentModule,
    RedisModule,
    ClassModule,
    StudentModule,
    SeederModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
