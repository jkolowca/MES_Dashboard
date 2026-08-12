import Vue from 'vue';
import vueCustomElement from 'vue-custom-element';
import PrimeVue from 'primevue/config';
import HelloVue from './HelloVue.vue';

// Import PrimeVue Core styles (they will be scoped to hello-vue by postcss)
import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/lara-light-indigo/theme.css';

// Setup Vue plugins
Vue.use(vueCustomElement);
Vue.use(PrimeVue);

// Register the component as a Web Component (<hello-vue>)
Vue.customElement('hello-vue', HelloVue);
