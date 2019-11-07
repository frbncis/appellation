<template>
    <div class="scoreboard-container">
        <div text-left class="team-game-header" :class="{ 'active-team': activeTeam == 1 }">
            <p>Team 1</p>
            <p>{{ scores[1] }}</p>
        </div>

        <v-spacer />

        <div text-center class="team-game-header">
            <Timer
                v-if="isRoundActive"
                :timerRunning="isRoundActive"
                :timerStartValue="timerStartValue"
                :onTimerEnded="onTimerEnded"
            />
        </div>

        <v-spacer />

        <div text-right class="team-game-header right-header" :class="{ 'active-team': activeTeam == 2 }">
            <p>Team 2</p>
            <p>{{ scores[2] }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Timer from '@/components/Timer.vue';

@Component({
  components: {
    Timer,
  },
})
export default class Scoreboard extends Vue {
    @Prop() private scores?: any;

    @Prop() private activeTeam?: number;

    @Prop() private isRoundActive?: boolean;

    @Prop() private timerStartValue?: number;

    @Prop() private onTimerEnded?: () => void;
}
</script>

<style scope>
.scoreboard-container {
    display: flex;
    padding: 12px;
}

.right-header {
    text-align: right;
}

.active-team {
    font-weight: 700;
    border-bottom-style: outset;
}
</style>
