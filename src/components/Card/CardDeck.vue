<template>
    <vue-swing
            @throwoutright="_onCardSkipped"
            @throwoutleft="_onCardGuessed"
            :config="swingConfig"
            ref="stack"
            v-if="renderableCards"
        >
        <!-- <div> -->
        <div
            v-for="card in renderableCards" :key="card.renderKey" class="card"
        >
            <v-layout fill-height column text-center>
                <v-flex class="card-details">
                    <h1 class="card-title">
                        {{ card.title }}
                    </h1>

                    <p class="card-description">
                        {{ card.description }}
                    </p>
                </v-flex>

                <!-- <v-flex justify-center> -->
                <!-- </v-flex> -->

                <v-flex class="card-meta">
                                        <hr />

                    <!-- <v-flex> -->
                        <h2 class="card-category">
                            {{ card.category }}
                        </h2>                    
                    <!-- </v-flex> -->

                    <v-flex class="card-points card-points-container-cap">
                            {{ card.points }}
                    </v-flex>
                        
                    <!-- <v-flex> -->
                         <!-- class="card-points-container-bottom card-points-container-shape"> -->
                        <p>Points</p>
                    <!-- </v-flex> -->
                </v-flex>
            </v-layout>
        </div>
    </vue-swing>
        <!-- </div> -->
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
        if (!this.cards)
        {
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
        
        const nextCard = renderableCardsCandidates[renderableCardsCandidates.length - 1];

        if (nextCard != this.topCard) {
            this.nextCard = renderableCardsCandidates[renderableCardsCandidates.length - 1];
        } else {
            this.nextCard = undefined;
        }

        return renderableCardsCandidates.reduce((accumulator: Array<CardDataView>, card: CardData) => {
            const view = <CardDataView>card;

            view.renderKey = this.keyCounter++;

            accumulator.unshift(view);

            return accumulator;
        }, []);
    }

    private swingConfig = {
        throwOutConfidence: (xOffset: number, yOffset: number, element: HTMLElement) => {
            const xConfidence = Math.min(Math.abs(xOffset) / (0.55 * element.offsetWidth), 1);
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
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    position: absolute;
    height: inherit;
    width: inherit;
    padding: 1em;
}

hr {
    margin: 0 33% 0 33%;
    width: 33%;
    border-style: dashed;
    border-width: 1px;
    color: lightgray;
}

.card-details {
    height: 75%;
    font-family: 'Franklin Gothic Book', 'Arial', Arial, sans-serif;
    padding-left: 7%;
    padding-right: 7%
}

.card-title {
    text-align: center;
    padding-top: 1em;
    padding-bottom: 1em;
    height: 4.5em;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

.card-data {
    height: 60%;
    font-size: smaller;
}

.card-content {
    height: inherit;
}

.card-description {
    text-align: left;
}

.card-meta {
    bottom: 0;
    /* position: absolute; */
    width: inherit;
    align-items: baseline;
    justify-content: center;
    flex-direction: column;
    
    /* align-items: center; */
    /* justify-content: center; */
    font-family: 'Franklin Gothic Heavy', 'Arial Black', Arial, sans-serif
}

.card-category {
    text-transform: uppercase;
    text-align: center;
    margin-top: 2.5em;
    margin-bottom: 2.5em;
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
    font-size: 2em;
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

