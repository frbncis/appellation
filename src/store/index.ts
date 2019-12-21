import Vue from 'vue';
import Vuex from 'vuex';
import { vuexfireMutations } from 'vuexfire';
import {
  getModule,
} from 'vuex-module-decorators';
import firebase from 'firebase';
import { GamePhase, SetupPhaseData } from '@/components/KeyValueService';

import { RoomModule, getRandomIntInclusive } from './modules/room';
import PlayerModule from './modules/player';
import Cards from '@/data/Cards';

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
      roomId,
      phase: this.room.data.gamePhase,
    });
  },

  async createGame() {
    const roomId = await this.room.createRoom();

    return roomId;
  },

  async startGame() {
    console.log('Starting game...');

    console.log('Generating turn sequences...');
    await this.room.generateTurnSequences();

    console.log('Setting room turn data...');
    await this.room.setNextPlayer();

    console.log('Setting cards to be played with');
    await this.room.update({ activeRemainingCards: this.room.data.selectedCards });

    console.log('Done updating room data...');

    // This need to fire last as the view transition is bound to this.
    await this.room.setPhase({
      roomId: this.room.data.roomId!,
      phase: GamePhase.Guessing,
    });

    await this.room.bindPhaseReference({
      roomId: this.room.data.roomId!,
      phase: GamePhase.Guessing,
    });
  },

  async endTurn() {
    console.log('storeHelpers.endTurn() called');
    await this.room.update({ turnStarted: 0 });

    if (this.room.data.activeRemainingCards.length > 0) {
      console.log('There are cards in the draw pile, shuffling cards and setting next player.');
      
      await this.room.update({
        activeRemainingCards: this.shuffle(this.room.data.selectedCards)
      });

      await this.room.setNextPlayer();
    } else {
      console.log('End of round.');
      await this.room.setNextRound();
    }
  },

  async turnStarted() {
    this.room.update({ turnStarted: Date.now() });
  },

  async loadUser() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        console.log(`Firebase authentication succeeded, user ID ${user.uid}.`);

        await storeHelpers.player.setPlayerId(user.uid);

        await new Promise(resolve => setTimeout(() => resolve(), 1000)).then(() => console.log('fired'));
        // This feels a little tangled up. Should user.uid be replaced with
        // playerId variable to be more clear?
        console.log(`firebase.auth().onAuthStateChanged() - Room ID is currently ${this.room.data.roomId}.`);
        if (this.room.data.roomId && this.room.data.players.indexOf(user.uid) > -1) {
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

  isInPile(cardPile: Array<number>, cardIndex: number): boolean {
    return cardPile.findIndex(value => value === cardIndex) > -1;
  },

  async drawSelectionCards() {
    console.log('store.actions.drawSelectionCards');
    const candidateCards = new Array<number>(10).fill(0);

    let x = 0;

    for (let i = 0; i < candidateCards.length; i += 1) {
      while (x !== 100) {
        const j = getRandomIntInclusive(0, Cards.length - 1);
        x += 1;

        if (!this.isInPile(this.room.data.discard, j) && !this.isInPile(candidateCards, j)) {
          candidateCards[i] = <any>j;
          break;
        }
      }
    }

    console.log('got cards ', candidateCards);
    console.log('dispatching room/addToDeck');
    await this.room.addToDeck({ cards: candidateCards, deck: 'discard' });

    console.log('dispatching player/addToDeck');
    await this.player.addToDeck({ cards: candidateCards, deck: 'selection' });
  },

  async submitSelectionCards(cards: Array<number>) {
    await this.player.submitSelectionCards();
    await this.room.addToDeck({ cards, deck: 'selectedCards' });
  },
  /**
   * Shuffles array in place. ES6 version
   * @param {Array} a items An array containing the items.
   */
  shuffle(a: Array<any>) {
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
};

export default store;
