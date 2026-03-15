import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ModeSelect from '../views/ModeSelect.vue';
import MapView from '../views/Map.vue';
import RestaurantDetail from '../views/RestaurantDetail.vue';
import Favorites from '../views/Favorites.vue';
import Profile from '../views/Profile.vue';
import DeliveryMock from '../views/DeliveryMock.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/mode',
    name: 'ModeSelect',
    component: ModeSelect
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView
  },
  {
    path: '/restaurant/:id',
    name: 'RestaurantDetail',
    component: RestaurantDetail
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/delivery/:id',
    name: 'DeliveryMock',
    component: DeliveryMock
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
