import Vue from "nativescript-vue";

import router from './router'
import "./assets/css/custom-style.css";


import {TNSFontIcon, fonticon} from 'nativescript-fonticon';

import RadListView from 'nativescript-ui-listview/vue';




TNSFontIcon.debug = false;
TNSFontIcon.paths = {
  'zmdi': './assets/css/material-design-iconic-font.css',
  'fa': './assets/css/font-awesome.css',
};
TNSFontIcon.loadCss();


/*if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools);
}*/
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.prototype.$router = router

Vue.prototype.$goto = function (to, options) {
	 var options = options || { 
	        clearHistory: false, 
	        backstackVisible: true, 
	        transition: { 
	            name: "fade",
	            duration: 380,
	            curve: "easeIn"
	        }
	    }
    this.$navigateTo(this.$router[to], options)
}
global.server = 'https://www.famefan.com/';  
global.uid = 35;  
global.isingIn = true;
global.artist_id = 1;
global.my_feed = 0;
//global.post.id= '1';

Vue.registerElement('YoutubePlayer', () => require('nativescript-youtubeplayer').YoutubePlayer);
Vue.registerElement("Gradient", () => require("nativescript-gradient").Gradient);
Vue.registerElement('CheckBox', () => require('nativescript-checkbox').CheckBox, {
										model: {
											prop: 'checked',
											event: 'checkedChange'
										}
									});
Vue.filter('fonticon', fonticon);
Vue.use(RadListView);
new Vue({
  render: h => h('frame', [h(router['home'])])
}).$start();