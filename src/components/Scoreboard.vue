<template>
    <v-layout justify-space-between row>
        <v-flex xs4 text-left class="team-game-header" :class="{ 'active-team': activeTeam == 1 }">
            <p>Team 1</p>
            <p>{{ scores[1] }}</p>
        </v-flex>

        <v-flex xs4 text-center class="team-game-header">
            <Timer
                v-if="isRoundActive"
                :timerRunning="isRoundActive"
                :timerStartValue="timerStartValue"
                :onTimerEnded="onTimerEnded"
            />
        </v-flex>

        <v-flex xs4 text-right class="team-game-header" :class="{ 'active-team': activeTeam == 2 }">
            <p>Team 2</p>
            <p>{{ scores[2] }}</p>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Timer from '@/components/Timer.vue';

@Component({
    components: {
        Timer
    }
})
export default class Scoreboard extends Vue{
    @Prop() private scores?: any;
    @Prop() private activeTeam?: number;
    @Prop() private isRoundActive?: boolean;
    @Prop() private timerStartValue?: number;
    @Prop() private onTimerEnded?: () => void;
}
</script>

