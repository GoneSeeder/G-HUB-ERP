import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'lecture-rooms',
})
export class LectureRoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  afterInit() {
    console.log('WebSocket Gateway สำหรับห้องบรรยายพร้อมใช้งานแล้ว');
  }

  handleConnection(client: Socket) {
    console.log(`มีอุปกรณ์เชื่อมต่อเข้ามา: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`อุปกรณ์ตัดการเชื่อมต่อ: ${client.id}`);
  }

  /**
   * ส่งกระจายข้อมูลการอัปเดตสถานะของห้องบรรยายแบบเรียลไทม์
   * @param roomCode รหัสห้องบรรยาย
   * @param status สถานะใหม่ ('available' | 'arriving' | 'lecturing')
   */
  broadcastRoomStatusChange(roomCode: string, status: string) {
    if (this.server) {
      this.server.emit('room_status_changed', {
        roomCode,
        status,
        timestamp: new Date().toISOString(),
      });
      console.log(`[WebSocket Broadcast] ห้อง ${roomCode} เปลี่ยนสถานะเป็น ${status}`);
    } else {
      console.warn('[WebSocket Warning] ไม่สามารถกระจายข่าวได้เนื่องจาก Server ยังไม่พร้อมทำงาน');
    }
  }
}
