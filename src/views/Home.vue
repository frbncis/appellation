<template>
    <v-container fluid v-if="!isReady">
        <v-layout
          align-center justify-center column fill-height
        >
            <v-flex>
                <v-progress-circular
                    indeterminate
                    :size="60"
                    :width="5"
                />
            </v-flex>
        </v-layout>
    </v-container>

    <div v-else>
        <Setup v-if="isSetup" :roomId="roomId"/>
        <Guessing v-else-if="isGuessing" />
        <h1 v-else>Game Over.</h1>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Setup from '@/views/Setup.vue';
import Guessing from '@/views/Guessing.vue';
import { GamePhase } from '@/components/KeyValueService';
import { storeHelpers } from '@/store';

@Component({
  components: {
    Setup,
    Guessing,
  },
})
export default class Home extends Vue {
    @Prop() private roomId?: string | null;

    public async created() {
      if (this.roomId) {
        await storeHelpers.joinGame(this.roomId);
      }
    }

    private get isReady() {
      if (this.roomId == undefined) {
        return true;
      }

      return storeHelpers.room.data.isBound;
    }

    private get isSetup() {
      return storeHelpers.room.data.gamePhase == GamePhase.Setup;
    }

    private get isGuessing() {
      return storeHelpers.room.data.gamePhase == GamePhase.Guessing;
    }
}
</script>

<style scoped>
.viewport {
  position: fixed;
  height: 100%;
  width: 100%;
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
</style>
