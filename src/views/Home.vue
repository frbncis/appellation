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
import { mapState, mapActions, mapGetters } from 'vuex'
import { GamePhase } from '@/components/KeyValueService';

@Component({
  components: {
    Setup,
    Guessing,
  },
  computed: {
    ...mapState({
        phase: state => state.room.data.phase,
        isBound: state => state.room.isBound,
    }),
  },
methods: {
    ...mapActions([
        'joinGame',
    ])
  },
})
export default class Home extends Vue {
    @Prop() private roomId?: string | null;


    public created() {
        if (this.roomId) {
            this.joinGame(this.roomId);
        }
    }

    private get isReady() {
        if (this.roomId == undefined) {
            return true;
        }
        else
        {
            if (this.isBound == false) {
                return false;
            }
            else {
                return true;
            }
        }
    }
    private get isSetup() {
        return this.phase == GamePhase.Setup;
    }
    
    private get isGuessing() {
        return this.phase == GamePhase.Guessing;
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