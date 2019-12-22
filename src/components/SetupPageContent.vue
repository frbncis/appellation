<template>
  <v-content>
      <v-col
        cols="12"
        style="
          height: 100%;
          padding: 0;
          display: flex;
          align-items: center;
          flex-direction: column;"
      >
        <RoomCodeHeader />
        <slot />
      </v-col>
  </v-content>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import RoomCodeHeader from '@/components/RoomCodeHeader.vue';

@Component({
  components: {
    RoomCodeHeader,
  },
})
export default class SetupPageContent extends Vue {

}
</script>
