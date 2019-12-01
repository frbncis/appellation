import Vue from 'vue';
import Router from 'vue-router';
import Setup from './views/Setup.vue';
import Rules from './views/Rules.vue';

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
      name: 'Main',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      // component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
      component: Setup,
      props: true,
    },
    {
      path: '/rules',
      name: 'Rules',
      component: Rules,
    },
  ],
});
