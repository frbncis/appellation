<template>
<div>
  <v-content>
    <v-container fill-height>
      <h1>Getting Started</h1>

      <p>Monikers only takes about 5-10 minutes to learn. Start 
        by dividing your group into 2 teams.</p>

      <p>Deal 8 cards to each person. Everyone secretly chooses 5 
        that they like. Shuffle all the cards people chose into one 
        deck, which will be used by both teams for the entire game. Put 
        the other cards back in the box.</p>
      
      <p>You want to aim for using around 40-50 cards in the deck, so 
        deal fewer and choose fewer playing with a big group, and 
        deal more and choose more with a small group.</p>

      <h1>How to Play</h1>

      <p>A person from the starting team has 60 seconds to
      get their team to guess as many names as possible
      from the deck by giving clues about the person’s
      identity. (If you’re playing with more than 10 people,
      30-45 seconds is probably better.) There’s no limit to
      the number of guesses.</p>

      <p>Skipping is allowed and highly encouraged in all
      rounds.</p>

      <p>Teams keep the cards they guessed correctly for
      scoring. Reshufe skipped cards into the deck after
      each turn.</p>

      <p>Teams take turns giving clues. Each player should
      take a turn giving clues before any teammates repeat.
      Go in clockwise order or feel free to use some other
      system.</p>

      <p>A round ends when all cards from the deck have
      been guessed correctly. When that happens, teams
      add the point values from each card they correctly
      guessed. Write those numbers down somewhere, then
      shufe all the cards back together into one deck.
      The team with the lowest score begins the next round.</p>

      <h1>Rules for Each Round</h1>

      <p>Monikers has 3 rounds. Each has a restriction on how players are allowed to give clues:</p>

      <div>
        <h4>
          ROUND 1
        </h4>
        <p>
          You can use any words, sounds, or
          gestures except the name itself, including the clue
          text on the card. If you say any part of the name, you
          have to skip that card this turn.
        </p>
      </div>

      <div>
        <h4>
          ROUND 2
        </h4>
        <p>
          Use only one word, which can be
          anything except the name itself. You can repeat that
          word as many times as you like, but no sounds or
          gestures.
        </p>
      </div>
    
      <div>
        <h4>
          ROUND 3
        </h4>
        <p>
          Just charades. No words. Sound effects are OK.
        </p>
      </div>
    </v-container>
  </v-content>

  <v-footer 
    app
    fixed
    color="#0bf"
  >
  
  <v-flex class="pb-4 pt-4">
    <v-flex>
      <v-btn
        block
        outlined
        dark
        @click="onRulesClicked"
      >
        About
      </v-btn>
    </v-flex>

    <v-flex
      class="pt-5"
    >
      <v-btn
        block
        outlined
        dark
        @click="onBackClicked"
      >
        Back
      </v-btn>
    </v-flex>
  </v-flex>
  </v-footer>
</div>
</template>


<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({})
export default class Rules extends Vue {
  public async onBackClicked() {
    this.$router.go(-1);
  }
}
</script>

<style scoped>

</style>
