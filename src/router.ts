import Vue from 'vue';
import Router from 'vue-router';
import Guessing from './views/Guessing.vue';
import Home from './views/Home.vue';
import Selecting from './views/Selecting.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/:roomId?',
      name: 'Main',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      // component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
      component: Home,
      props: true
    },
    // {
    //   path: '/selecting',
    //   name: 'Selecting',
    //   component: Selecting,
    // },
  ],
});
