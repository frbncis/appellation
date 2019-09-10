// import { firestoreAction } from 'vuexfire';
// import { PlayerData, collections, GamePhase } from '@/components/KeyValueService';
// import { db } from '@/components/Firestore';
// import { VuexModule, Module } from 'vuex-module-decorators';
// import { FirestoreAction } from './FirebaseAction';

// @Module({ name: PlayersModule.ModuleName, namespaced: true })
// export class PlayersModule extends VuexModule {
//   static ModuleName: string = 'players';

//   @FirestoreAction
//   public async bindReference(playerIds: Array<string>, roomId: string) {
//     const { bindFirestoreRef } = this.context;
    
//     console.log(`Binding player data for player ${playerId} in phase ${payload.phase}`);

//     const publicData = collections.public_player_data(roomId, playerId, payload.phase.toString());
//     await bindFirestoreRef(
//       `phaseData_${playerId}`,
//       db.collection(`rooms/${roomId}/players`)
//         .where('id'),
//     );

//     const playerAttributes = collections.player(payload.roomId, playerId);
//     await context.bindFirestoreRef(`attributes_${playerId}`, playerAttributes);
//   }

// }

// // const actions = {
// //   bindPlayers: firestoreAction(async (context, payload: { playerIds: Array<string>, roomId: string, phase: string }) => {
// //     // await payload.playerIds.forEach(async playerId => {
// //     console.log(`Binding player data for player ${playerId} in phase ${payload.phase}`);

// //     const publicData = collections.public_player_data(payload.roomId, playerId, payload.phase.toString());
// //     await context.bindFirestoreRef(
// //       `phaseData_${playerId}`,
// //       db.collection(`rooms/${roomId}/players`)
// //         .where('id'),
// //     );

// //     const playerAttributes = collections.player(payload.roomId, playerId);
// //     await context.bindFirestoreRef(`attributes_${playerId}`, playerAttributes);
// //     // });
// //   }),
// // };

// const state = {};

// const getters = {
//   playersAttributes: state => (playerId) => {
//     console.log('running player/playersData getter');

//     const keys = Object.keys(state).filter(key => key.startsWith('attributes'));

//     return keys;
//   },
// };

// export default {
//   namespaced: true,
//   state,
//   actions,
//   getters,
// };
