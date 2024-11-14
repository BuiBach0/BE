
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {})
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data,
        @ConnectedSocket() client: Socket,
    ) {
        console.log(data);
        
        const { senderId, receiverId, content } = data.data;
        const message = await this.chatService.sendMessage(senderId, receiverId, content);

        
        this.server.emit('receiveMessage', message); 
    }
}
