import Cards from './Cards';

export default class RoomStateCards {
  public selectedCards: Cards = [];

  public activeRemainingCards: Cards = [];

  public activeGuessedCards: Cards = [];

  public discard: Cards = [];
}
