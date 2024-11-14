import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { File } from "./file.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { v4 as uuidv4 } from "uuid"
import path, { dirname, extname } from "path";
import { User } from "src/user/user.entity";
import cloudinary from "src/config/cloudinary.config";

@Injectable()
export class FileService { 
    constructor(
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>
    ) { }
    
    async saveFile(fileName: string, filePath: string, location: string, userId: number): Promise<any> {
        return await this.fileRepository.insert({
            name: fileName,
            url: filePath,
            location,
            user: {
                id: userId
            }
        });
    }

    async saveCloud(file: Express.Multer.File, location: string, userId: number): Promise<any> { 
        const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: 'images',
        });
        const url = uploadResult.secure_url;
        const existingFile = await this.fileRepository.findOne({
            where: { user: { id: userId }, location },
        });
        if (existingFile) {
            await this.fileRepository.delete({ id: existingFile.id });
        }
        return await this.fileRepository.insert({
            name: file.filename,
            url,
            location,
            user: {
                id: userId
            }
        });
    }
}