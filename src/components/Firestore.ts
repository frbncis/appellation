import Vue from 'vue';
import { firestorePlugin } from 'vuefire';
import firebase from 'firebase';

Vue.use(firestorePlugin);

const firebaseConfig = {
  apiKey: 'AIzaSyBSi6PbxN0BQ7FwNZkd-Z7RDtK0WwXw-6U',
  authDomain: 'appellation-4edff.firebaseapp.com',
  databaseURL: 'https://appellation-4edff.firebaseio.com',
  projectId: 'appellation-4edff',
  storageBucket: '',
  messagingSenderId: '889905309620',
  appId: '1:889905309620:web:b224ce1112436004',
};

export const db = firebase
  .initializeApp(firebaseConfig)
  .firestore();
