<template>
    <v-content class="pb-0 viewport">
      <Scoreboard
        :scores="scores"
        :activeTeam="activeTeam"
        :isRoundActive="isRoundActive"
        :timerStartValue="timerStartValue"
        :onTimerEnded="onTimerEnded"
      />

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
            <h3>{{ rounds[activeRound] }}</h3>
          </v-flex>
        </v-layout>
      </v-container>

      <v-footer
        app
      >
        <Button v-if="!startButtonPressed" text="Start" @click="onStartClick" />

        <v-progress-linear
            v-else
            :value="progress" />
      </v-footer>
    </v-content>
     
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CardDeck from '@/components/Card/CardDeck.vue';
import Cards from '@/data/Cards';
import ProgressBar from '@/components/ProgressBar.vue';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';
import Scoreboard from '@/components/Scoreboard.vue';

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
  private activeTeam = 1;

  private activeRound = 1;

  private cardsGuessed = 0;

  private cardsTotal = 0;

  private rounds = {
    1: 'Use any words, sounds, or gestures except the name itself.',
    2: 'Use only one word.',
    3: 'Just charades - sound effects are OK.',
  }

  private scores: { [team: string]: number; } = {
    1: 0,
    2: 0,
  };

  private startButtonPressed = false;

  private hasTimeRemaining = true;

  private timerStartValue = 60;

  private cards: Array<any> = [];

  private created() {
    this.resetDeck();
  }

  get isRoundActive(): boolean {
    return this.startButtonPressed == true && this.hasTimeRemaining == true && this.cards.length > 0;
  }

  get progress() {
    return (this.cardsGuessed) / this.cardsTotal * 100;
  }

  private onDeckEmpty() {
    setTimeout(() => {
      this.resetRound();
      this.resetTurn();
    }, 300);
  }

  private resetDeck() {
    this.cards = JSON.parse(JSON.stringify(Cards));
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
  }

  private onStartClick() {
    // document.documentElement.requestFullscreen();
    this.startButtonPressed = true;
  }

  private onTimerEnded() {
    this.hasTimeRemaining = false;

    this.resetTurn();
    this.setNextTeam();
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
  height: calc(100vh - 159px); 
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
