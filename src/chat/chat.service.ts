
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) { }

    async sendMessage(senderId: number, receiverId: number, content: string) {
        const message = this.messageRepository.create({ content, sender: { id: senderId }, receiver: { id: receiverId } });
        return await this.messageRepository.save(message);
    }

    async getMessagesBetweenUsers(userId1: number, userId2: number) {
        return this.messageRepository.find({
            where: [
                { sender: { id: userId1 }, receiver: { id: userId2 } },
                { sender: { id: userId2 }, receiver: { id: userId1 } },
            ],
            order: { created_at: 'ASC' },
        });
    }
}
