import {
  Module, VuexModule, Mutation, Action,
} from 'vuex-module-decorators';
import { GamePhase, collections } from '@/components/KeyValueService';
import { db } from '@/components/Firestore';
import './firebaseExtensions';
import { FirestoreAction, FirestoreVuexModule } from './FirebaseAction';
import firebase from 'firebase';

export const getRandomIntInclusive = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

interface Cards extends Array<number> {
  
}

class RoomStateCards {
  public selectedCards: Cards = [];
  public activeRemainingCards: Cards = [];
  public activeGuessedCards: Cards = [];
  public discard: Cards = [];
}

export class RoomState extends RoomStateCards {
    public roomId?: string = undefined;
    public isBound: boolean = false;

    public createdAt: Date = new Date();

    public currentTeamTurnId: number = -1;

    public scoreTeam1: number = 0;
    public scoreTeam2: number = 0;

    public gamePhase: GamePhase = GamePhase.Setup;

    public players: Array<string> = [];

    public constructor(init?: Partial<RoomState>) {
      super();

      Object.assign(this, init);
    }

    public getDeck(deckName: string): Cards {
      return (<any>this)[deckName];
    }
}

@Module({ name: 'room', namespaced: true })
export class RoomModule extends FirestoreVuexModule {
    public data: RoomState = new RoomState();

    public phase: Array<any> = [];

    @FirestoreAction
    public async bindRoomReference(roomId: string) {
      console.log('Binding room reference');

      const { bindFirestoreRef } = this.context;

      const roomDocument = db.collection('rooms').doc(roomId);
      await bindFirestoreRef('data', roomDocument);
    }

    @FirestoreAction
    public async bindPhaseReference(payload: { roomId: string, phase: GamePhase }) {
      const { bindFirestoreRef } = this.context;

      const phaseDocument = collections.phase(payload.roomId, payload.phase);

      await bindFirestoreRef('phase', phaseDocument);
    }

    @Action
    public async createRoom() {
      const roomId = getRandomIntInclusive(1000, 9999).toString();
      const roomDocument = collections.room(roomId);

      const room = new RoomState({
        roomId,
        isBound: true,
        // data: Object.assign({}, new RoomData()),
        selectedCards: new Array<number>(),
        activeRemainingCards: new Array<number>(),
        activeGuessedCards: new Array<number>(),
        discard: new Array<number>(),
        players: [],
      });

      await roomDocument.set(Object.assign({}, room));

      return roomId;
    }

    @Action
    public async setPhase(payload: { roomId: string, phase: GamePhase}) {
      return collections.room(payload.roomId).update({ data: { phase: payload.phase.toString() } });
    }

    @Action
    public async addPlayer(payload: { roomId: string, playerId: string }) {
      const { roomId, playerId } = payload;

      console.log(`room.addPlayer() - adding player ${playerId} to room ${roomId}`);
      const roomDocument = await collections.room(roomId);

      const players = [...this.data.players];

      console.log(players);

      players.push(playerId);

      await roomDocument.update({ players });
    }

    @Action
    public addToDeck(payload: { cards: Array<number>, deck: keyof RoomStateCards }) {
      if (!this.data.roomId) {
        throw new Error('Room ID not set.');
      }

      const { cards, deck } = payload;

      console.log(`room.actions.addToDeck(): Adding to deck ${deck}`, cards);

      const room = new RoomState(this.data);

      return db.collection('rooms').doc(this.data.roomId!).update({
        [deck]: firebase.firestore.FieldValue.arrayUnion(...cards),
      });
    }

    @Mutation
    public setRoomId(id: number) {
      this.data.roomId = id.toString();
    }
}
