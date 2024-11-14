import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('files')
export class File{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    url: string;
    @Column()
    location: string;

    @ManyToOne(() => User, (user) => user.files)
    user: User;
}