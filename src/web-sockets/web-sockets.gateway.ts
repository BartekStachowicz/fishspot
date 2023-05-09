import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BlockedDates, WebSocketsService } from './web-sockets.service';

@WebSocketGateway({ cors: '*' })
@Injectable()
export class DatesGateway {
  constructor(private webSocketsService: WebSocketsService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string[],
    @ConnectedSocket() client: Socket,
  ) {
    const blockedDates: BlockedDates = {
      clientId: client.id,
      dates: message,
    };
    const result = this.webSocketsService.setBlockedDates(blockedDates);
    console.log(`Function setBlockedDates returns: ${result}`);
    this.server.emit('message', result);
    console.log(`Client: ${client.id} send: ${message}`);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: Socket): void {
    this.webSocketsService.clearBlockedDates(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('connection')
  handleConnection(client: Socket): void {
    console.log(`New client connected: ${client.id}`);
  }
}
