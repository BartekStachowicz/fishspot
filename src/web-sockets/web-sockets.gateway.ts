import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: '*' })
@Injectable()
export class DatesGateway {
  @WebSocketServer()
  server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: any): any {
    this.server.emit('message', message);

    console.log(message);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: WebSocket): void {
    console.log(`Client ${client} disconnected.`);
  }
}
