import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';
import {
  getModule,
} from 'vuex-module-decorators';
import { GamePhase } from '@/components/KeyValueService';

import { RoomModule, getRandomIntInclusive } from './modules/room';
// import { State, Module, createVuexStore, Action } from 'vuex-simple';
import AppellationRootModule from './modules/root';
import { PlayerModule } from './modules/player';

Vue.use(Vuex);

// const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  state: {

  },
  modules: {
    appellation: AppellationRootModule,
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
    const roomModule = getModule(RoomModule, store);

    await roomModule.bindReference(roomId);
  },

  async createGame() {
    const roomId = await this.room.createRoom();

    return roomId;
  },

  async startGame() {
    console.log('Starting game...');
    await this.room.setPhase({
      roomId: this.room.data.roomId!,
      phase: GamePhase.Guessing,
    });
  },

  async createPlayer(roomId: string, playerName: string) {
    console.log(`Creating player ${playerName}`);

    const playerId = await this.player.createPlayer({ roomId, playerName });

    await this.room.addPlayer({ roomId, playerId });

    return playerId;
  },

  async becomePlayer(roomId: string, playerId: string) {
    console.log(`Becoming player ${playerId} in room ${roomId}`);

    await this.player.bindReference(roomId, playerId);
    await this.player.ensureCurrentPhaseDataExists(
      roomId,
      playerId,
      this.room.data.data.phase,
    );
  },

  async drawSelectionCards() {
    console.log('store.actions.drawSelectionCards');
    const candidateCards = new Array<number>(2).fill(0);

    for (let i = 0; i < candidateCards.length; i++) {
      while (true) {
        const j = getRandomIntInclusive(0, 10);

        if (this.room.data.decks.discard.findIndex(value => value == j) > -1) {
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
    await this.room.addToDeck({ cards: candidateCards, deckSelector: decks => decks.discard });

    console.log('dispatching player/addToDeck');
    await this.player.addToDeck({ cards: candidateCards, deckSelector: decks => decks.selection });
  },

  async submitSelectionCards(cards: Array<number>) {
    await this.player.submitSelectionCards();
    await this.room.addToDeck({ cards, deckSelector: decks => decks.selected });
  },
};

export default store;
