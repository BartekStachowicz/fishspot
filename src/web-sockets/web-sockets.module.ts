import { Module } from '@nestjs/common';
import { WebSocketsService } from './web-sockets.service';
import { DatesGateway } from './web-sockets.gateway';
import { SpotsModule } from 'src/spots/spots.module';

@Module({
  imports: [SpotsModule],
  providers: [WebSocketsService, DatesGateway],
  exports: [WebSocketsService],
})
export class WebSocketsModule {}
