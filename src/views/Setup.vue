<template>
    <v-content class="pb-0 viewport">
      <v-container fluid>
        <v-layout
          column align-center
        >
          <v-flex>
            <div v-if="roomId == undefined">
                <v-btn @click="onCreateGameClick">Create Game</v-btn>
                <v-text-field
                    v-model="roomIdTextField"
                    label="Room ID"
                    placeholder="asdfg"
                />
                <v-btn @click="onJoinGameClick">Join Game</v-btn>
            </div>
            <div v-else>
                <p>Room: {{ roomId }}</p>
            </div>

            <div v-if="player.playerId == undefined && roomId != undefined">
                <v-text-field
                    v-model="playerName"
                    label="Player Name"
                    placeholder="Adam"
                ></v-text-field>
                <v-btn @click="onSetPlayerNameClick">Set Player Name</v-btn>
            </div>
            <div v-else>
                <p>Player ID: {{ player.playerId }}</p>
                <p>Player Name: {{ player.name }}</p>
            </div>

            <ul id="players">
                <h2>Team 1</h2>
                <li v-for="playerData in playersTeam1" :key="player.name">
                    {{ playerData.player.name }}         {{ playerData.hasSubmittedCards ? 'Y': 'N' }}
                </li>

                <h2>Team 2</h2>
                <li v-for="playerData in playersTeam2" :key="player.name">
                    {{ playerData.player.name }}         {{ playerData.hasSubmittedCards ? 'Y': 'N' }}
                </li>
                <v-btn @click="onSwitchTeamClick">Switch Team</v-btn>
            </ul>
          </v-flex>
        <v-container fluid >

        <v-layout
          column align-center
        >
          <v-flex class="card-deck-container">
            <CardDeck
              v-if="!isFinishedCardSelection"
              :onDeckEmpty="onDeckEmpty"
              :onCardGuessed="onCardSelected"
              :cards="cards"
              class="card-deck"
            />
            <h1 v-else-if="!playersReady">Waiting to start game</h1>
            <v-btn v-else @click="onStartGameClick">Start Game</v-btn>
          </v-flex>

        </v-layout>
      </v-container>
        </v-layout>
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

    private roomIdTextField: string = '';
    
    private playerName: string = '';

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

    private player = storeHelpers.player.data;

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

    private get cards(): Array<any> {
        let allCards = <Array<CardData>>JSON.parse(JSON.stringify(Cards));

        allCards = allCards.map((card, index) => {
            return {
                id: index,
                ...card
            };
        });
        
        const candidateCards = allCards.filter((card: CardData) => storeHelpers.player.data.decks.selection.includes(card.id) && !this.selectedCardIds.includes(card.id));
        
        return candidateCards;
    }

    private selectedCardIds: Array<number> = [];

    public onDeckEmpty() {
        return;
    }

    public async onCreateGameClick() {
        this.roomId = await storeHelpers.createGame();
        this.$router.push(`/${this.roomId}`);
        await storeHelpers.joinGame(this.roomId!);
    }

    public async onJoinGameClick() {
        if (this.roomIdTextField) {
            this.$router.push(`/${this.roomIdTextField}`);
        }
    }

    public async onSetPlayerNameClick() {
        if (this.roomId) {
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
        await storeHelpers.startGame();
    }

    private async onCardSelected(selectedCard: CardData) {
        if (this.selectedCardIds.push(selectedCard.id) == 2) {
            console.log("Done card selection.");
            // this.isFinishedCardSelection = true;

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