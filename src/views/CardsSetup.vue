<template>
  <v-app style="background: #0bf; color: #fff;">
    <SetupPageContent>
      <CardDeckContainer
        @deck-emptied="onDeckEmpty"
        @card-selected="onCardSelected"
        :cards="cards"
        :numberCardsToSelect="numberCardsToSelect"
      />
    </SetupPageContent>

    <Footer>
      <v-row justify="center" align="center">
        <v-col>
          <v-btn block outlined dark disabled>Choose {{ this.numberCardsToSelect }} cards</v-btn>
        </v-col>
      </v-row>
    </Footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { CardData } from "@/components/Card/CardDeck.vue";
import Cards from "@/data/Cards";
import ProgressBar from "@/components/ProgressBar.vue";
import Button from "@/components/Button.vue";
import Footer from "@/components/Footer.vue";
import Scoreboard from "@/components/Scoreboard.vue";
import { db } from "@/components/Firestore";
import PlayerNameSetup from "@/components/PlayerNameSetup.vue";
import CardDeckContainer from "@/components/CardDeckContainer.vue";
import SetupPageContent from "@/components/SetupPageContent.vue";

import {
  collections,
  PlayerData,
  SetupPhaseData
} from "@/components/KeyValueService";

import { mapState, mapActions, mapGetters } from "vuex";
import { PlayerDeck } from "@/store/modules/player";
import store, { storeHelpers } from "../store";

@Component({
  components: {
    CardDeckContainer,
    Footer,
    PlayerNameSetup,
    SetupPageContent
  }
})
export default class CardsSetup extends Vue {
  private NUMBER_OF_CARDS_TO_SELECT: number = 5;

  private allCards = <Array<CardData>>JSON.parse(JSON.stringify(Cards));

  private selectedCardIds: Array<number> = [];

  public get numberCardsToSelect() {
    return this.NUMBER_OF_CARDS_TO_SELECT - this.selectedCardIds.length;
  }

  private get cards(): Array<any> {
    const cardKeyedById = this.allCards.map((card, index) => {
      return {
        id: index,
        ...card
      };
    });

    const candidateCards = cardKeyedById.filter((card: CardData) => {
      // console.log("Setup.cards() - filtering card ID " + card.id);

      if (storeHelpers.player.data.decks.selection.includes(card.id)) {
        // console.log(`Setup.cards() - player has card ID ${card.id} in selection deck`);

        if (this.selectedCardIds.includes(card.id)) {
          // console.log(`Setup.cards() - player has already selected card ID ${card.id}, skipping`);
          return false;
        } else {
          return true;
        }
      }
    });

    console.log(`Setup.cards() - returning ${candidateCards.length} cards.`);

    return candidateCards;
  }

  public onDeckEmpty() {
    return;
  }

  private async onCardSelected(selectedCard: CardData) {
    console.log("Card selected");

    const cardsSelectedCount = this.selectedCardIds.push(selectedCard.id);

    console.log(`${cardsSelectedCount} cards selected.`);
    if (cardsSelectedCount === this.NUMBER_OF_CARDS_TO_SELECT) {
      console.log("Done card selection.");

      await storeHelpers.submitSelectionCards(this.selectedCardIds);
    }
  }
}
</script>

<style scoped>
</style>