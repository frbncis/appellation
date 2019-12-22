import RoomState from './RoomState';
import { PlayerDeck } from './player';

export default interface PlayerState {
  playerId: string | null;
  name: string | null;
  roomId: string | null;
  room?: RoomState | null;
  teamId: number;
  decks: PlayerDeck;
}
