<template>
    <v-col
      cols="12"
    >
      <vue-swing
        @throwoutright="_onCardGuessed"
        @throwoutleft="_onCardSkipped"
        :config="swingConfig"
        ref="stack"
        v-if="renderableCards"
        @dragmove="onCardMoved"
        @dragend="onCardMovementStopped"
        class="swinggable-card-deck"
      >
        <v-row
          v-for="card in renderableCards"
          :key="card.renderKey"
          class="card"
          justify="center"
          align="stretch"
        >
          <div class="swipe-hint swipe-skip-hint" style="display: none;">
            <v-icon color="#00B4EF" size="100">replay</v-icon>
          </div>

          <div class="swipe-hint swipe-guess-hint" style="display: none;">
            <v-icon color="rgba(76, 189, 159, 1)" size="100">checkmark</v-icon>
          </div>

          <v-col 
            cols="12"
            class="card-data"
          >
            <h1 class="card-title">
              {{ card.title }}
            </h1>

            <div style="height:auto;">
              <p class="card-description">
                {{ card.description }}
              </p>
            </div>

            <div
              :class="{
                'points': true,
                'points-1': card.points == 1,
                'points-2': card.points == 2,
                'points-3': card.points == 3,
                'points-4': card.points == 4,
              }"
            >
              <h2
                class="card-category"
              >
                {{ card.category }}
              </h2>

              <div class="card-points-container-shape">
                <h3>{{ card.points }}</h3>
                <p class="points-text">Points</p>
              </div>
            </div>
          </v-col>
        </v-row>
      </vue-swing>
    </v-col>
</template>

<script lang="ts">
import VNode from 'vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import VueSwing from 'vue-swing';

export interface CardData {
    id : number;
    title: string;
    description: string;
    category: string;
    points: number;
}

interface CardDataView extends CardData {
    renderKey: number;
}

@Component({
    components: {
        VueSwing,
    },
})

export default class CardDeck extends Vue {
    
    @Prop() private onCardGuessed?: (card: CardData) => void;
    
    @Prop() private cards?: Array<CardData>;

    private renderKey: number = 0;
    
    private topCard?: CardData;

    private nextCard?: CardData;

    private cardMovementState = {}

    /**
     * Backing field for the getter slidingWindowIndex
     */
    private slidingWindowIndexField: number = 0;

    /**
     * Index of the top card being rendered.
     */
    public get slidingWindowIndex(): number {
      return this.slidingWindowIndexField % this.cards!.length;
    }

    public onCardMoved(cardMovement: any) {
      const movedCardDiv: HTMLDivElement = cardMovement.target;
      const movedDirection = cardMovement.throwDirection;
      const movedConfidence = cardMovement.throwOutConfidence;

      let hint: CardHint = CardHint.None;

      if (movedDirection == VueSwing.Direction.RIGHT && movedConfidence == 1) {
        hint = CardHint.Guessed;
      } else if (movedDirection == VueSwing.Direction.LEFT && movedConfidence == 1) {
        hint = CardHint.Skipped;
      } else {
        hint = CardHint.None;
      }

      this.setCardHints(movedCardDiv, hint);
    }
    
    public onCardMovementStopped(cardMovement: any) {
      this.setCardHints(cardMovement.target, CardHint.None)
    }

    private setCardHints(card: HTMLDivElement, hint: CardHint) {
      const show = 'block';
      const hide = 'none';

      const skipHint = '.swipe-skip-hint';
      const guessHint = '.swipe-guess-hint';

      const setHintVisibility = (card: HTMLDivElement, hintSelector: string, hintState: string) => {
        (<HTMLDivElement>(card.querySelector(hintSelector)!)).style.display = hintState;
      };

      switch (hint) {
        case CardHint.Guessed:
          setHintVisibility(card, guessHint, show);

          break;
        case CardHint.Skipped:
          setHintVisibility(card, skipHint, show);
          
          break;
        case CardHint.None:
          setHintVisibility(card, skipHint, hide);
          setHintVisibility(card, guessHint, hide);

      }
    }

    get renderableCards(): Array<CardDataView> {
        console.log("Getting renderableCards");

        if (!this.cards || this.cards.length == 0) {
            console.log(`CardDeck.renderableCards - got no cards.`);
            return [];
        }

        let renderableCardsCandidates: Array<CardData> = [];

        // Case 1: Initial Load
        // Case 1a: Deck greater than 2.
        if (this.cards.length >= 2) {
            renderableCardsCandidates = [
                this.cards[this.slidingWindowIndex],
                this.cards[(this.slidingWindowIndex + 1) % this.cards.length],
            ];
        } else if (this.cards.length == 1) {
            renderableCardsCandidates = [
                this.cards[this.slidingWindowIndex]
            ];
        }

        const renderableCards = renderableCardsCandidates.map((card: CardData) => {
            const view = <CardDataView>card;

            view.renderKey = this.renderKey++;

            return view;
        });

        return renderableCards;
    }

    private swingConfig = {
        throwOutConfidence: (xOffset: number, yOffset: number, element: HTMLElement) => {
            const xConfidence = Math.min(Math.abs(xOffset) / (0.30 * element.offsetWidth), 1);
            return xConfidence;
        },
        allowedDirections: [
            VueSwing.Direction.LEFT,
            VueSwing.Direction.RIGHT,
        ],
    }

    private _onCardSkipped() {
        console.log("Incrementing _slidingWindowIndex");
        this.slidingWindowIndexField = this.slidingWindowIndexField + 1;
    }

    private _onCardGuessed() {
      const selectedCard = this.renderableCards[0];
      const nextCard = this.renderableCards[1];

      // Recalculate the sliding window index for the next card
      // once it has been removed.
      const nextDeck = this.cards!.filter(card => {
        return card.id !== selectedCard.id;
      });

      this.slidingWindowIndexField = nextDeck.indexOf(nextCard);

      if (this.onCardGuessed) {
        console.log("CardDeck._onCardGuess() - executing callback for onCardGuessed", selectedCard);
        this.onCardGuessed(<CardData>selectedCard);
      }
    }
}

enum CardHint {
  None,
  Skipped,
  Guessed
}
</script>

<style scoped>
h1, p {
  color: black;
}

.swinggable-card-deck {
  position: relative;
  display: flex;
  height: 100%;
}

.card-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0;
}

.card {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding-left: 9%;
  padding-right: 9%;
  height:inherit;
}

.swipe-hint {
  position: absolute;
  text-transform: uppercase;
  font-weight: bold;
  margin: 1em 1em 0 0;
  padding: 0.12em 0.25em 0.12em 0.25em;

  -webkit-mask-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png');
  -webkit-mask-size: 944px 604px;
  mix-blend-mode: multiply;
  font-size: 2em;
  top: 25%;
}

.swipe-skip-hint {
  right: 0;
  color: #00B4EF;
}

.swipe-guess-hint {
  left: 0;
  color: #00B4EF;
}

/* This is the next card. */
.card:first-child {
  position: absolute;
}

/* This is the grabbable card */
.card:last-child {
  /* background: red; */
}

.card-title {
  width: 100%;
  text-align: center;
  padding-top: 1.0em;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

.card-description {
  text-align: left;
  margin-bottom: 0;
}

/* iPhone 7 */
@media only screen 
  and (min-device-width: 320px) 
  and (max-device-width: 480px)
  and (-webkit-min-device-pixel-ratio: 2)
  and (orientation: portrait) {
  
  .card-title {
    font-size: 4vh !important;
  }

  .points-text {
    display: none;
  }

  .card-points-container-shape {
    height: 40px !important;
    border-top-left-radius: 80px !important;
    border-top-right-radius: 80px !important;
  }

  .card-category {
    margin-bottom: 0vh;
    font-size: 2.5vh !important;
  }

  .card-category::before {
    display: none !important;
  }
}

.card-category {
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 1.5em;
  font-family: 'Franklin Gothic Demi', 'Arial Black', Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 0.98em;
}

.card-category::before {
    content: "";
    width: 70%;
    display: block;
    margin: 1.5em auto; 
    border-top: 0.1em dashed lightgray;
}

.points { 
  width: 100%;
}

.points-1 h2 {
    color: rgba(76, 189, 159, 1)
}

.points-1 > .card-points-container-shape {
    background-color: rgba(76, 189, 159, 1)
}

.points-2 h2 {
    color: #00B4EF
}

.points-2 > .card-points-container-shape {
    background-color: #00B4EF
}

.points-3 h2 {
    color: #866AAD
}

.points-3 > .card-points-container-shape {
    background-color: #866AAD
}

.points-4 h2 {
  color: rgba(239, 83, 63, 1)
}

.points-4 > .card-points-container-shape {
  background-color: rgba(239, 83, 63, 1)
}

.card-points-container-shape {
  width: 80px;
  text-align: center;
  color: white;
  padding-top: 0.5em;
  margin-left: calc(50% - 40px);
  border-top:black;
  height: 75px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
}

.card-points-container-shape > p {
  color: #fff;
  text-transform: uppercase;
  font-family: 'Franklin Gothic Demi', 'Arial Black', Arial, sans-serif;
  letter-spacing: 0.1em;
  font-size: 0.70em;
  text-align: center;
  padding-top: 0.7em;
}
</style>