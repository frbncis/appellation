import { Module, VuexModule, Action } from 'vuex-module-decorators';
import firebase from 'firebase';
import { collections, GamePhase } from '@/components/KeyValueService';
import { FirestoreAction } from './FirebaseAction';

export interface PlayerDeck {
    selection: Array<number>,
    [key: string]: Array<number>
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
    const { bindFirestoreRef } = this.context;

    await bindFirestoreRef('player', collections.player(roomId, playerId));
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
    const { cards, deckSelector } = payload;

    console.log('player.addToDeck(): Adding to deck', cards);

    const { roomId, playerId } = this.data;

    const allDecks = Object.assign({}, this.data.decks);

    const selectedDeckName = Object.keys(this.data.decks).filter(key => this.data.decks[key] == deckSelector(allDecks));

    return collections.player(roomId!, playerId).update({
      [selectedDeckName[0]]: firebase.firestore.FieldValue.arrayUnion(...cards),
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
