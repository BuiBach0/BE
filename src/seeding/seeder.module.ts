/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/student/student.entity';
import { User } from 'src/user/user.entity';
import { SeedingUser } from './user.seeder';
import { Class } from 'src/class/class.entity';
import { StudentClass } from 'src/student/studentClass.entity';
import { Grade } from 'src/grade/grade.entity';
import { GradingCriteria } from 'src/grade/gradingCriteria.entity';


@Module({
    imports: [TypeOrmModule.forFeature([Student, User, Class, StudentClass, Grade, GradingCriteria])],
    controllers: [],
    providers: [SeedingUser],
    exports: [SeedingUser]
})
export class SeederModule { }
