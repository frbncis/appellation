<template>
  <v-app
    style="background: #0bf; color: #fff"
  >
    <SetupPageContent>
      <v-container
        fill-height
      >
        <v-row
          justify="center"
          align="center"
          no-gutters
        >
          <v-col>
            <v-text-field
              outlined
              single-line
              dark
              v-model="playerName"
              label="Player Name"
              placeholder="Enter Your Name"
            />
          </v-col>
        </v-row>
      </v-container>
    </SetupPageContent>

    <Footer>
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
    </Footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';
import SetupPageContent from '@/components/SetupPageContent.vue';

import { storeHelpers } from '@/store';

@Component({
  components: {
    Footer,
    SetupPageContent,
  },
})
export default class PlayerNameSetup extends Vue {
  @Prop() private roomId?: string | null;

  private playerName: string = '';

  private nameConfirmClicked: boolean = false;

  public async created() {
    await storeHelpers.loadUser();
  }

  public async onNameConfirmClicked() {
    this.nameConfirmClicked = true;

    if (this.roomId && this.playerName !== '') {
      const playerId = await storeHelpers.createPlayer(
        this.roomId,
        this.playerName,
      );

      await storeHelpers.becomePlayer(this.roomId, playerId);

      await storeHelpers.drawSelectionCards();
    } else {
      throw new Error('No room ID');
    }
  }
}
</script>

<style scoped>

</style>
