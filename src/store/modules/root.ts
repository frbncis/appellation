import {
  Module, VuexModule, Mutation, Action, getModule,
} from 'vuex-module-decorators';
import { Store } from 'vuex';
import store from '@/store';
import { db } from '@/components/Firestore';
import { FirestoreAction, FirestoreVuexModule } from './FirebaseAction';
import { collections } from '@/components/KeyValueService';
import { RoomModule } from './room';

// @Module({ name: 'appellation', namespaced: true })
export default class AppellationRootModule extends VuexModule {
    public room: any = null;
    // @State()
    // public state: Array<any> = [];

    // @Module()
    //   public room = RoomModule;

  // @Module()
  // public player = new PlayerModule();
  @FirestoreAction
    public async joinGame(roomId: string) {
      const { bindFirestoreRef } = this.context;
      console.log(`Joining room ${roomId}`);
      const roomDocument = db.collection('rooms').doc(roomId);
      await bindFirestoreRef('room', roomDocument);

      // const phase = this.room.data.phase;
      // console.log(`Room ID ${roomId} is in phase ${phase}`);

    // await bindFirestoreRef('phase', collections.phase(roomId, phase))
    }

  // // @Action()
  // public internalJoinGame = firestoreAction(async (context, roomId: string) => {
  //   console.log(`Joining room ${roomId}`);

  //   const roomDocument = db.collection('rooms').doc(roomId);
  //   await context.bindFirestoreRef('room', roomDocument);

  //   const phase = this.context.state.room.data.phase;
  //   console.log(`Room ID ${roomId} is in phase ${phase}`);

  //   await context.bindFirestoreRef('phase', collections.phase(roomId, phase))
  // });
}

// const store = {
//   modules: {
//     // room,
//     player,
//     // players,
//   },
//   state: {
//     phase: [],
// },
//   mutations: {
//     ...vuexfireMutations,
//   },
//   actions: {
//     createGame: async (context) => {
//       const roomId = await context.dispatch('room/createRoom');

//       return roomId;
//     },
//     joinGame: firestoreAction(async (context, roomId) => {
//         console.log(`Joining room ${roomId}`);

//         const roomDocument = db.collection('rooms').doc(roomId);
//         await context.bindFirestoreRef('room', roomDocument);

//         const phase = context.state.room.data.phase;
//         console.log(`Room ID ${roomId} is in phase ${phase}`);

//         await context.bindFirestoreRef('phase', collections.phase(roomId, phase))
//     }),
//     startGame: async (context) => {
//       console.log("Starting game...");
//       return context.dispatch('room/setPhase', { roomId: context.state.room.roomId, phase: GamePhase.Guessing });
//     },
//     createPlayer: async (context, { roomId, playerName }): Promise<string> => {
//       console.log(`Creating player ${playerName}`);

//       const playerId = await context.dispatch('player/createPlayer', { roomId, playerName });

//       await context.dispatch('room/addPlayer', { roomId, playerId });

//       return playerId;
//     },
//     becomePlayer: firestoreAction(async (context, { roomId, playerId }) => {
//       console.log(`Becoming player ${playerId} in room ${roomId}`);

//       await context.bindFirestoreRef('player', collections.player(roomId, playerId));
//       await context.dispatch('player/ensureCurrentPhaseDataExists', { phase: context.state.room.data.phase, playerId, roomId });
//     }),
//     drawSelectionCards: firestoreAction(async context => {
//       console.log('store.actions.drawSelectionCards')
//       const candidateCards = new Array<number>(2).fill(0);

//       for (let i = 0; i < candidateCards.length; i++) {
//         while (true) {
//             const j = getRandomIntInclusive(0, 10);

//             if (context.state.room.decks.discard.findIndex((value) => value == j) > -1) {
//                 continue;
//             }
//             else if (candidateCards.findIndex((value) => value == j) > -1) {
//                 continue;
//             }
//             else {
//                 candidateCards[i] = <any>j;
//                 break;
//             }
//         }
//       }

//       console.log('got cards ', candidateCards);
//       console.log('dispatching room/addToDeck');
//       await context.dispatch('room/addToDeck', { cards: candidateCards, deck: 'discard'});

//       console.log('dispatching player/addToDeck');
//       await context.dispatch('player/addToDeck', { cards: candidateCards, deck: 'selection' })
//     }),
//     submitSelectionCards: async (context, cards) => {
//       await context.dispatch('player/submitSelectionCards');
//       await context.dispatch('room/addToDeck', { cards: cards, deck: 'selected' })
//     }
//   }
// }

// export default getModule(AppellationRootModule);
