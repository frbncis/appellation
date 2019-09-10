import { collections, GamePhase } from '@/components/KeyValueService';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { FirestoreAction } from './FirebaseAction';

export interface PlayerDeck {
    selection: Array<number>
}

export interface PlayerState {
  playerId?: string,
  name?: string,
  roomId?: string,
  room: undefined,
  teamId: number,
  decks: PlayerDeck
}


@Module({ name: PlayerModule.ModuleName, namespaced: true})
export class PlayerModule extends VuexModule {

  static ModuleName: string = 'player';

  public data: PlayerState = {
    playerId: undefined,
    name: undefined,
    roomId: undefined,
    room: undefined,
    teamId: -1,
    decks: {
      selection: new Array<number>(),
    },
  };

  @FirestoreAction
  public async bindReference(roomId: string, playerId: string) {
    await this.context.bindFirestoreRef('player', collections.player(roomId, playerId));
  }

  @Action
  public async createPlayer(payload: { roomId: string, playerName: string}) {
    const { roomId, playerName } = payload;

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
  }

  /**
   * Add cards to a deck.
   * 
   * @param cards Array of the card IDs to add to the deck
   * @param deck Name of the deck to add to.
   */
  @Action
  public async addToDeck(payload: { cards: Array<number>, deckSelector: (decks: PlayerDeck) => Array<number> }) {
    const { cards, deckSelector} = payload;

    console.log(`player.addToDeck(): Adding to deck`, cards);

    const { roomId, playerId } = this.data;

    let allDecks = Object.assign({}, this.data.decks);

    let selectedDeck = deckSelector(allDecks);

    selectedDeck.push(...cards);
    const player = collections.player(roomId!, playerId);

    return player.update({ decks: allDecks });
  }

  @Action
  public async switchTeam() {
    const currentTeamId = this.data.teamId;

    const newTeamId = currentTeamId == 1 ? 2 : 1;

    return collections.player(
      this.data.roomId!,
      this.data.playerId,
    ).update({ teamId: newTeamId });
  }

  @Action
  public async submitSelectionCards() {
    const { roomId, playerId } = this.data;

    console.log(`Submitting selection cards for player ${playerId} in room ${roomId}`);

    const phaseData = collections.phase(roomId!, GamePhase.Setup.toString()).doc(playerId);

    return phaseData.update({ hasSubmittedCards: true });
  }

  @Action
  public async ensureCurrentPhaseDataExists(roomId: string, playerId: string, phase: GamePhase) {
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
  }
}

// const actions = {
  // createPlayer: firestoreAction(async (context, { roomId, playerName }) => {
  //   console.log(`player.createPlayer() Creating player for ${playerName} in ${roomId}`);
  //   let team1PlayerCount = 0;
  //   let team2PlayerCount = 0;

  //   (await collections.players(roomId).get()).forEach(async (p) => {
  //     const teamId = p.get('teamId');

  //     if (teamId == 1) {
  //       team1PlayerCount++;
  //     } else {
  //       team2PlayerCount++;
  //     }
  //   });

  //   const assignedTeamId = team1PlayerCount < team2PlayerCount ? 1 : 2;

  //   const playerDocument = collections.player(roomId, undefined);

  //   const player = {
  //     playerId: playerDocument.id,
  //     name: playerName,
  //     roomId,
  //     room: collections.room(roomId),
  //     teamId: assignedTeamId,
  //     decks: {
  //       selection: new Array<number>(),
  //     },
  //   };

  //   await playerDocument.set(player);

  //   return playerDocument.id;
  // }),
  // addToDeck: firestoreAction(async ({ state }, { cards, deck }) => {
  //   console.log(`player.addToDeck(): Adding to deck '${deck}'`, cards);

  //   const { roomId } = state;
  //   const { playerId } = state;

  //   const newDeck = state.decks[deck].concat(cards);
  //   const allDecks = Object.assign({}, state.decks, { [deck]: newDeck });

  //   const player = collections.player(roomId, playerId);

  //   return player.update({ decks: allDecks });
  // }),
  // switchTeam: async (context) => {
  //   const currentTeamId = context.state.teamId;

  //   const newTeamId = currentTeamId == 1 ? 2 : 1;

  //   return collections.player(
  //     context.state.roomId,
  //     context.state.playerId,
  //   ).update({ teamId: newTeamId });
  // },
  // submitSelectionCards: async (context) => {
  //   const { roomId } = context.state;
  //   const { playerId } = context.state;

  //   console.log(`Submitting selection cards for player ${playerId} in room ${roomId}`);

  //   const phaseData = collections.phase(roomId, GamePhase.Setup.toString()).doc(playerId);

  //   return phaseData.update({ hasSubmittedCards: true });
  // },
  // ensureCurrentPhaseDataExists: async (context, { roomId, playerId, phase }) => {
  //   // TODO: This should do a check to see if the data actually exists before writing to it
  //   // since this does a full replace.
  //   if (phase == GamePhase.Setup) {
  //     await collections.phase(
  //       roomId,
  //       GamePhase.Setup.toString(),
  //     ).doc(playerId).set({
  //       playerId,
  //       player: collections.player(roomId, playerId),
  //       hasSubmittedCards: false,
  //     });
  //   }
  // },
// };

// const mutations = {
//   setRoomId(state: any, id: number) {
//     state.id = id;
//   },
// };

// export default {
//   namespaced: true,
//   state,
//   actions,
//   getters: {},
//   mutations,
// };
