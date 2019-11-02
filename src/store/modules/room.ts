import {
  Module, VuexModule, Mutation, Action,
} from 'vuex-module-decorators';
import { GamePhase, collections, SetupPhaseData } from '@/components/KeyValueService';
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
    public roomId?: string = '';
    public isBound: boolean = false;

    public createdAt: Date = new Date();

    public currentTeamTurnId?: number = -1;
    public currentPlayerId?: string = '';
    public previousPlayerId?: string = '';

    public guessingPhaseRound = 1;

    public scoreTeam1: number = 0;
    public scoreTeam2: number = 0;

    public turnSequence: Sequences = {
      1: [],
      2: [],
    }

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

interface Sequences {
  [key: number]: Array<string>
}

@Module({ name: 'room', namespaced: true })
export class RoomModule extends FirestoreVuexModule {
    public data: RoomState = new RoomState();

    /**
     * Returns data specific to the current phase of the game.
     */
    public phase: Array<any> = [];

    private _documentCached?: firebase.firestore.DocumentReference = undefined;

    private get document() {
      if (!this.data.roomId) {
        throw new Error('Room ID not set.');
      }

      return collections.room(this.data.roomId);
    }

    @Action
    public update(data: Partial<RoomState>) {
      return this.document.update(data);
    }

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
      console.log("Room module - createRoom()");

      const roomId = getRandomIntInclusive(1000, 9999).toString();

      console.log("Room module - createRoom() getting document");
      const roomDocument = collections.room(roomId);

      const room = new RoomState({
        roomId,
        isBound: true,
        selectedCards: new Array<number>(),
        activeRemainingCards: new Array<number>(),
        activeGuessedCards: new Array<number>(),
        discard: new Array<number>(),
        players: [],
      });

      console.log("Room module - createRoom() saving room document");

      try {
        await roomDocument.set(Object.assign({}, room));
      } catch(err) {
        console.error(err);
        throw err;
      }

      console.log(`Room module - createRoom() returning room ID ${roomId}`);

      return roomId;
    }

    @Action
    public async setPhase(payload: { roomId: string, phase: GamePhase }) {

      await this.update({ gamePhase: payload.phase });
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

    /**
     * Increment the active team's point counter.
     */
    @Action
    public async incrementActiveTeamPoint() {
      if (!this.data.roomId) {
        throw new Error('Room ID was not set in the state store.');
      }

      if (!this.data.currentTeamTurnId) {
        throw new Error('No active team ID is set in the state store.');
      }

      if (this.data.currentTeamTurnId === 1) {
        return collections.room(this.data.roomId).update(<Partial<RoomState>>{ scoreTeam1: this.data.scoreTeam1 + 1});
      } else {
        return collections.room(this.data.roomId).update(<Partial<RoomState>>{ scoreTeam2: this.data.scoreTeam2 + 1});
      }
    }

    @Action
    public async generateTurnSequences() {
      // Assign turn sequence numbers.
      const turnSequence: Sequences = {
        1: [],
        2: [],
      };

      this.phase.forEach((phaseData: SetupPhaseData) => {
        if (!phaseData.player.teamId) {
          throw new Error('Team ID not set.');
        }

        turnSequence[phaseData.player.teamId!].push(phaseData.player.id!);
      });

      var d = <Partial<RoomState>>{ turnSequence }

      console.log(d);
      return this.document.update(d);
    }

    @Action
    public async setNextPlayer() {
      const { previousPlayerId, currentPlayerId, currentTeamTurnId } = this.data;

      const nextTeamId = currentTeamTurnId === 1 ? 2 : 1;
      const nextTeamSequence = this.data.turnSequence[nextTeamId];

      let nextPlayerId;

      if (!previousPlayerId) {
        nextPlayerId = nextTeamSequence[0];
      } else {
        const previousPlayerIndex = nextTeamSequence.indexOf(previousPlayerId);

        const nextPlayerIndex = (previousPlayerIndex + 1) % nextTeamSequence.length;
        nextPlayerId = this.data.turnSequence[nextTeamId][nextPlayerIndex];
      }

      return this.update({
        previousPlayerId: currentPlayerId,
        currentPlayerId: nextPlayerId,
        currentTeamTurnId: nextTeamId,
      });
    }

    /**
     * Setup for a new round. The round counter is incremented, cards are reset, and the next player
     * is set.
     */
    @Action
    public async setNextRound() {
      const guessingPhaseRound = this.data.guessingPhaseRound + 1;
      const activeRemainingCards = this.data.selectedCards;

      // Reset the cards being iterated through to the full deck.
      const update1 = this.document.update(<Partial<RoomState>>{
        guessingPhaseRound,
        activeRemainingCards
      });

      // Set the next player.
      const update2 = this.setNextPlayer();

      await update1;
      await update2;

      return;
    }

    @Mutation
    public setRoomId(id: number) {
      this.data.roomId = id.toString();
    }
}
