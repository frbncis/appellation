<template>
  <v-app style="background: #0bf; color: #fff">
    <v-content>
      <v-container fluid fill-height>
        <v-row
          justify="center"
          align="center"
          no-gutters
        >
          <v-col cols="12">
            <h1 class="display-3 font-weight-black">Unmonikers</h1>
            <p class="subtitle-1 font-weight-bold">A dumb party game that respects your intelligence.</p>
          </v-col>
        </v-row>

        <v-row
          justify="center"
          align="center"
          no-gutters
        >
          <v-col cols="12">
            <p class="overline">Enter the room code to join your buddies, or click on Create Game.</p>
            <v-text-field
              full-width
              outlined
              dense
              dark
              v-model="roomIdTextField"
              label="Room Code"
              type="number"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <Footer>
      <v-flex>
        <v-btn
          v-if="canJoinGame"
          block
          outlined
          dark
          :loading="joinGameClicked"
          :disabled="!canJoinGame"
          @click="onJoinGameClick"
        >
          Join Game
        </v-btn>
      </v-flex>

      <v-flex>
        <v-btn
          v-if="!canCreateGame"
          block
          outlined
          dark
          :loading="createGameClicked"
          :disabled="canCreateGame"
          @click="onCreateGameClick">
          Create Game
        </v-btn>
      </v-flex>

      <v-flex>
        <v-btn
          block
          outlined
          dark
          @click="onRulesClicked"
        >
          Rules
        </v-btn>
      </v-flex>
    </Footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapState, mapActions, mapGetters } from 'vuex';
import ProgressBar from '@/components/ProgressBar.vue';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';
import { db } from '@/components/Firestore.ts';

import { collections, PlayerData, SetupPhaseData } from '@/components/KeyValueService.ts';

import store, { storeHelpers } from '../store';

@Component({
  components: {
    Footer,
  },
})
export default class RoomSetup extends Vue {
    private roomIdTextField: string = '';

    private createGameClicked: boolean = false;

    private joinGameClicked: boolean = false;

    public get canJoinGame() {
      if (this.roomIdTextField == '') {
        return false;
      }
      return true;
    }

    public get canCreateGame() {
      if (this.roomIdTextField == '') {
        return false;
      }
      return true;
    }

    public async onCreateGameClick() {
      this.createGameClicked = true;

      const roomId = await storeHelpers.createGame();

      this.gotoRoom(roomId);
    }

    public async onJoinGameClick() {
      this.joinGameClicked = true;

      if (this.roomIdTextField) {
        this.gotoRoom(this.roomIdTextField);
      }
    }

    public async onRulesClicked() {
      this.$router.push('/rules');
    }

    private async gotoRoom(roomId: string) {
      this.$router.push(`/room/${roomId}`);
    }
}
</script>

<style scoped>

</style>
