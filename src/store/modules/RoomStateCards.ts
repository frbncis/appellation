import { Cards } from "./Cards";
export class RoomStateCards {
  public selectedCards: Cards = [];
  public activeRemainingCards: Cards = [];
  public activeGuessedCards: Cards = [];
  public discard: Cards = [];
}
