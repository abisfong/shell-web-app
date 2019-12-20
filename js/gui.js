/*jshint esversion: 6 */
var html = `<button v-on:click="count++">
           You clicked me {{ count }} times.
           </button>`;

Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    };
  },
  template: html
});

var app = new Vue({el: '#vue-app'});
