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
                <v-text-field
                    v-model="playerName"
                    label="Player Name"
                    placeholder="Adam"
                ></v-text-field>
                <p>Room: {{ roomId }}</p>
                <v-btn @click="onSetPlayerNameClick">Set Player Name</v-btn>

            </div>

            <ul id="players">
                <li v-for="player in players" :key="player.name">
                    {{ player.name }}
                </li>
            </ul>
          </v-flex>

          <v-flex>
            <CardDeck
              :onDeckEmpty="onDeckEmpty"
              :onCardGuessed="onCardGuess"
              :cards="cards"
              class="card-deck"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
     
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import CardDeck from '@/components/Card/CardDeck.vue';
import Cards from '@/data/Cards';
import ProgressBar from '@/components/ProgressBar.vue';
import Button from '@/components/Button.vue';
import Footer from '@/components/Footer.vue';
import Scoreboard from '@/components/Scoreboard.vue';
import { db } from  '@/components/Firestore.ts';

import {collections, KeyValueService } from '@/components/KeyValueService.ts';

@Component({
  components: {
    Button,
    CardDeck,
    Footer,
    ProgressBar,
    Scoreboard,
  },
  watch: {
      roomId: {
          immediate: true,
          handler(roomId) {
              if (roomId == '') {
                  return;
              }

              this.$bind('players', collections.players(roomId))
          }
      }
  }
})
export default class Home extends Vue {
    private _kvService: KeyValueService | null = null;

    @Prop() private roomId?: string | null;

    private roomIdTextField: string = '';

    private players: string[] = [];

    private playerName?: string | null = null;

    private isMaster: boolean = false;

    private cards: Array<any> = [];
    private cardIds: Array<string> = [];

    public created() {
        this._kvService = new KeyValueService();
    }

    public async onCreateGameClick() {
        if (this._kvService) {
            this.roomId = await this._kvService.createRoomAsync();

            this.isMaster = true;

            db.collection(`rooms/${this.roomId}/players`).onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const playerId = change.doc.id;
                        console.log("New player: ", change.doc.data().name);

                        db.collection(`rooms/${this.roomId}/players`)
                            .doc(playerId)
                            .update({
                                candiateCards: [ 1, 2, 3, 4, 5]
                            });
                    }
                })
            })

            this.$router.push(`/${this.roomId}`);
        }
    }

    public async onJoinGameClick() {
        if (this.roomIdTextField) {
            this.$router.push(`/${this.roomIdTextField}`);
        }
    }

    public async onSetPlayerNameClick() {
        if (this._kvService && this.playerName && this.roomId) {
            this._kvService.setPlayerAsync(this.roomId, this.playerName);
        }
    }


    private onCardGuess(guessedCard: any) {
        // this.scores[this.activeTeam] += guessedCard.points;

        this.cards = this.cards.filter(card => card.id != guessedCard.id);
    }
}
</script>

<style scoped>
.viewport {
  position: fixed;
  height: 100%;
  width: 100%;
}

</style>
