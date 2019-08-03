<template>
    <vue-swing
        @throwoutright="_onCardSkipped"
        @throwoutleft="_onCardGuessed"
        :config="swingConfig"
        ref="stack"
        v-if="renderableCards"
    >
        <div v-for="card in renderableCards" :key="card.renderKey" class="card"> 
            <h1 class="card-title">{{ card.title }}</h1>
            <p class="card-description">
                {{ card.description }}
            </p>
            <h2 class="card-category">
                {{ card.category }}
            </h2>

            <h2 class="card-points">
                {{ card.points }}
            </h2>

            <p>Points</p>
        </div>
    </vue-swing>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import VueSwing from 'vue-swing';

interface CardData {
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

    private keyCounter: number = 0;
    private topCard?: CardData;
    private nextCard?: CardData;

    @Prop() private onCardGuessed?: (card: CardData) => void;
    @Prop() private onDeckEmpty?: () => void;

    @Prop() private cards?: Array<CardData>;

    get renderableCards(): Array<CardDataView> {
        if (!this.cards || this.cards.length == 0) {
            if(this.onDeckEmpty) {
                this.onDeckEmpty();
            }

            return [];
        }

        let topCardIndex;

        // Only create the DOM elements for the top and next card.
        if (this.topCard == undefined) {
            this.topCard = this.cards[0];
            topCardIndex = 0;
        } else {
            topCardIndex = this.cards.indexOf(this.topCard);
        }

        let renderableCardsCandidates;

        if (this.cards.length == 1) {            
            renderableCardsCandidates = this.cards.slice(0, 1);
        }
        else if (this.cards.length <= topCardIndex + 1) {
            renderableCardsCandidates = [
                this.cards[topCardIndex],
                this.cards[0]
            ]
        } else {
            renderableCardsCandidates = this.cards.slice(topCardIndex, topCardIndex + 2);
        }
        
        const nextCard = renderableCardsCandidates[renderableCardsCandidates.length -1];

        if (nextCard) {
            this.nextCard = renderableCardsCandidates[renderableCardsCandidates.length -1];
        }

        return renderableCardsCandidates.reduce((accumulator: Array<CardDataView>, card: CardData) => {
            const view = <CardDataView>card;

            view.renderKey = this.keyCounter++;

            accumulator.push(view);

            return accumulator;
        }, []).reverse();
    }

    private swingConfig = {
        throwOutConfidence: (xOffset: number, yOffset: number, element: HTMLElement) => {
            const xConfidence = Math.min(Math.abs(xOffset) / element.offsetWidth, 1);
            const yConfidence = Math.min(Math.abs(yOffset) / element.offsetHeight, 1);

            return Math.max(xConfidence, yConfidence);
        },
        allowedDirections: [
            VueSwing.Direction.LEFT,
            VueSwing.Direction.RIGHT,
        ],
    }

    private _onCardSkipped() {
        setTimeout(() => {
            const skippedCard = this.renderableCards.pop();
            const appendedCard = Object.assign({}, skippedCard, { renderKey: this.keyCounter++ });

            setTimeout(() => {
                this.renderableCards.unshift(appendedCard);
            }, 50);
        }, 50);

        if (this.nextCard)
            this.topCard = this.nextCard;
    }

    private _onCardGuessed() {
        const skippedCard = this.renderableCards.pop();

        if (this.nextCard)
            this.topCard = this.nextCard;

        if (this.onCardGuessed)
            this.onCardGuessed(<CardData>skippedCard);
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
  background-color: #FFF;
  width: 15%;
  height: 410px;
  margin: 20px auto;
  padding: 30px 25px 0 25px;
  border-radius: 15px;
  border: 1px;
  border-style: solid;
  position: absolute;
  top: calc(50% - 205px);
  left: calc(43%);
}
</style>
