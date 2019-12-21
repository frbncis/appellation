import {
  Module, Action, Mutation,
} from 'vuex-module-decorators';
import firebase from 'firebase';
import { collections, GamePhase } from '@/components/KeyValueService';
import { FirestoreAction, FirestoreVuexModule } from './FirebaseAction';
import { RoomState } from './RoomState';
import { PlayerState } from './PlayerState';

const moduleName = 'player';

export interface PlayerDeck {
    selection: Array<number>,
}

@Module({ name: moduleName, namespaced: true })
export default class PlayerModule extends FirestoreVuexModule {
  static ModuleName: string = moduleName

  public data: PlayerState = {
    playerId: null,
    name: null,
    roomId: null,
    room: new RoomState(),
    teamId: -1,
    decks: {
      selection: [],
    },
  };

  @FirestoreAction
  public async bindReference(payload: { roomId: string, playerId: string }) {
    const { bindFirestoreRef } = this.context;

    await bindFirestoreRef('data', collections.player(payload.roomId, payload.playerId));
  }

  @Action
  public async createPlayer(payload: { roomId: string, playerName: string}) {
    const { roomId, playerName } = payload;

    console.log(`player.createPlayer() Creating player named ${playerName} in ${roomId} with player ID ${this.data.playerId}`);
    let team1PlayerCount = 0;
    let team2PlayerCount = 0;

    (await collections.players(roomId).get()).forEach(async (p) => {
      const teamId = p.get('teamId');

      if (teamId === 1) {
        team1PlayerCount += 1;
      } else {
        team2PlayerCount += 1;
      }
    });

    let assignedTeamId;

    if (team1PlayerCount === 0 && team2PlayerCount === 0) {
      assignedTeamId = 1;
    } else {
      assignedTeamId = team1PlayerCount < team2PlayerCount ? 1 : 2;
    }

    const playerDocument = collections.player(roomId, this.data.playerId!);

    const player: PlayerState = {
      playerId: this.data.playerId,
      name: playerName,
      roomId,
      room: <any>collections.room(roomId),
      teamId: assignedTeamId,
      decks: {
        selection: [],
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
  public async addToDeck(payload: { cards: Array<number>, deck: keyof PlayerDeck }) {
    const { cards, deck } = payload;

    console.log(`player.addToDeck(): Adding to deck ${deck}`, cards);

    const { roomId, playerId } = this.data;

    return collections.player(roomId!, playerId!).update({
      decks: {
        [deck]: firebase.firestore.FieldValue.arrayUnion(...cards),
      },
    });
  }

  @Action
  public async switchTeam() {
    const currentTeamId = this.data.teamId;

    const newTeamId = currentTeamId === 1 ? 2 : 1;

    return collections.player(
      this.data.roomId!,
      this.data.playerId!,
    ).update({ teamId: newTeamId });
  }

  @Action
  public async submitSelectionCards() {
    const { roomId, playerId } = this.data;

    console.log(`Submitting selection cards for player ${playerId} in room ${roomId}`);

    const phaseData = collections.phase(roomId!, GamePhase.Setup).doc(playerId!);

    return phaseData.update({ hasSubmittedCards: true });
  }

  @Action
  public async ensureCurrentPhaseDataExists(
    payload: { roomId: string, playerId: string, phase: GamePhase },
  ) {
    if (payload.phase === GamePhase.Setup) {
      const document = await collections.phase(
        payload.roomId,
        GamePhase.Setup,
      ).doc(payload.playerId);

      const documentExists = await document.get()
        .then(snapshot => snapshot.exists);

      if (!documentExists) {
        document.set({
          playerId: payload.playerId,
          player: collections.player(payload.roomId, payload.playerId),
          hasSubmittedCards: false,
        });
      }
    }
  }

  @Mutation
  public setPlayerId(playerId: string) {
    this.data.playerId = playerId;
  }
}
