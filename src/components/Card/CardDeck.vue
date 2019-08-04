<template>
<div style="{ display: block }">

    <vue-swing
        @throwoutright="_onCardSkipped"
        @throwoutleft="_onCardGuessed"
        :config="swingConfig"
        ref="stack"
        v-if="renderableCards"
    >
        <div v-for="card in renderableCards" :key="card.renderKey" class="card">
            <div class="card-content">
                <div class="card-data">
                    <h1 class="card-title">{{ card.title }}</h1>
                    <p class="card-description">
                        {{ card.description }}
                    </p>
                </div>
                <hr />
                <div
                    class="card-meta"
                    :class="{
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
                        <div 
                            class="card-points-container-cap"
                        >
                            <p class="card-points">
                                {{ card.points }}
                            </p>
                        </div>
                        <div
                            class="card-points-container-bottom card-points-container-shape"
                        >
                            <p>Points</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </vue-swing>
</div>
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
        console.log("Calculating renderableCards");

        if (!this.cards)
        {
            return [];
        }

        console.log(`${this.cards.length} cards remaining...`);

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

        if (nextCard != this.topCard) {
            this.nextCard = renderableCardsCandidates[renderableCardsCandidates.length -1];
        } else {
            this.nextCard = undefined;
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
            const xConfidence = Math.min(Math.abs(xOffset) / (0.55 * element.offsetWidth), 1);
            // const yConfidence = Math.min(Math.abs(yOffset) / (0.25 * element.offsetHeight), 1);

            // return Math.max(xConfidence, yConfidence);
            return xConfidence;
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

        if (this.nextCard) {
            console.log("Setting top card");
            this.topCard = this.nextCard;
        } else {
            console.log("DECK EMPTY!!!!")
            if(this.onDeckEmpty) {
                this.onDeckEmpty();
            }
        }

        if (this.onCardGuessed)
            this.onCardGuessed(<CardData>skippedCard);
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
    background-color: #FFF;
    width: inherit;
    max-width: 274px;
    height: 435px;
    margin: 20px auto;
    padding-top: 30px;
    padding-left: 25px;
    padding-right: 25px;
    border-radius: 15px;
    border: 1px;
    border-style: solid;
    position: absolute;
  
    left: calc(50% - (326px / 2));
    display: block;
}

hr {
    width: 33%;
    color: lightgray;
    border-style: dashed;
    border-width: 1px;
}

.card .card-data {
    min-height: 60%;
}

.card-content {
    height: inherit;
}

.card-description {
    text-align: left;
}

.card-content .card-meta {
    height: 40%;
    bottom: 0;
}

.card-category {
    text-transform: uppercase;
    text-align: center;
}

.card-points-container-shape {
    width: 100px;
    text-align: center;
    left: calc(50% - 50px);
    position: absolute;
}

.card-points-container-cap {
    /* width: 100px; */
    height: 50px; /* as the half of the width */
    border-top-left-radius: 110px;  /* 100px of height + 10px of border */
    border-top-right-radius: 110px; /* 100px of height + 10px of border */
    border: 1px solid rgba(0,0,0,0);
    /* border-bottom: 0; */
}

.card-points-container-shape p {
    color: white;
    text-transform: uppercase
}

h2 {
    font-size: 1em;
}

.card-points {
    font-weight: bold;
    font-size: 2em;
    top: -0.75em;
    position: relative;
}

.card-points-container-bottom p {
    font-size: 0.75em;
    font-weight: lighter;
}

.points-1 h2 {
    color: rgba(76, 189, 159, 1)
}

.points-1 > .card-points-container-shape > div {
    background-color: rgba(76, 189, 159, 1)
}

.points-2 h2 {
    color: #00B4EF
}

.points-2 > .card-points-container-shape > div {
    background-color: #00B4EF
}

.points-3 h2 {
    color: #866AAD
}

.points-3 > .card-points-container-shape > div {
    background-color: #866AAD
}

.points-4 h2 {
    color: rgba(239, 83, 63, 1)
}

.points-4 > .card-points-container-shape > div {
    background-color: rgba(239, 83, 63, 1)
}

</style>

