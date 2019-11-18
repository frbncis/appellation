<template>
  <v-content class="pb-0 viewport">
    <v-container fluid>
      <v-layout
        column align-center
      >
        <v-flex v-if="roomId == undefined">
          <v-flex>
            <v-text-field
              v-model="roomIdTextField"
              label="Room ID"
              type="number"
            />
          </v-flex>

          <v-flex>
            <v-btn block :loading="joinGameClicked" :disabled="createGameClicked" @click="onJoinGameClick">Join Game</v-btn>
          </v-flex>

          <v-flex>
            <v-btn block :loading="createGameClicked" :disabled="joinGameClicked" @click="onCreateGameClick">Create Game</v-btn>
          </v-flex>
        </v-flex>

        <v-flex v-else align-center>
          <p>Room {{ roomId }}</p>
        </v-flex>
      </v-layout>

      <v-layout
        column align-center
      >
        <v-flex
          v-if="player.playerId !== undefined && roomId !== undefined && player.name == null"
        >
          <v-text-field
            v-model="playerName"
            label="Player Name"
            placeholder="Adam"
          />

          <v-btn @click="onSetPlayerNameClick">Set Player Name</v-btn>
        </v-flex>

        <div v-if="isFinishedCardSelection">
          <ul id="players" v-if="player.playerId !== undefined && roomId !== undefined">
            <v-row>
              <v-col>
                <h2>Team 1</h2>
                <p
                  v-for="playerData in playersTeam1"
                  :key="playerData.name"
                  :class="{ playerReady: playerData.hasSubmittedCards, playerWaiting: !playerData.hasSubmittedCards }"
                >
                  {{ playerData.player.name }}
                </p>
              </v-col>

              <v-col>
                <h2>Team 2</h2>
                <p
                  v-for="playerData in playersTeam2"
                  :key="playerData.name"
                  :class="{ playerReady: playerData.hasSubmittedCards, playerWaiting: !playerData.hasSubmittedCards }"
                >
                  {{ playerData.player.name }}
                </p>
              </v-col>
            </v-row>
          </ul>
        </div>
      </v-layout>

      <v-layout
        v-if="shouldShowDeck"
        column align-center
      >
        <div class="pb-5">
          <h3>Choose {{ this.NUMBER_OF_CARDS_TO_SELECT - this.selectedCardIds.length }} cards</h3>
        </div>
          
        <v-flex 
          class="card-deck-container"
        >
          <CardDeck
            :onDeckEmpty="onDeckEmpty"
            :onCardGuessed="onCardSelected"
            :cards="cards"
            class="card-deck"
          />
        </v-flex>
      </v-layout>

      <v-footer
        v-if="isFinishedCardSelection && !shouldShowDeck"
        app
      >
        <v-flex>
          <v-flex class="pb-4">
            <v-btn block @click="onSwitchTeamClick">Switch Team</v-btn>
          </v-flex>

          <v-btn :loading="isGameStarting" :dark="playersReady" :disabled="!playersReady" block @click="onStartGameClick">
            Start Game
          </v-btn>
        </v-flex>
      </v-footer>
    </v-container>
  </v-content>
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

import {collections, PlayerData, SetupPhaseData } from '@/components/KeyValueService.ts';

import { mapState, mapActions, mapGetters } from 'vuex'
import { PlayerDeck } from '@/store/modules/player';
import store, { storeHelpers } from '../store';

@Component({
  components: {
    CardDeck,
  },
})
export default class Setup extends Vue {
    @Prop() private roomId?: string | null;

    private NUMBER_OF_CARDS_TO_SELECT: number = 5;

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

    private switchTeam = storeHelpers.player.switchTeam;

    private get playersTeam1(): Array<any> {
        return this.playersByTeam(1);
    }

    private get playersTeam2(): Array<any> {
        return this.playersByTeam(2);
    }

    private playersByTeam(teamId: number): Array<any> {
        if (!this.phase) {
            return [];
        }

        return this.phase.filter(playerPhaseData => {
            console.log(playerPhaseData);

            if (playerPhaseData)
            {
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

    private allCards = <Array<CardData>>JSON.parse(JSON.stringify(Cards));

    private get cards(): Array<any> {

        const cardKeyedById = this.allCards.map((card, index) => {
            return {
                id: index,
                ...card
            };
        });
        
        const candidateCards = cardKeyedById.filter((card: CardData) => {
            // console.log("Setup.cards() - filtering card ID " + card.id);

            if (storeHelpers.player.data.decks.selection.includes(card.id)) {
                // console.log(`Setup.cards() - player has card ID ${card.id} in selection deck`);

                if (this.selectedCardIds.includes(card.id)) {
                    // console.log(`Setup.cards() - player has already selected card ID ${card.id}, skipping`);
                    return false;
                }
                else
                {
                    return true;
                }
            }
        });
        
        console.log(`Setup.cards() - returning ${candidateCards.length} cards.`);

        return candidateCards;
    }

    private selectedCardIds: Array<number> = [];

    public onDeckEmpty() {
        return;
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

    private async onCardSelected(selectedCard: CardData) {
        console.log("Card selected");
        
        if (this.selectedCardIds.push(selectedCard.id) == this.NUMBER_OF_CARDS_TO_SELECT) {
            console.log("Done card selection.");

            await storeHelpers.submitSelectionCards(
                this.selectedCardIds
            );
        }
    }
}
</script>

<style scoped>
.viewport {
  position: fixed;
  height: 100%;
  width: 100%;
}

.playerReady {
  font-weight: 900;
}

.playerWaiting {
  font-weight: 100;
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