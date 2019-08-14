import Vue from 'vue'
import { firestorePlugin } from 'vuefire';
import firebase from 'firebase';

Vue.use(firestorePlugin);

var firebaseConfig = {
  };

export const db = firebase
    .initializeApp(firebaseConfig)
    .firestore();