import Vue from 'vue';
import Router from 'vue-router';

import RoomSetup from './components/RoomSetup.vue'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'RoomSetup',
      component: RoomSetup,
    },
    {
      path: '/room/:roomId?',
      name: 'PlayerSetup',
      component: () => import(/* webpackChunkName: "setup" */ './views/Setup.vue'),
      props: true,
    },
    {
      path: '/rules',
      name: 'Rules',
      component: () => import(/* webpackChunkName: "rules" */ './views/Rules.vue'),
    },
  ],
});
