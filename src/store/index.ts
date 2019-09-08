import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import firebase, { firestore } from 'firebase';
import {RoomData, GamePhase, PlayerData, collections} from '@/components/KeyValueService'
import {db} from '@/components/Firestore';
import { vuexfireMutations, firestoreAction } from 'vuexfire'

import room, { getRandomIntInclusive } from './modules/room'
import player, { PlayerDeck } from './modules/player';
import players from './modules/players';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

const store = {
  modules: {
    room,
    player,
    // players,
  },
  state: {
    phase: [],
  },
  mutations: {
    ...vuexfireMutations,
  },
  actions: {
    createGame: async (context) => {
      const roomId = await context.dispatch('room/createRoom');

      return roomId;
    },
    joinGame: firestoreAction(async (context, roomId) => {
        console.log(`Joining room ${roomId}`);

        const roomDocument = db.collection('rooms').doc(roomId);
        await context.bindFirestoreRef('room', roomDocument);

        const phase = context.state.room.data.phase;
        console.log(`Room ID ${roomId} is in phase ${phase}`);

        await context.bindFirestoreRef('phase', collections.phase(roomId, phase))
    }),
    startGame: async (context) => {
      console.log("Starting game...");
      return context.dispatch('room/setPhase', { roomId: context.state.room.roomId, phase: GamePhase.Guessing });
    },
    createPlayer: async (context, { roomId, playerName }): Promise<string> => {
      console.log(`Creating player ${playerName}`);

      const playerId = await context.dispatch('player/createPlayer', { roomId, playerName });

      await context.dispatch('room/addPlayer', { roomId, playerId });

      return playerId;
    },
    becomePlayer: firestoreAction(async (context, { roomId, playerId }) => {
      console.log(`Becoming player ${playerId} in room ${roomId}`);

      await context.bindFirestoreRef('player', collections.player(roomId, playerId));
      await context.dispatch('player/ensureCurrentPhaseDataExists', { phase: context.state.room.data.phase, playerId, roomId });
    }),
    drawSelectionCards: firestoreAction(async context => {
      console.log('store.actions.drawSelectionCards')
      const candidateCards = new Array<number>(2).fill(0);

      for (let i = 0; i < candidateCards.length; i++) {
        while (true) {
            const j = getRandomIntInclusive(0, 10);

            if (context.state.room.decks.discard.findIndex((value) => value == j) > -1) {
                continue;
            }
            else if (candidateCards.findIndex((value) => value == j) > -1) {
                continue;
            }
            else {
                candidateCards[i] = <any>j;
                break;
            }
        }
      }

      console.log('got cards ', candidateCards);
      console.log('dispatching room/addToDeck');
      await context.dispatch('room/addToDeck', { cards: candidateCards, deck: 'discard'});

      console.log('dispatching player/addToDeck');
      await context.dispatch('player/addToDeck', { cards: candidateCards, deck: 'selection' })
    }),
    submitSelectionCards: async (context, cards) => {
      await context.dispatch('player/submitSelectionCards');
      await context.dispatch('room/addToDeck', { cards: cards, deck: 'selected' })
    }
  }
  // state: {
  //   player: {
  //     id: undefined,
  //     name: undefined,
  //     teamId: undefined,
  //     hasSubmittedCards: false,
  //   }
  // },
  // mutations: {

  // },
  // actions: {
  //   // bindRoomRef: firestoreAction(context => {
  //   //   return context.bindFirestoreRef('room', db.collection('rooms').doc('7019'))
  //   // }),
  //   bindPlayerRef: firestoreAction(({ bindFirestoreRef }, playerId) => {
  //       const roomId = context.state.room.id;
  //       let player;

  //       if (playerId)
  //         player = db.collection(`rooms/${roomId}/players`).doc(playerId);
  //       else
  //         player = db.collection(`rooms/${roomId}/players`).doc();

  //       return bindFirestoreRef('player', db.collection('rooms').doc('7019'))
  //   })
  // }
}


export default new Vuex.Store(store);
