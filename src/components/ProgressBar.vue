<template>
    <div class="progress-bar">
        <span :style="{ width: progressWidth }" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ProgressBar extends Vue {
    get progressWidth() {
        if (this.progress) {
            return `${this.progress}%`;
        }

        return '0%';
    }

    @Prop() private progress?: number;
}
</script>

<style scoped>
.progress-bar { 
	height: 0.25em;  /* Can be anything */
	position: relative;
	/* background: #555; */
	/* -moz-border-radius: 25px; */
	/* -webkit-border-radius: 25px; */
	/* border-radius: 25px; */
	/* padding: 10px; */
	/* box-shadow: inset 0 -1px 1px rgba(255,255,255,0.3); */
}

.progress-bar  > span {
  display: block;
  height: 100%;
  /* border-top-right-radius: 8px; */
  /* border-bottom-right-radius: 8px; */
  /* border-top-left-radius: 20px; */
  /* border-bottom-left-radius: 20px; */
  background-color: lightgray;
  /* background-image: linear-gradient(
    center bottom,
    rgb(43,194,83) 37%,
    rgb(84,240,84) 69%
  ); */
  /* box-shadow: 
    inset 0 2px 9px  rgba(255,255,255,0.3),
    inset 0 -2px 6px rgba(0,0,0,0.4); */
  position: relative;
  overflow: hidden;
}
</style>
