import Vue from 'vue'
import VueGapi from 'vue-gapi'

Vue.use(VueGapi, {
  apiKey: process.env.apiKey,
  clientId: process.env.clientId,
  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  scope: 'https://www.googleapis.com/auth/spreadsheets'
})
