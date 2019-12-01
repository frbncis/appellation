<template>
  <v-app>
    <v-content>
      <v-container
        fill-height
      >
        <v-row
          justify="center"
          align="center"
        >
          <v-col>
            <v-text-field
              outlined
              single-line
              v-model="playerName"
              label="Player Name"
              placeholder="Enter Your Name"
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
      <v-flex
        class="pb-2 pt-2"
        style="height: 100px;"
      >
        <v-row
          justify="center"
          align="center"
        >
          <v-col>
            <v-btn
              block
              outlined
              dark
              :loading="nameConfirmClicked"
              @click="onNameConfirmClicked"
            >
              That's what they call me
            </v-btn>
          </v-col>
        </v-row>
      </v-flex>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';

import { storeHelpers } from '@/store';

@Component({})
export default class PlayerNameSetup extends Vue {
  @Prop() private roomId?: string | null;

  private playerName: string = '';

  private nameConfirmClicked: boolean = false;

  public async created() {
    await storeHelpers.loadUser();
  }

  public async onNameConfirmClicked() {
    this.nameConfirmClicked = true;

    if (this.roomId && this.playerName != '') {
      const playerId = await storeHelpers.createPlayer(
        this.roomId,
        this.playerName
      );

      await storeHelpers.becomePlayer(this.roomId, playerId);

      await storeHelpers.drawSelectionCards();          
    } else {
      throw new Error("No room ID")
    }
  }
}
</script>

<style scoped>

</style>