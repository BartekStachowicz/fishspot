import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BlockedDatesInput, WebSocketsService } from './web-sockets.service';

@WebSocketGateway({ cors: '*' })
@Injectable()
export class DatesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private webSocketsService: WebSocketsService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: { date: string; spotId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`MESSAGE: ${message}`);
    const blockedDates: BlockedDatesInput = {
      clientId: client.id,
      date: message.date,
      spotId: message.spotId,
    };
    const result = this.webSocketsService.setBlockedDates(blockedDates);
    // console.log(`Function setBlockedDates returns: ${JSON.stringify(result)}`);
    this.server.emit('message', result);
  }

  handleDisconnect(client: Socket): void {
    this.webSocketsService.clearBlockedDates(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket): void {
    console.log(`New client connected: ${client.id}`);
    const result = this.webSocketsService.afterConntection();
    // console.log(JSON.stringify(result));
    client.emit('connection', result);
  }
}
