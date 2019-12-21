<template>
  <v-container
    fill-height
    style="align-items: stretch;"
  >
    <v-col
      cols="12"
      style="display:flex;  padding-top: 0; padding-bottom: 0;"
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
import { db } from '@/components/Firestore';
import PlayerNameSetup from '@/components/PlayerNameSetup.vue';

import { collections, PlayerData, SetupPhaseData } from '@/components/KeyValueService';

import { PlayerDeck } from '@/store/modules/player';
import store, { storeHelpers } from '../store';

@Component({
  components: {
    CardDeck,
    Footer,
    PlayerNameSetup,
  },
})
export default class CardDeckContainer extends Vue {
  @Prop() private cards?: Array<number>;

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
