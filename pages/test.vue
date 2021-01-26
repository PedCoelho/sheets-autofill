<template>
  <div>
    <section class="hero is-primary is-medium">
      <div class="hero-body container">
        <div class="container">
          <h1 class="title">
            Origami Sheet
          </h1>
          <h1 class="subtitle">
            A page for all your spreadsheet needs
          </h1>
        </div>
      </div>
    </section>
    <b-steps
      v-model="activeStep"
      class="has-text-centered section container"
      :animated="isAnimated"
      :rounded="isRounded"
      :has-navigation="hasNavigation"
      :icon-prev="prevIcon"
      :icon-next="nextIcon"
      :label-position="labelPosition"
      :mobile-mode="mobileMode"
    >
      <b-step-item
        v-for="(item, index) in stepItems"
        :key="index + item"
        :type="{ 'is-success': item.done }"
        :step="index + 1"
        :label="item.name"
        :clickable="isStepsClickable"
      >
        <b-field>
          <b-autocomplete
            v-model="item.model"
            class="container"
            rounded
            :data="filteredDataArray"
            icon="magnify"
            clearable
            @select="(option) => (selected = option)"
          >
            <template #empty>
              No results found
            </template>
          </b-autocomplete>
        </b-field>
      </b-step-item>
    </b-steps>
  </div>
</template>

<script>
export default {
  data () {
    return {
      stepItems: [
        {
          name: 'Modelo',
          done: false,
          kind: 'autocomplete',
          model: undefined
        },
        {
          name: 'Categoria',
          done: false,
          kind: 'autocomplete',
          model: undefined
        },
        {
          name: 'Sub-categoria',
          done: false,
          kind: 'autocomplete',
          model: undefined
        },
        {
          name: 'Difficulty',
          done: false,
          kind: 'number',
          model: undefined
        },
        {
          name: 'Enjoyment',
          done: false,
          kind: 'number',
          model: undefined
        },
        {
          name: 'Author',
          done: false,
          kind: 'autocomplete',
          model: undefined
        },
        {
          name: 'Found in',
          done: false,
          kind: 'autocomplete',
          model: undefined
        },
        {
          name: 'Date',
          done: false,
          kind: 'date',
          model: undefined
        },
        {
          name: 'Picture',
          done: false,
          kind: 'upload',
          model: undefined
        },
        {
          name: 'Notes',
          done: false,
          kind: 'regular',
          model: undefined
        }
      ],

      activeStep: 0,

      showSocial: false,
      isAnimated: true,
      isRounded: true,
      isStepsClickable: false,

      hasNavigation: true,
      customNavigation: false,
      isProfileSuccess: false,

      prevIcon: 'chevron-left',
      nextIcon: 'chevron-right',
      labelPosition: 'bottom',
      mobileMode: 'minimalist'
    }
  },
  computed: {
    modelData () {
      const name = this.stepItems[0].model
      const cat = this.stepItems[1].model
      const subcat = this.stepItems[2].model
      const challenge = this.stepItems[3].model
      const pleasure = this.stepItems[4].model
      const author = this.stepItems[5].model
      const found = this.stepItems[6].model
      const date = this.stepItems[7].model
      const picture = this.stepItems[8].model
      const note = this.stepItems[9].model

      const object = {
        name,
        cat,
        subcat,
        challenge,
        pleasure,
        author,
        found,
        date,
        picture,
        note
      }
      return object
    }
  },
  mounted () {
    this.login()
  },
  methods: {
    checkStep () {
      const item = this.stepItems[this.activeStep]

      if (!item.done) {
        item.done = true
        setTimeout(() => {
          this.activeStep++
        }, 400)
      }
    },

    // Make sure the client is loaded and sign-in is complete before calling this method.
    // execute() {
    //   return gapi.client.sheets.spreadsheets
    //     .get({
    //       spreadsheetId: process.env.SPREADSHEET_ID,
    //       includeGridData: false,
    //     })
    //     .then(
    //       function (response) {
    //         // Handle the results here (response.result has the parsed body).
    //         console.log('Response', response);
    //       },
    //       function (err) {
    //         console.error('Execute error', err);
    //       }
    //     );
    // },
    // randomAuth() {
    //   gapi.load('client:auth2', function () {
    //     gapi.auth2.init({ client_id: 'YOUR_CLIENT_ID' });
    //   });
    // },
    async login () {
      const gapiClient = await this.$gapi.getGapiClient().then((gapi) => {
        // gapi.sheets.spreadsheet.get(...)
        // ... authenticate() {
        return gapi
      })
      const request = await gapiClient.sheets.spreadsheets.get(process.env.spreadsheetId)
      request.then((response) => {
        console.log(response.result)
      })
    }
  }
}
</script>

<style></style>
