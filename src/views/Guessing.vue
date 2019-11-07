<template>
    <v-content class="pb-0 viewport">
      <Scoreboard
        :scores="scores"
        :activeTeam="activeTeam"
        :isRoundActive="isRoundActive"
        :timerStartValue="timerStartValue"
        :onTimerEnded="onTimerEnded"
      />

      <div v-if="isPlayerTurn">
        <v-container fluid>
          <v-layout
            column align-center
          >
            <v-flex class="card-deck-container" v-if="isRoundActive">
              <CardDeck
                :onDeckEmpty="onDeckEmpty"
                :onCardGuessed="onCardGuess"
                :cards="cards"
                class="card-deck"
              />
            </v-flex>

            <v-flex v-else>
              <h1>Round {{ activeRound }}</h1>
              <h3>{{ rounds[activeRound] ? rounds[activeRound] : 'Make up your own rules.' }}</h3>
            </v-flex>
          </v-layout>
        </v-container>

        <v-footer
          app
        >
          <Button v-if="showStartButton" text="Start Round" @click="onStartClick" />

          <v-progress-linear
              v-else
              :value="progress" />
        </v-footer>
      </div>

      <div v-else>
        <h3>Let's go {{ activePlayerId }}!</h3>
      </div>
    </v-content>

</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapState, mapActions, mapGetters } from 'vuex';
import CardDeck, { CardData } from '@/components/Card/CardDeck.vue';
import Cards from '@/data/Cards';
import ProgressBar from '@/components/ProgressBar.vue';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';
import Scoreboard from '@/components/Scoreboard.vue';
import { storeHelpers } from '../store';

@Component({
  components: {
    Button,
    CardDeck,
    Footer,
    ProgressBar,
    Scoreboard,
  },
})
export default class Guessing extends Vue {
  private get activeTeam() {
    return storeHelpers.room.data.currentTeamTurnId;
  }

  private activeRound = 1;

  private cardsGuessed = 0;

  private cardsTotal = 0;

  private rounds = {
    1: 'Use any words, sounds, or gestures except the name itself.',
    2: 'Use only one word.',
    3: 'Just charades - sound effects are OK.',
  }

  private get scores() {
    return {
      1: storeHelpers.room.data.scoreTeam1,
      2: storeHelpers.room.data.scoreTeam2,
    };
  }

  public startButtonPressed = false;

  private hasTimeRemaining = true;

  private timerStartValue = 60;

  public cardIds: Array<number> = storeHelpers.room.data.selectedCards;

  private cards: Array<any> = [];

  public get isPlayerTurn() {
    return storeHelpers.room.data.currentPlayerId === storeHelpers.player.data.playerId;
  }

  public get activePlayerId() {
    return storeHelpers.room.data.currentPlayerId
  }

  private created() {
    this.resetDeck();
    this.shuffle(this.cards);
  }

  get isRoundActive(): boolean {
    return this.startButtonPressed == true && this.hasTimeRemaining == true && this.cards.length > 0;
  }

  get showStartButton(): boolean {
    return !this.startButtonPressed;
  }

  get progress() {
    return (this.cardsGuessed) / this.cardsTotal * 100;
  }

  private onDeckEmpty() {
    console.log('Deck is empty, resetting for next round.');
    setTimeout(() => {
      this.resetRound();
      this.resetTurn();
    }, 300);
  }

  private resetDeck() {
    const cardModels: Array<CardData> = (JSON.parse(JSON.stringify(Cards)) as Array<CardData>).map((cardModel, index) => ({
      id: index,
      ...cardModel,
    }));

    this.cardIds.forEach((cardId) => {
      this.cards.push(
        cardModels[cardId],
      );
    });

    this.cardsGuessed = 0;
    this.cardsTotal = this.cards.length;
  }

  private resetTurn() {
    this.startButtonPressed = false;
    this.hasTimeRemaining = true;

    this.shuffle(this.cards);
  }

  private resetRound() {
    this.activeRound++;

    setTimeout(() => {
      this.resetDeck();
      this.setNextTeam(true);
    }, 300);
  }

  private onCardGuess(guessedCard: any) {
    this.cardsGuessed++;
    this.scores[this.activeTeam] += guessedCard.points;

    this.cards = this.cards.filter(card => card.id != guessedCard.id);

    storeHelpers.room.setScores(this.scores);
    
    if (this.cards.length == 0) {
      this.onDeckEmpty();
    }
  }

  private onStartClick() {
    this.startButtonPressed = true;
  }

  private onTimerEnded() {
    this.hasTimeRemaining = false;

    this.resetTurn();
    storeHelpers.room.setNextPlayer();
  }

  private setNextTeam(setByLowestScore: boolean = false) {
    if (setByLowestScore) {
      const teams = Object.keys(this.scores);
      const lowest = Math.min.apply(null, teams.map(team => this.scores[team]));

      this.activeTeam = parseInt(teams.filter(y => this.scores[y] === lowest)[0]);
    } else {
      this.activeTeam = this.activeTeam == 1 ? 2 : 1;
    }
  }

  /**
   * Shuffles array in place. ES6 version
   * @param {Array} a items An array containing the items.
   */
  private shuffle(a: Array<any>) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
</script>

<style scoped>
.viewport {
  position: fixed;
  height: 100%;
  width: 100%;
}

.active-team {
  font-weight: bold;
}

.card-deck {
  width: 90vw;
  /* height: calc(100vh - 159px);  */
  height: 481px;
}

@media only screen and (min-width: 360px) {
  .card-deck {
    width: 340px;
    max-height: 351px;
  }
}

.game-header {
  display: flex;
}

.game-header div {
  flex-basis: 100%
}

.game-footer {
  display: table;
  margin-right: auto;
  margin-left: auto;
  width: 95%;
  bottom:0;
  left: 2.5%;
  position: fixed;
  margin-bottom: 1em;
}

</style>
