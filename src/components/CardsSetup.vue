<template>
  <v-app style="background: #0bf; color: #fff;">
    <v-content>
      <v-container fill-height style="align-items: stretch;">
        <v-col
          cols="12"
        >
          <v-row
            style="height: 100%; align-items: stretch;"
          >
            <CardDeck
              :onDeckEmpty="onDeckEmpty"
              :onCardGuessed="onCardSelected"
              :cards="cards"
            />
          </v-row>
        </v-col>
      </v-container>
    </v-content>

    <Footer>
      <v-row
        justify="center"
        align="center"
      >
        <v-col>
          <v-btn block outlined dark disabled>Choose {{ this.numberCardsToSelect }} cards</v-btn>
        </v-col>
      </v-row>
    </Footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CardDeck, { CardData } from '@/components/Card/CardDeck.vue';
import Cards from '@/data/Cards';
import ProgressBar from '@/components/ProgressBar.vue';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';
import Scoreboard from '@/components/Scoreboard.vue';
import { db } from  '@/components/Firestore.ts';
import PlayerNameSetup from '@/components/PlayerNameSetup.vue';

import {collections, PlayerData, SetupPhaseData } from '@/components/KeyValueService.ts';

import { mapState, mapActions, mapGetters } from 'vuex'
import { PlayerDeck } from '@/store/modules/player';
import store, { storeHelpers } from '../store';

@Component({
  components: {
    CardDeck,
    Footer,
    PlayerNameSetup,
  },
})
export default class CardsSetup extends Vue {
  @Prop() private cards?: Array<number>;
  @Prop() private numberCardsToSelect?: number;

  private onDeckEmpty() {
    this.$emit('deck-emptied');
  }

  private onCardSelected(selectedCard: CardData) {
    this.$emit('card-selected', selectedCard);
  }
}
</script>

<style scoped>

</style>