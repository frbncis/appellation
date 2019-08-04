<template>
  <div class="selecting">
    <h1>{{ selectedCards.length }} / 5</h1>
    <CardDeck
      v-if="selectedCards.length < 5"
      :onCardGuessed="onCardSelected"
      :cards="cards"
    />
    <h2 v-else>Waiting for others to finish selecting their cards...</h2>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CardDeck from '@/components/Card/CardDeck.vue';
import Cards from '@/data/Cards';

@Component({
  components: {
    CardDeck,
  },
})
export default class Selecting extends Vue {
  private selectedCards: Array<any> = [];

  private cards: Array<any> = Cards;

  get isFinishedSelecting() {
      return this.selectedCards.length == 5;
  }
  
  private onCardSelected(selectedCard: any) {
    this.selectedCards.push(selectedCard);

    this.cards = this.cards.filter((card) => {
      return card.id != selectedCard.id;
    });
  }
}
</script>