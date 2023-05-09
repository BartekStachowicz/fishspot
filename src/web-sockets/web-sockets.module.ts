import { Module } from '@nestjs/common';
import { WebSocketsService } from './web-sockets.service';
import { WebSocketsController } from './web-sockets.controller';
import { DatesGateway } from './web-sockets.gateway';

@Module({
  providers: [WebSocketsService, DatesGateway],
  controllers: [WebSocketsController],
})
export class WebSocketsModule {}
