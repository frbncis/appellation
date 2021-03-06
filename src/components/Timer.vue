<template>
    <v-progress-circular
        :class="{ 'timer': true, 'scale-up': shouldScaleUp }"
        size="60"
        width="4"
        rotate="-90"
        :value="timeRemainingSeconds / timerInitialValue * 100"
        :color="color" >
        {{ timeRemainingSeconds }}
    </v-progress-circular>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Timer extends Vue {
    @Prop() private timeRemainingSeconds?: number;

    private timer?: number = undefined;

    private shouldScaleUp: boolean = true;

    @Prop() private timerInitialValue?: number;

    @Prop() private timerRunning?: boolean;

    @Prop() private onTimerEnded?: () => void;

    get timeSecondsRemaining() {
      return this.timeRemainingSeconds;
    }

    get color() {
      if (this.timeRemainingSeconds! < 10) {
        return 'error';
      } if (this.timeRemainingSeconds! < 20) {
        return 'warning';
      }
      return 'white';
    }

    public mounted() {
      this.startTimer();
    }

    public beforeDestroy() {
      this.stopTimer();
    }

    private startTimer() {
      this.timer = setInterval(this.updateTimer, 1000);
    }

    private updateTimer() {
      this.$emit('tick');

      if (this.timerRunning) {
        if (this.timeRemainingSeconds! <= 10) {
          this.shouldScaleUp = !this.shouldScaleUp;

          setTimeout(this.toggleTimeScaling, 100);
        }

        if (this.timeRemainingSeconds! <= 0) {
          this.stopTimer();

          if (this.onTimerEnded) {
            this.onTimerEnded();
          }
        }
      }
    }

    private toggleTimeScaling() {
      this.shouldScaleUp = !this.shouldScaleUp;
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
