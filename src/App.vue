<template>
  <v-app>
    <!-- <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Vuetify</span>
        <span class="font-weight-light">MATERIAL DESIGN</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        text
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
      >
        <span class="mr-2">Latest Release</span>
      </v-btn>
    </v-app-bar> -->

    <!-- <v-content> -->
    <router-view/>
    <!-- </v-content> -->
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import HelloWorld from './components/HelloWorld.vue';

// export default Vue.extend({
//   name: 'App',
//   components: {
//   },
//   data: () => ({
//   }),
// });

@Component({})
export default class App extends Vue {
  public created() {
    console.log(`clientHeight is initially ${document.documentElement.clientHeight}`);

// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = document.documentElement.clientHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // We listen to the resize event
    window.addEventListener('resize', () => {
      // We execute the same script as before
      let vh = document.documentElement.clientHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
  }
}
</script>

<style>
.v-application--wrap {
  min-height: calc(var(--vh, 1vh) * 100) !important;
  max-height: calc(var(--vh, 1vh) * 100) !important;
}

</style>