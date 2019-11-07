<template>
    <vue-swing
            @throwoutright="_onCardSkipped"
            @throwoutleft="_onCardGuessed"
            :config="swingConfig"
            ref="stack"
            v-if="renderableCards"
        >
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

                <v-flex class="card-meta"
                    :class="{
                        'points-1': card.points == 1,
                        'points-2': card.points == 2,
                        'points-3': card.points == 3,
                        'points-4': card.points == 4,
                    }"
                >
                    <h2 class="card-category">
                        {{ card.category }}
                    </h2>

                    <div class="semicircle" />             

                    <v-flex class="card-points-container-shape">
                        <h3>{{ card.points }}</h3>
                        <p class="points-text">Points</p>
                    </v-flex>
                </v-flex>
            </v-layout>
        </div>
    </vue-swing>
</template>

<script lang="ts">
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
    
    @Prop() private onDeckEmpty?: () => void;

    @Prop() private cards?: Array<CardData>;

    private renderKey: number = 0;
    
    private topCard?: CardData;

    private nextCard?: CardData;

    /**
     * Backing field for the getter slidingWindowIndex
     */
    private slidingWindowIndexField: number = 0;

    /**
     * Index of the top card being rendered.
     */
    public get slidingWindowIndex(): number {
        return this.slidingWindowIndexField % this.cards.length;
    }

    get renderableCards(): Array<CardDataView> {
        console.log("Getting renderableCards");

        if (!this.cards || this.cards.length == 0) {
            console.log(`CardDeck.renderableCards - got no cards.`);
            return [];
        }

        let renderableCardsCandidates;

        // Case 1: Initial Load
        // Case 1a: Deck greater than 2.
        if (this.cards.length >= 2) {
            renderableCardsCandidates = [
                this.cards[(this.slidingWindowIndex + 1) % this.cards.length],
                this.cards[this.slidingWindowIndex],
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
            const xConfidence = Math.min(Math.abs(xOffset) / (0.55 * element.offsetWidth), 1);
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
        const selectedCard = this.renderableCards[this.renderableCards.length - 1];

        if (this.onCardGuessed) {
            console.log("CardDeck._onCardGuess() - executing callback for onCardGuessed", selectedCard);
            this.onCardGuessed(<CardData>selectedCard);
        }
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

@media only screen and (max-width: 320px) {
    .card-description {
        height:60%;
        font-size: smaller;
    }
}

.card-details {
    height: 60%;
    font-family: 'Franklin Gothic Book', 'Arial', Arial, sans-serif;
    padding-left: 7%;
    padding-right: 7%
}

.card-title {
    text-align: center;
    padding-top: 0.5em;
    padding-bottom: 0.5em;    
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
    width: inherit;
    align-items: baseline;
    justify-content: center;
    flex-direction: column;
}

.card-meta:before {
    border-top: 0.09em dashed lightgray;
    content: "";
    display: block;
    margin: 0 auto; 
    width: 33%;
}

.card-category {
    text-transform: uppercase;
    text-align: center;
    margin-top: 1em;
    margin-bottom: 1.5em;
    font-family: 'Franklin Gothic Demi', 'Arial Black', Arial, sans-serif;
    letter-spacing: 0.1em;
}

.card-points-container-shape {
    width: 80px;
    text-align: center;
    left: calc(50% - 40px);
    bottom: 0;
    position: absolute;
    color: white;
    padding-top: 0.5em;
    border-top:black;
    border-top-left-radius: 50%;
    border-top-right-radius: 50%;
}

.card-points-container-shape p {
    text-transform: uppercase;
    font-family: 'Franklin Gothic Book', 'Arial Narrow', Arial, sans-serif;
    font-size: 0.75em;
}

h2 {
    font-size: 0.9em;
}

.card-points-container-shape h3 {
    font-size: 1.5em;
    font-family: 'Franklin Gothic Demi', 'Arial Black', Arial, sans-serif;
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

</style>

