import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators';
import firebase from 'firebase';
import { collections, GamePhase } from '@/components/KeyValueService';
import { FirestoreAction, FirestoreVuexModule } from './FirebaseAction';
import { RoomState } from './room';

export interface PlayerDeck {
    selection: Array<number>,
}

export interface PlayerState {
  playerId?: string,
  name?: string,
  roomId?: string,
  room?: RoomState,
  teamId: number,
  decks: PlayerDeck
}


@Module({ name: PlayerModule.ModuleName, namespaced: true})
export class PlayerModule extends FirestoreVuexModule {

  static ModuleName: string = 'player';

  public data: PlayerState = {
    playerId: undefined,
    name: undefined,
    roomId: undefined,
    room: undefined,
    teamId: -1,
    decks: {
      selection: [],
    },
  };

  public playerId?: string = undefined;

  @FirestoreAction
  public async bindReference(payload: { roomId: string, playerId: string }) {
    const { bindFirestoreRef } = this.context;

    await bindFirestoreRef('data', collections.player(payload.roomId, payload.playerId));
  }

  @Action
  public async createPlayer(payload: { roomId: string, playerName: string}) {
    const { roomId, playerName } = payload;

    console.log(`player.createPlayer() Creating player for ${playerName} in ${roomId} with player ID ${this.context.state.playerId}`);
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

    const playerDocument = collections.player(roomId, this.context.state.playerId);

    const player: PlayerState = {
      playerId: this.context.state.playerId,
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

    return collections.player(roomId!, playerId).update({
      decks: {
        [deck]: firebase.firestore.FieldValue.arrayUnion(...cards),
      },
    });
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

    const phaseData = collections.phase(roomId!, GamePhase.Setup).doc(playerId);

    return phaseData.update({ hasSubmittedCards: true });
  }

  @Action
  public async ensureCurrentPhaseDataExists(payload: { roomId: string, playerId: string, phase: GamePhase }) {
    // TODO: This should do a check to see if the data actually exists before writing to it
    // since this does a full replace.
    if (payload.phase == GamePhase.Setup) {
      await collections.phase(
        payload.roomId,
        GamePhase.Setup,
      ).doc(payload.playerId).set({
        playerId: payload.playerId,
        player: collections.player(payload.roomId, payload.playerId),
        hasSubmittedCards: false,
      });
    }
  }

  @Mutation
  public setPlayerId(playerId: string) {
    this.playerId = playerId;
  }
}
