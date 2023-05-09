import { Module } from '@nestjs/common';
import { WebSocketsService } from './web-sockets.service';
import { DatesGateway } from './web-sockets.gateway';

@Module({
  providers: [WebSocketsService, DatesGateway],
  exports: [WebSocketsService],
})
export class WebSocketsModule {}
