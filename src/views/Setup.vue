<template>
  <div
    v-if="isSetupPhase"
  >
    <PlayerNameSetup 
      v-if="player.playerId !== undefined 
        && roomId !== undefined 
        && player.name == null"
        
      :roomId="roomId"
    />

    <CardsSetup
      v-else-if="shouldShowDeck"
    />

    <TeamSetup
      v-else
      :playersTeam1="playersTeam1"
      :playersTeam2="playersTeam2"
      @switched-teams="onSwitchTeamClick"
      @start-game="onStartGameClick"
    />
  </div>

  <Guessing v-else />
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
import CardsSetup from '@/views/CardsSetup.vue';
import TeamSetup from '@/components/TeamSetup.vue';
import Guessing from '@/views/Guessing.vue';

import {collections, PlayerData, SetupPhaseData } from '@/components/KeyValueService.ts';

import { mapState, mapActions, mapGetters } from 'vuex'
import { PlayerDeck } from '@/store/modules/player';
import store, { storeHelpers } from '../store';

@Component({
  components: {
    CardDeck,
    CardsSetup,
    Footer,
    Guessing,
    PlayerNameSetup,
    TeamSetup,
  },
})
export default class Setup extends Vue {
    @Prop() private roomId?: string | null;

    private roomIdTextField: string = '';
    
    private playerName: string = '';

    private isGameStarting: boolean = false;

    private createGameClicked: boolean = false;

    private joinGameClicked: boolean = false;

    private get shouldShowDeck() {
      return !this.isFinishedCardSelection && this.player !== null && this.player.name;
    }

    private get isFinishedCardSelection(): boolean {
        if (!this.phase) {
            return false;
        }

        const playerData = this.phase.find(playerPhaseData => playerPhaseData.playerId == this.player.playerId);

        if(!playerData) {
            return false;
        }

        return playerData.hasSubmittedCards;
    }

    private get phase(): Array<SetupPhaseData> {
        return storeHelpers.room.phase;
    }

    private get player() {
        return storeHelpers.player.data;
    }

    private get isSetupPhase() {
      return storeHelpers.room.data.gamePhase === 0;
    }

    private switchTeam = storeHelpers.player.switchTeam;

    private get playersTeam1(): Array<any> {
        return this.playersByTeam(1);
    }

    private get playersTeam2(): Array<any> {
        return this.playersByTeam(2);
    }

    public async created() {
      if (this.roomId !== '' && this.roomId !== undefined) {
        await storeHelpers.joinGame(this.roomId!);
      }
      window.scrollTo(0, 1);

    }
    private playersByTeam(teamId: number): Array<any> {
        if (!this.phase) {
            return [];
        }

        return this.phase.filter(playerPhaseData => {
          console.log(playerPhaseData);

          if (playerPhaseData) {
            if (playerPhaseData.player)
            {
                return playerPhaseData.player.teamId == teamId;
            }
          }

          return false;
        })
    }

    private get playersReady(): boolean {
      if (!this.phase) {
        return false;
      }

      return this.phase.filter(playerPhaseData => playerPhaseData.hasSubmittedCards).length == this.phase.length;
    }

    public async onCreateGameClick() {
      this.createGameClicked = true;

      this.roomId = await storeHelpers.createGame();
      this.$router.push(`/${this.roomId}`);
      await storeHelpers.joinGame(this.roomId!);
    }

    public async onJoinGameClick() {
      this.joinGameClicked = true;

      if (this.roomIdTextField) {
        this.$router.push(`/${this.roomIdTextField}`);
      }
    }

    public async onSetPlayerNameClick() {
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

    public async onSwitchTeamClick() {
        await this.switchTeam();
    }

    public async onStartGameClick() {
        console.log('Start game button clicked.');
        this.isGameStarting = true;
        await storeHelpers.startGame();
    }
}
</script>

<style scoped>

.playerReady {
  font-weight: 900;
}

.playerWaiting {
  font-weight: 100;
}
</style>