<template>
    <!-- <div class="footer">
      <slot></slot>
    </div> -->

  <v-footer>
    <slot></slot>
    <v-spacer></v-spacer>
    <!-- <div>&copy; {{ new Date().getFullYear() }}</div> -->
  </v-footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Footer extends Vue {}
</script>

<style scoped>
.footer {
  margin-bottom: 1em;
}
</style>
