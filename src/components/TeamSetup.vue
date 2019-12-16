<template>
  <v-app
    style="background: #0bf; color: #fff"
  >
    <v-content>
      <v-container
        fill-height
        align="baseline"
      >
        <v-row justify="space-around">
          <div>
            <h2>Team 1</h2>
            <p
              v-for="playerData in playersTeam1"
              :key="playerData.name"
              :class="{ playerReady: playerData.hasSubmittedCards, playerWaiting: !playerData.hasSubmittedCards }"
            >
              {{ playerData.player.name }}
            </p>
          </div>

          <div>
            <h2>Team 2</h2>
            <p
              v-for="playerData in playersTeam2"
              :key="playerData.name"
              :class="{ playerReady: playerData.hasSubmittedCards, playerWaiting: !playerData.hasSubmittedCards }"
            >
              {{ playerData.player.name }}
            </p>
          </div>
        </v-row>
      </v-container>
    </v-content>

    <Footer>
      <v-row
        justify="center"
        align="center"
      >
        <v-col>
          <v-btn
            block
            outlined
            dark
            @click="() => this.$emit('switched-teams')"
          >
            Switch Teams
          </v-btn>

          <v-btn
            block
            outlined
            dark
            @click="() => this.$emit('start-game')"
          >
            Start Game
          </v-btn>
        </v-col>
      </v-row>
    </Footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';

@Component({
  components: {
    Footer,
  },
})
export default class TeamSetup extends Vue {
  @Prop() public playersTeam1?: Array<any>;

  @Prop() public playersTeam2?: Array<any>;
}
</script>
