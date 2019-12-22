<template>
  <v-footer
    color="rgba(36, 36, 36, 1)"
  >
    <v-flex
      id="footer-buttons"
      class="pb-2"
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

<style>
#footer-buttons button {
  margin-top: 12px;
}
</style>
