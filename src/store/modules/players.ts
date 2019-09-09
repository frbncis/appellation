import { firestoreAction } from 'vuexfire';
import { PlayerData, collections, GamePhase } from '@/components/KeyValueService';
import { db } from '@/components/Firestore';

interface p {
    attributes: Object,
    phaseData: Object,
}

const statePhaseData = {
  francis: null,
};

const actionPhaseData = {
  bindPlayer: firestoreAction((context, { roomId, playerId, phase }) => {
    const collection = collections.public_player_data(roomId, playerId, phase);
    return context.bindFirestoreRef(playerId, collection);
  }),
};

const phaseData = {
  namespaced: true,
  // statePhaseData,
  actionPhaseData,
};

// //

const stateAttributes = {

};


const actionAttributes = {
  bindPlayer: firestoreAction((context, { roomId, playerId }) => {
    const collection = collections.player(roomId, playerId);
    return context.bindFirestoreRef(playerId, collection);
  }),
};

const attributes = {
  namespaced: true,
  stateAttributes,
  actionAttributes,
};


// //


const actions = {
  bindPlayers: firestoreAction(async (context, payload: { playerIds: Array<string>, roomId: string, phase: string }) => {
    // await payload.playerIds.forEach(async playerId => {
    console.log(`Binding player data for player ${playerId} in phase ${payload.phase}`);

    const publicData = collections.public_player_data(payload.roomId, playerId, payload.phase.toString());
    await context.bindFirestoreRef(
      `phaseData_${playerId}`,
      db.collection(`rooms/${roomId}/players`)
        .where('id'),
    );

    const playerAttributes = collections.player(payload.roomId, playerId);
    await context.bindFirestoreRef(`attributes_${playerId}`, playerAttributes);
    // });
  }),
};

const state = {};

const getters = {
  playersAttributes: state => (playerId) => {
    console.log('running player/playersData getter');

    const keys = Object.keys(state).filter(key => key.startsWith('attributes'));

    return keys;
  },
};

export default {
  namespaced: true,
  // modules: {
  //     phaseData,
  //     attributes
  // },
  state,
  actions,
  getters,
  // mutations
};
