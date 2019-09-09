import { firestoreAction } from 'vuexfire';
import { PlayerData, collections, GamePhase } from '@/components/KeyValueService';
import { db } from '@/components/Firestore';

export enum PlayerDeck {
    selection
}

const state = {
  playerId: undefined,
  name: undefined,
  roomId: undefined,
  room: undefined,
  teamId: -1,
  decks: {
    selection: new Array<number>(),
  },
};

const actions = {
  createPlayer: firestoreAction(async (context, { roomId, playerName }) => {
    console.log(`player.createPlayer() Creating player for ${playerName} in ${roomId}`);
    let team1PlayerCount = 0;
    let team2PlayerCount = 0;

    (await collections.players(roomId).get()).forEach(async (p) => {
      const teamId = p.get('teamId');

      if (teamId == 1) {
        team1PlayerCount++;
      } else {
        team2PlayerCount++;
      }
    });

    const assignedTeamId = team1PlayerCount < team2PlayerCount ? 1 : 2;

    const playerDocument = collections.player(roomId, undefined);

    const player = {
      playerId: playerDocument.id,
      name: playerName,
      roomId,
      room: collections.room(roomId),
      teamId: assignedTeamId,
      decks: {
        selection: new Array<number>(),
      },
    };

    await playerDocument.set(player);

    return playerDocument.id;
  }),
  addToDeck: firestoreAction(async ({ state }, { cards, deck }) => {
    console.log(`player.addToDeck(): Adding to deck '${deck}'`, cards);

    const { roomId } = state;
    const { playerId } = state;

    const newDeck = state.decks[deck].concat(cards);
    const allDecks = Object.assign({}, state.decks, { [deck]: newDeck });

    const player = collections.player(roomId, playerId);

    return player.update({ decks: allDecks });
  }),
  switchTeam: async (context) => {
    const currentTeamId = context.state.teamId;

    const newTeamId = currentTeamId == 1 ? 2 : 1;

    return collections.player(
      context.state.roomId,
      context.state.playerId,
    ).update({ teamId: newTeamId });
  },
  submitSelectionCards: async (context) => {
    const { roomId } = context.state;
    const { playerId } = context.state;

    console.log(`Submitting selection cards for player ${playerId} in room ${roomId}`);

    const phaseData = collections.phase(roomId, GamePhase.Setup.toString()).doc(playerId);

    return phaseData.update({ hasSubmittedCards: true });
  },
  ensureCurrentPhaseDataExists: async (context, { roomId, playerId, phase }) => {
    // TODO: This should do a check to see if the data actually exists before writing to it
    // since this does a full replace.
    if (phase == GamePhase.Setup) {
      await collections.phase(
        roomId,
        GamePhase.Setup.toString(),
      ).doc(playerId).set({
        playerId,
        player: collections.player(roomId, playerId),
        hasSubmittedCards: false,
      });
    }
  },
};

const mutations = {
  setRoomId(state: any, id: number) {
    state.id = id;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  getters: {},
  mutations,
};
