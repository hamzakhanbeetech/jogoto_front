import {Socket} from 'ngx-socket-io';
import {Injectable} from '@angular/core';

@Injectable()
export class SocketService {

  constructor(private _socket: Socket) {
  }

  public notification = this._socket.fromEvent<any>('getCount');

  public sendDataViaSocket(): void {
    this._socket.emit('getCounts', {name: 'test'});
  }
}
