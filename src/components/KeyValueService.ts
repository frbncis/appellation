
import db from './Firestore';

export const collections = {
  room(roomId: string) { return db.collection('rooms').doc(roomId); },
  players(roomId: string) { return db.collection(`rooms/${roomId}/players`); },
  player(roomId: string, playerId?: string) {
    if (playerId) return db.collection(`rooms/${roomId}/players`).doc(playerId);
    return db.collection(`rooms/${roomId}/players`).doc();
  },
  public_player_data(roomId: string, playerId: string, phase: string) {
    return db.collection(`rooms/${roomId}/players/${playerId}/publicGameData`).doc(phase);
  },
  phase(roomId: string, phase: GamePhase) {
    return db.collection(`rooms/${roomId}/phase_${phase.toString()}`);
  },
};

export enum GamePhase {
    Setup,
    Guessing,
    Ended,
}

export interface PlayerData {
  id?: string,
  name?: string,
  teamId?: number,
  teamSequenceId: number,
}

export interface SetupPhaseData {
  hasSubmittedCards: boolean,
  player: PlayerData,
  playerId: string,
}
