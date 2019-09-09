import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import {GamePhase, collections} from '@/components/KeyValueService'
import {db} from '@/components/Firestore';
import { vuexfireMutations, firestoreAction } from 'vuexfire'

import { getRandomIntInclusive, RoomModule } from './modules/room'
import player, { PlayerDeck } from './modules/player';
import players from './modules/players';
// import { State, Module, createVuexStore, Action } from 'vuex-simple';
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'
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

  }
})

export const storeHelpers = {
  room: getModule(RoomModule, store),

  async joinGame(roomId: string) {
    console.log(`Joining room ${roomId}`);
    const roomModule = getModule(RoomModule, store);

    await roomModule.bindReference(roomId);
  }
}

export default store;