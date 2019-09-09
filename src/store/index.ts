import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { vuexfireMutations, firestoreAction } from 'vuexfire';
import {
  Module, VuexModule, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import { GamePhase, collections } from '@/components/KeyValueService';
import { db } from '@/components/Firestore';

import { getRandomIntInclusive, RoomModule } from './modules/room';
import player, { PlayerDeck } from './modules/player';
import players from './modules/players';
// import { State, Module, createVuexStore, Action } from 'vuex-simple';
import AppellationRootModule from './modules/root';

Vue.use(Vuex);

// const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  state: {

  },
  modules: {
    appellation: AppellationRootModule,
    room: RoomModule,
  },
  mutations: {
    ...vuexfireMutations,
  },
  actions: {

  },
});

export const storeHelpers = {
  room: getModule(RoomModule, store),

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

    const playerId = await context.dispatch('player/createPlayer', { roomId, playerName });

    await context.dispatch('room/addPlayer', { roomId, playerId });

    return playerId;
  },
};

export default store;
