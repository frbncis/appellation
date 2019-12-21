import { GamePhase } from '@/components/KeyValueService';
import { PlayerState } from "./PlayerState";
import { Cards } from "./Cards";
import { Sequences } from "./Sequences";
import { RoomStateCards } from "./RoomStateCards";

export class RoomState extends RoomStateCards {
  public roomId?: string = '';

  public isBound: boolean = false;

  public createdAt: Date = new Date();

  public turnStarted?: number | null = null;

  public currentTeamTurnId?: number = -1;

  public currentPlayer: PlayerState = {
    playerId: null,
    name: null,
    roomId: null,
    room: null,
    teamId: 0,
    decks: {
      selection: [],
    },
  };

  public currentPlayerId?: string = '';

  public previousPlayerId?: string = '';

  public guessingPhaseRound = 1;

  public scoreTeam1: number = 0;

  public scoreTeam2: number = 0;

  public turnSequence: Sequences = {
    1: [],
    2: [],
  };

  public gamePhase: GamePhase = GamePhase.Setup;

  public players: Array<string> = [];

  public constructor(init?: Partial<RoomState>) {
    super();
    Object.assign(this, init);
  }

  public getDeck(deckName: string): Cards {
    return (<any>this)[deckName];
  }
}
