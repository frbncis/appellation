import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';
import {
  getModule,
} from 'vuex-module-decorators';
import { GamePhase, SetupPhaseData } from '@/components/KeyValueService';

import { RoomModule, getRandomIntInclusive } from './modules/room';
import { PlayerModule } from './modules/player';
import firebase from 'firebase';

Vue.use(Vuex);

// const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  state: {

  },
  modules: {
    room: RoomModule,
    [PlayerModule.ModuleName]: PlayerModule,
  },
  mutations: {
    ...vuexfireMutations,
  },
  actions: {

  },
});

export const storeHelpers = {
  room: getModule(RoomModule, store),
  player: getModule(PlayerModule, store),

  async joinGame(roomId: string) {
    console.log(`Joining room ${roomId}`);

    await this.room.bindRoomReference(roomId);
    await this.room.bindPhaseReference({
      roomId: roomId,
      phase: this.room.data.gamePhase,
    });


  },

  async createGame() {
    const roomId = await this.room.createRoom();

    return roomId;
  },

  async startGame() {
    console.log('Starting game...');

    console.log("Generating turn sequences...");
    await this.room.generateTurnSequences();

    const firstPlayerId = this.room.data.turnSequence[1][0];

    console.log("Updating room data...");
    await this.room.update({ currentTeamTurnId: 1, currentPlayerId: firstPlayerId });

    console.log("Done updating room data...");

    // This need to fire last as the view transition is bound to this.
    await this.room.setPhase({
      roomId: this.room.data.roomId!,
      phase: GamePhase.Guessing,
    });
  },

  async endTurn(remainingCards: Array<number>, scoreTeam1: number, scoreTeam2: number) {
    await this.room.update({ scoreTeam1, scoreTeam2 });

    if (remainingCards.length > 0) {
      await this.room.update({ activeRemainingCards: remainingCards });
      await this.room.setNextPlayer();
    } else {
      // No more cards! Time for a new round.
      await this.room.setNextRound();
    }
  },

  async loadUser() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        console.log(`Firebase authentication succeeded, user ID ${user.uid}.`);

        await storeHelpers.player.setPlayerId(user.uid);

        await new Promise(resolve => setTimeout(()=>resolve(), 1000)).then(()=>console.log("fired"));
        // This feels a little tangled up. Should user.uid be replaced with
        // playerId variable to be more clear?
        console.log(`firebase.auth().onAuthStateChanged() - Room ID is currently ${this.room.data.roomId}.`)
        if (this.room.data.roomId && this.room.data.players.indexOf(user.uid)> -1) {
          storeHelpers.becomePlayer(this.room.data.roomId, user.uid);
        }
      }
    });

    await firebase.auth().signInAnonymously();
  },

  async createPlayer(roomId: string, playerName: string) {
    console.log(`Creating player ${playerName}`);

    const playerId = await this.player.createPlayer({ roomId, playerName });

    await this.room.addPlayer({ roomId, playerId });

    return playerId;
  },

  async becomePlayer(roomId: string, playerId: string) {
    console.log(`Becoming player ${playerId} in room ${roomId}`);

    await this.player.bindReference({ roomId, playerId });
    await this.player.ensureCurrentPhaseDataExists({
      roomId,
      playerId,
      phase: this.room.data.gamePhase,
    });
  },

  async drawSelectionCards() {
    console.log('store.actions.drawSelectionCards');
    const candidateCards = new Array<number>(2).fill(0);

    for (let i = 0; i < candidateCards.length; i++) {
      while (true) {
        const j = getRandomIntInclusive(0, 10);

        if (this.room.data.discard.findIndex(value => value == j) > -1) {
          continue;
        } else if (candidateCards.findIndex(value => value == j) > -1) {
          continue;
        } else {
          candidateCards[i] = <any>j;
          break;
        }
      }
    }

    console.log('got cards ', candidateCards);
    console.log('dispatching room/addToDeck');
    await this.room.addToDeck({ cards: candidateCards, deck: "discard" });

    console.log('dispatching player/addToDeck');
    await this.player.addToDeck({ cards: candidateCards, deck: "selection" });
  },

  async submitSelectionCards(cards: Array<number>) {
    await this.player.submitSelectionCards();
    await this.room.addToDeck({ cards, deck: "selectedCards" });
  },
};

export default store;
