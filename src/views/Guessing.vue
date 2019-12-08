<template>
  <v-app
    style="background: #0bf; color: #fff"
  >
    <v-content>
      <v-col
        cols="12"
        style="
          height: 100%; 
          padding: 0;
          display: flex;
          flex-direction: column;"
      >
      <Scoreboard
        :scores="scores"
        :activeTeam="activeTeam"
        :isRoundActive="playerGuessesAllowed"
        :timerInitialValue="TIMER_START_VALUE"
        :timeRemainingSeconds="timeRemainingSeconds"
        @timerTick="onTimerTick"
      />

      <CardDeckContainer
        v-if="playerGuessesAllowed"
        @deck-emptied="endTurn"
        @card-selected="onCardGuessed"
        :cards="cards"
        style="height: inheirit; padding-top: 0"
      />
      
      <v-container
        v-else
      >
        <v-col>
          <h1>Round {{ activeRound }}</h1>
          <h3>{{ rounds[activeRound] ? rounds[activeRound] : 'Make up your own rules.' }}</h3>
        </v-col>
      </v-container>

      <!-- <v-container v-else>
        <div>
          <h3>Let's go {{ activePlayerName }}!</h3>
        </div>
      </v-container> -->
      </v-col>
    </v-content>
       
    <Footer
      v-if="!playerGuessesAllowed"
    >
      <v-col>
      <Button text="Start Round" @click="startTurn" />
      </v-col>
    </Footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapState, mapActions, mapGetters } from 'vuex';
import { CardData } from '@/components/Card/CardDeck.vue';
import Cards from '@/data/Cards';
import ProgressBar from '@/components/ProgressBar.vue';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';
import Scoreboard from '@/components/Scoreboard.vue';
import { storeHelpers } from '../store';
import CardDeckContainer from '@/components/CardDeckContainer.vue';

@Component({
  components: {
    Button,
    CardDeckContainer,
    Footer,
    ProgressBar,
    Scoreboard,
  },
})
export default class Guessing extends Vue {
  /**
   * The maximum amount of time in seconds for a turn.
   */
  private readonly TIMER_START_VALUE = 60;

  /**
   * The timer's current value.
   */
  private timeRemainingSeconds = this.TIMER_START_VALUE;

  public roundActive = false;

  private rounds = {
    1: 'Use any words, sounds, or gestures except the name itself.',
    2: 'Use only one word.',
    3: 'Just charades - sound effects are OK.',
  }

  private get activeTeam() {
    return storeHelpers.room.data.currentTeamTurnId;
  }

  private get activeRound() {
    return storeHelpers.room.data.guessingPhaseRound;
  }

  private get cardsGuessed() {
    return storeHelpers.room.data.selectedCards.length - storeHelpers.room.data.activeRemainingCards.length;
  }

  private get cardsTotal() {
    return storeHelpers.room.data.selectedCards.length;
  }

  private get scores() {
    return {
      1: storeHelpers.room.data.scoreTeam1,
      2: storeHelpers.room.data.scoreTeam2,
    };
  }

  private get hasTimeRemaining() {
    return this.timeRemainingSeconds > 0;
  }

  public get cardIds(): Array<number> {
    return storeHelpers.room.data.activeRemainingCards;
  }

  public get isPlayerTurn() {
    return storeHelpers.room.data.currentPlayerId === storeHelpers.player.data.playerId;
  }

  public get activePlayerName() {
    if (storeHelpers.room.currentPlayer) return storeHelpers.room.currentPlayer.name;
    return '';
  }

  get playerGuessesAllowed(): boolean {
    return this.roundActive == true && this.hasTimeRemaining == true && this.cards.length > 0;
  }

  get showStartButton(): boolean {
    return !this.roundActive;
  }

  get progress() {
    return this.cardsGuessed / this.cardsTotal * 100;
  }

  private get cards() {
    const cardModels: Array<CardData> = (JSON.parse(JSON.stringify(Cards)) as Array<CardData>).map((cardModel, index) => ({
      id: index,
      ...cardModel,
    }));

    const cards = storeHelpers.room.data.activeRemainingCards.map((cardId: number) => cardModels[cardId]);

    return cards.filter(card => card !== null);
  }

  private startTurn() {
    this.roundActive = true;
    this.timeRemainingSeconds = this.TIMER_START_VALUE;
  }

  private async endTurn() {
    this.roundActive = false;
    await storeHelpers.endTurn();
  }

  private onTimerTick() {
    this.timeRemainingSeconds = this.timeRemainingSeconds - 1;

    if (this.timeRemainingSeconds <= 0) {
      this.endTurn();
    }
  }

  private async onCardGuessed(guessedCard: any) {
    console.log('Guessing.onCardGuessed() called', guessedCard);

    console.log(`Guessing.onCardGuessed() - removing card ID ${guessedCard.id}`);

    await storeHelpers.room.setDrawDeck(this.cardIds.filter(cardId => cardId !== guessedCard.id));

    console.log('Guessing.onCardGuessed() - active deck update done.', this.cardIds);
    await storeHelpers.room.increaseScore({ teamId: this.activeTeam!, pointsEarned: guessedCard.points });

    if (this.cards.length == 0) {
      await this.endTurn();
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
.view-content__wrap {
  display: flex;
}

.viewport {
  position: fixed;
  height: 100%;
  width: 100%;
}

.card-deck-container {
  height: 100%;
  align-items: stretch;
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
