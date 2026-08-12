import Vue from 'vue';
import vueCustomElement from 'vue-custom-element';
import PrimeVue from 'primevue/config';
import VueAlarmsWidget from './VueAlarmsWidget.vue';

// Import PrimeVue Core styles
import 'primevue/resources/primevue.min.css';

// Import BOTH light and dark themes. 
// Our custom postcss plugin in vite.config.js will magically scope them 
// to `html:not(.app-dark)` and `.app-dark` respectively!
import 'primevue/resources/themes/lara-light-indigo/theme.css';
import 'primevue/resources/themes/lara-dark-indigo/theme.css';

// Setup Vue plugins
Vue.use(vueCustomElement);
Vue.use(PrimeVue);

// Register the component as a Web Component (<vue-alarms-widget>)
Vue.customElement('vue-alarms-widget', VueAlarmsWidget);
