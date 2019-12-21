<template>
  <div class="room-code-header">
    <h3>Room</h3>
    <h2>{{ roomId }}</h2>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { storeHelpers } from '../store';

@Component({
  components: {},
})
export default class RoomCodeHeader extends Vue {
  // eslint-disable-next-line class-methods-use-this
  private get roomId(): string {
    return storeHelpers.room.data.roomId || '??';
  }
}
</script>

<style scoped>
.room-code-header {
  padding-top: 1em;
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>
