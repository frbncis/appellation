<template>
    <v-progress-circular
        :class="{ 'timer': true, 'scale-up': shouldScaleUp }"
        size="60"
        width="4"
        rotate="-90"
        :value="timeRemainingSeconds / timerStartValue * 100"
        :color="color" >
        {{ timeRemainingSeconds }}
    </v-progress-circular>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Timer extends Vue {
    private timeRemainingSeconds: number = 120;

    private timer?: number = undefined;

    private shouldScaleUp: boolean = true;

    @Prop() private timerStartValue?: number;

    @Prop() private timerRunning?: boolean;

    @Prop() private onTimerEnded?: () => void;

    get timeSecondsRemaining() {
      return this.timeRemainingSeconds;
    }

    get color() {
      if (this.timeRemainingSeconds < 10) {
        return "error";
      } else if (this.timeRemainingSeconds < 20) {
        return "warning";
      } else {
        return "primary";
      }
    }

    public beforeMount() {
      if (this.timerStartValue) { this.timeRemainingSeconds = this.timerStartValue; }
    }

    public mounted() {
      this.startTimer();
    }

    public beforeDestroy() {
      this.stopTimer();
    }


    // public beforeUpdate() {
    //     if (this.timerRunning && this.timer) {
    //         console.log("Starting timer");
    //         this.startTimer();
    //     } else if (!this.timerRunning && this.timer) {
    //         this.stopTimer();
    //     }
    // }

    private startTimer() {
      this.timer = setInterval(this.updateTimer, 1000);
    }

    private updateTimer() {
      this.timeRemainingSeconds--;

      if (this.timeRemainingSeconds <= 10) {
        this.shouldScaleUp = !this.shouldScaleUp;

        setTimeout(() => this.shouldScaleUp = !this.shouldScaleUp, 100);
      }

      if (this.timeRemainingSeconds <= 0) {
        this.stopTimer();

        if (this.onTimerEnded) {
          this.onTimerEnded();
        }
      }
    }

    private stopTimer() {
      clearInterval(this.timer);
    }
}
</script>

<style>
.timer {
    font-weight: bold;
    font-size: x-large;
    transition: all 0.005s ease-in-out;
}

.scale-up {
  transform: scale(1.1);
}
</style>
