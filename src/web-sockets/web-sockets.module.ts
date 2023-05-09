import { Module } from '@nestjs/common';
import { WebSocketsService } from './web-sockets.service';
import { WebSocketsController } from './web-sockets.controller';

@Module({
  providers: [WebSocketsService],
  controllers: [WebSocketsController],
})
export class WebSocketsModule {}
