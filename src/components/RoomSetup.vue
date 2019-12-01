<template>
  <v-app>
  <v-content>
    <v-container fill-height>
      <v-row
        justify="center"
        align="center"
      >
        <v-col>
          <v-text-field
            outlined
            single-line
            v-model="roomIdTextField"
            label="Room ID"
            type="number"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-content>

  <v-footer 
    app
    fixed
    color="#0bf"
  >
    <v-flex class="pb-4 pt-4">
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

      <v-flex
        class="pt-5"
      >
        <v-btn
          block
          outlined
          dark
          @click="onRulesClicked"
        >
          Rules
        </v-btn>
      </v-flex>
    </v-flex>
  </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import ProgressBar from '@/components/ProgressBar.vue';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';
import { db } from  '@/components/Firestore.ts';

import {collections, PlayerData, SetupPhaseData } from '@/components/KeyValueService.ts';

import { mapState, mapActions, mapGetters } from 'vuex'
import store, { storeHelpers } from '../store';

@Component({
  components: {
  },
})
export default class RoomSetup extends Vue {
    @Prop() private roomId?: string | null;

    private roomIdTextField: string = '';

    private createGameClicked: boolean = false;

    private joinGameClicked: boolean = false;

    public get canJoinGame() {
      if (this.roomIdTextField == '') {
        return false;
      } else {
        return true;
      }
    }

    public get canCreateGame() {
      if (this.roomIdTextField == '') {
        return false;
      } else {
        return true;
      }
    }

    public async onCreateGameClick() {
      this.createGameClicked = true;

      this.roomId = await storeHelpers.createGame();

      this.joinRoom(this.roomId);
    }

    public async onJoinGameClick() {
      this.joinGameClicked = true;

      if (this.roomIdTextField) {
        this.joinRoom(this.roomIdTextField);
      }
    }

    public async onRulesClicked() {
      this.$router.push("/rules");
    }

    private async joinRoom(roomId: string) {
      this.$router.push(`/room/${this.roomId}`);
      await storeHelpers.joinGame(this.roomId!);
    }
}
</script>

<style scoped>

</style>