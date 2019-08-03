<template>
  <div class="about">
    <h1>{{ cardsGuessed }}</h1>
    <CardDeck
      v-if="cards.length"
      :onDeckEmpty="onDeckEmpty"
      :onCardGuessed="onCardGuess"
      :cards="cards"
    />
    <h2 v-else>We're done!</h2>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CardDeck from '@/components/Card/CardDeck.vue';

@Component({
  components: {
    CardDeck,
  },
})
export default class About extends Vue {
  
  private cardsGuessed: number = 0;

  private teamCards = {};

  private cards: Array<any> =[
      {
          id: 1,
          title: "Doge",
          description: "An internet meme that shows a Shiba Inu surrounded by colorful Comic Sans text that describes its inner monologue, such as \"Wow\", \"Concern\", and \"so scare.\" There is much confuse over the name's pronunciation, yet it was recetnyl used to brand a Bitcoin competitor.",
          category: "Celebrity",
          points: 3
      },
      {
          id: 2,
          title: "A Russian Nesting Doll",
          description: "An internet meme that shows a Shiba Inu surrounded by colorful Comic Sans text that describes its inner monologue, such as \"Wow\", \"Concern\", and \"so scare.\" There is much confuse over the name's pronunciation, yet it was recetnyl used to brand a Bitcoin competitor.",
          category: "Celebrity",
          points: 3
      },
      {
          id: 3,
          title: "Rick Santorum",
          description: "The former Republican Senator whose name, in retribution for comparing homosexuality to beastiality, was redefined in a contest held by sex columnist Dan Savage as \"the frothy mixture of lube and fecal matter that is sometimes the byproduct of anal sex.\"",
          category: "Celebrity",
          points: 2
      },
      {
          id: 4,
          title: "A Furry",
          description: 'A person who wears a full body animal suit, often for conventions, roleplaying, or personal recreation. Their use in sexual activity is a controversial topic in the community. In a recent survey, 37% reported that it was an important part of their interest in the activity.',
          category: 'ET CETERA',
          points: 3
      },
  ]

  private onDeckEmpty() {
    console.log("Deck empty!");
  }
  
  private onCardGuess(guessedCard: any) {
    this.cardsGuessed++;

    this.cards = this.cards.filter((card) => {
      return card.id != guessedCard.id;
    });
  }
}
</script>