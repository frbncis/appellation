import { firestoreAction } from 'vuexfire';
import {
  Module, VuexModule, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import { RoomData, GamePhase, collections } from '@/components/KeyValueService';
import { db } from '@/components/Firestore';
import './firebaseExtensions';
import { FirestoreAction } from './FirebaseAction';
import firebase from 'firebase'

export const getRandomIntInclusive = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

interface RoomDecks extends Decks {
    selected: Array<number>;
    activeRemaining: Array<number>;
    activeGuessed: Array<number>;
    discard: Array<number>;

    [key: string]: Array<number>;
}

interface RoomState {
    roomId?: string,
    isBound: boolean,
    data: RoomData,
    decks: RoomDecks,
    players: Array<string>,
}

@Module({ name: 'room', namespaced: true })
export class RoomModule extends VuexModule {
    public data: RoomState = {
      roomId: undefined,
      isBound: false,
      data: new RoomData(),
      decks: {
        selected: new Array<number>(),
        activeRemaining: new Array<number>(),
        activeGuessed: new Array<number>(),
        discard: new Array<number>(),
      },
      players: new Array<string>(),
    }

    @FirestoreAction
    public async bindReference(roomId: string) {
      console.log('Binding room reference');

      const { bindFirestoreRef } = this.context;

      const roomDocument = db.collection('rooms').doc(roomId);
      await bindFirestoreRef('data', roomDocument);
    }

    @Action
    public async createRoom() {
      const roomId = getRandomIntInclusive(1000, 9999).toString();
      const roomDocument = collections.room(roomId);

      await roomDocument.set({
        roomId,
        isBound: true,
        data: Object.assign({}, new RoomData()),
        decks: {
          selected: new Array<number>(),
          activeRemaining: new Array<number>(),
          activeGuessed: new Array<number>(),
          discard: new Array<number>(),
        },
        players: [],
      });

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

      await roomDocument.update({ players: players });
    }

    @Action
    public addToDeck(payload: { cards: Array<number>, deckSelector: (decks: RoomDecks) => Array<number>}) {
      if (!this.data.roomId) {
        throw new Error('Room ID not set.');
      }

      const { cards, deckSelector } = payload;

      console.log('room.actions.addToDeck(): Adding to deck', cards);

      let allDecks = Object.assign({}, this.data.decks);

      const selectedDeckName =  Object.keys(this.data.decks).filter(key => this.data.decks[key] == deckSelector(allDecks));

      return db.collection('rooms').doc(this.data.roomId!).update({
          [selectedDeckName[0]]: firebase.firestore.FieldValue.arrayUnion(...cards)
      });
    }

    @Mutation
    public setRoomId(id: number) {
      this.data.roomId = id.toString();
    }
}
