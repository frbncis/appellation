import {
  Module, Mutation, Action,
} from 'vuex-module-decorators';
import firebase from 'firebase';
import { GamePhase, collections, SetupPhaseData } from '@/components/KeyValueService';
import db from '@/components/Firestore';
import './firebaseExtensions';
import { FirestoreAction, FirestoreVuexModule } from './FirebaseAction';
import RoomState from './RoomState';
import RoomStateCards from './RoomStateCards';
import Sequences from './Sequences';

export const getRandomIntInclusive = (min: number, max: number) => {
  let currentMin = min;
  let currentMax = max;

  currentMin = Math.ceil(currentMin);
  currentMax = Math.floor(currentMax);
  return Math.floor(Math.random() * (currentMax - currentMin + 1)) + min;
};

@Module({ name: 'room', namespaced: true })
export class RoomModule extends FirestoreVuexModule {
    public data: RoomState = new RoomState();

    /**
     * Returns data specific to the current phase of the game.
     */
    public phase: Array<any> = [];

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
      console.log('Room module - createRoom()');

      const roomId = getRandomIntInclusive(1000, 9999).toString();

      console.log('Room module - createRoom() getting document');
      const roomDocument = collections.room(roomId);

      const room = new RoomState({
        roomId,
        isBound: true,
        selectedCards: [],
        activeRemainingCards: [],
        activeGuessedCards: [],
        discard: [],
        players: [],
      });

      console.log('Room module - createRoom() saving room document');

      try {
        await roomDocument.set(Object.assign({}, room));
      } catch (err) {
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
      let scoreUpdate: Partial<RoomState> = {};

      if (!this.data.roomId) {
        throw new Error('Room ID was not set in the state store.');
      }

      if (!this.data.currentTeamTurnId) {
        throw new Error('No active team ID is set in the state store.');
      }

      if (this.data.currentTeamTurnId === 1) {
        scoreUpdate = { scoreTeam1: this.data.scoreTeam1 + 1 };
      } else {
        scoreUpdate = { scoreTeam2: this.data.scoreTeam2 + 1 };
      }

      return collections.room(this.data.roomId).update(scoreUpdate);
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

      const d = <Partial<RoomState>>{ turnSequence };

      console.log(d);
      return this.document.update(d);
    }

    @Action
    public async setNextPlayer() {
      console.log('RoomModule.setNextPlayer() - called.');

      let turnData: {
        previousPlayerId: string,
        currentPlayerId: string,
        currentTeamTurnId: number
      } | null;

      turnData = null;

      // No active player, this is the first turn.
      if (this.data.currentPlayerId === '') {
        // turnSequence is indexed by team IDs.
        const firstPlayerId = this.data.turnSequence[1][0];

        turnData = {
          previousPlayerId: firstPlayerId,
          currentPlayerId: firstPlayerId,
          currentTeamTurnId: 0,
        };
      } else if (this.data.players.length === 1) {
        const { currentPlayerId } = this.data;
        const currentPlayerTeamId = this.data.currentTeamTurnId;
        turnData = {
          previousPlayerId: currentPlayerId!,
          currentPlayerId: currentPlayerId!,
          currentTeamTurnId: currentPlayerTeamId!,
        };
      } else {
        const { previousPlayerId, currentPlayerId, currentTeamTurnId } = this.data;

        const nextTeamId = currentTeamTurnId === 1 ? 2 : 1;
        const nextTeamSequence = this.data.turnSequence[nextTeamId];

        let nextPlayerId;

        if (!previousPlayerId) {
          /* eslint-disable-next-line */
          nextPlayerId = nextTeamSequence[0];
        } else {
          const previousPlayerIndex = nextTeamSequence.indexOf(previousPlayerId);

          const nextPlayerIndex = (previousPlayerIndex + 1) % nextTeamSequence.length;
          nextPlayerId = this.data.turnSequence[nextTeamId][nextPlayerIndex];
        }

        turnData = {
          previousPlayerId: currentPlayerId!,
          currentPlayerId: nextPlayerId,
          currentTeamTurnId: nextTeamId,
        };
      }

      await this.update({
        ...turnData,
        currentPlayer: <any>collections.player(this.data.roomId!, turnData.currentPlayerId!),
      });
    }

    @Action
    public setScores(payload: { 1: number, 2: number }) {
      console.log('RoomModule.setScores() called', payload);

      return this.document.update(<Partial<RoomStateCards>>{
        scoreTeam1: payload[1],
        scoreTeam2: payload[2],
      });
    }

    @Action
    public increaseScore(payload: { teamId: number, pointsEarned: number}) {
      console.log('RoomModule.increaseScore() called.', payload);

      if (payload.teamId === 1) {
        return this.document.update(<Partial<RoomStateCards>>{
          scoreTeam1: this.data.scoreTeam1 + payload.pointsEarned,
        });
      }
      return this.document.update(<Partial<RoomStateCards>>{
        scoreTeam2: this.data.scoreTeam2 + payload.pointsEarned,
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
        activeRemainingCards,
      });

      // Set the next player.
      const update2 = this.setNextPlayer();

      await Promise.all([
        update1,
        update2
      ]);
    }

    @Action
    public async setDrawDeck(cardIds: Array<number>) {
      console.log('RoomModule.setDrawDeck() - Setting the active deck.', cardIds);

      await this.document.update({
        activeRemainingCards: cardIds,
      });
    }

    @Mutation
    public setRoomId(id: number) {
      this.data.roomId = id.toString();
    }
}
