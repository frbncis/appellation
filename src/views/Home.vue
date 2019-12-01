<template>
    <!-- <v-container fluid v-if="!isReady">
        <v-layout
          align-center justify-center column fill-height
        >
            <v-flex>
                <v-progress-circular
                    indeterminate
                    :size="60"
                    :width="5"
                />
            </v-flex>
        </v-layout>
    </v-container> -->

    <div>
        <Setup :roomId="roomId"/>
        <!-- <Guessing v-else-if="isGuessing" /> -->
        <!-- <h1 v-else>Game Over.</h1> -->
    </div>
</template>
