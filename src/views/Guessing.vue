<template>
  <div class="guessing">
    <div class="game-header">
      <div class="team-game-header" :class="{ 'active-team': activeTeam == 1 }">
        <p>Team 1</p>
        <p>{{ scores[1] }}</p>
      </div>

      <div class="team-game-header">
        <Timer
          v-if="isRoundActive"
          :timerRunning="isRoundActive"
          :timerStartValue="timerStartValue"
          :onTimerEnded="onTimerEnded"
          
        />
      </div>

      <div class="team-game-header" :class="{ 'active-team': activeTeam == 2 }">
        <p>Team 2</p>
        <p>{{ scores[2] }}</p>
      </div>
    </div>

    <div v-if="!isRoundActive">
      <h1>Round {{ activeRound }}</h1>
      <h3>{{ rounds[activeRound] }}</h3>
    </div>

    <div class="game-footer">
      <h1 v-if="!startButtonPressed" @click="onStartClick" >Start</h1>

      <ProgressBar v-else :progress="(cardsGuessed) / cardsTotal * 100" />
    </div>
    <div
      v-if="isRoundActive"
    >
      <CardDeck
        :onDeckEmpty="onDeckEmpty"
        :onCardGuessed="onCardGuess"
        :cards="cards"
      />


    </div>    
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CardDeck from '@/components/Card/CardDeck.vue';
import Timer from '@/components/Timer.vue';
import Cards from '@/data/Cards';
import ProgressBar from '@/components/ProgressBar.vue';

@Component({
  components: {
    CardDeck,
    Timer,
    ProgressBar,
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
    3: 'Just charades - sound effects are OK.'
  }

  private scores = {
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

    this.cards = this.cards.filter((card) => {
      return card.id != guessedCard.id;
    });
  }

  private onStartClick() {
    document.documentElement.requestFullscreen();
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
      const lowest = Math.min.apply(null, teams.map((team) => { return this.scores[team] }))

      this.activeTeam = parseInt(teams.filter((y) => { return this.scores[y] === lowest })[0]);
    }
    else
    {
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
.active-team {
  font-weight: bold;
}

.game-header {
  display: flex;
  /* width: 100%; */
}

.game-header div {
  flex-basis: 100%
}

.game-footer {
  background: black;
  color: white;
  /* padding:0.01em 2em 0.1em 2em; */
  font-size: 0.75em;
  /* text-transform: uppercase; */
  display: table;
  margin-right: auto;
  margin-left: auto;
  width: 95%;
  /* position: absolute; */
  bottom:0;
  left: 2.5%;
  position: fixed;
  margin-bottom: 1em;
}

</style>
