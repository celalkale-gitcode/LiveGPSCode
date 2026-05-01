import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' }, // Güvenlik için gerçek yayında frontend URL'ni yazabilirsin
})
export class MapGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('konumGonder')
  handleLocation(@MessageBody() data: { id: string; lat: number; lng: number }) {
    // Mesajı alan sunucu, bağlı olan her cihaza (haritaya) fırlatır
    this.server.emit('konumAl', data);
  }
}

