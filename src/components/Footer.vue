<template>
  <v-footer
    app
    fixed
    color="rgba(36, 36, 36, 1)"
    style="height: 120px;"
  >
    <v-flex
      class="pb-2 pt-2"
    >
      <slot></slot>
    </v-flex>
  </v-footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Footer extends Vue {}
</script>

<style scoped>

</style>
