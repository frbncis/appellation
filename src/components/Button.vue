<template>
    <v-btn
        v-if="!startButtonPressed"
        @click="(event) => this.$emit('click', event)"
        block
        color="secondary"
    >
        {{ text }}
    </v-btn>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

@Component
export default class Button extends Vue {
    @Prop() private text?: string;
}
</script>
