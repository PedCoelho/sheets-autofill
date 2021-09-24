<template>
  <div>
    <section class="hero is-primary is-medium">
      <div class="hero-body container">
        <div class="container">
          <h1 class="title">Origami Sheet</h1>
          <h1 class="subtitle">A page for all your spreadsheet needs</h1>
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
            <template #empty> No results found </template>
          </b-autocomplete>
        </b-field>
      </b-step-item>
    </b-steps>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stepItems: [
        {
          name: 'Modelo',
          done: false,
          kind: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Categoria',
          done: false,
          kind: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Sub-categoria',
          done: false,
          kind: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Difficulty',
          done: false,
          kind: 'number',
          model: undefined,
        },
        {
          name: 'Enjoyment',
          done: false,
          kind: 'number',
          model: undefined,
        },
        {
          name: 'Author',
          done: false,
          kind: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Found in',
          done: false,
          kind: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Date',
          done: false,
          kind: 'date',
          model: undefined,
        },
        {
          name: 'Picture',
          done: false,
          kind: 'upload',
          model: undefined,
        },
        {
          name: 'Notes',
          done: false,
          kind: 'regular',
          model: undefined,
        },
      ],

      // Google Client API Stuff
      GoogleAuth: undefined,
      isAuthorized: undefined,
      currentApiRequest: undefined,

      activeStep: 0,
      spreadSheetData: undefined,
      filteredDataArray: undefined,
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
      mobileMode: 'minimalist',
    };
  },
  computed: {
    modelData() {
      const name = this.stepItems[0].model;
      const cat = this.stepItems[1].model;
      const subcat = this.stepItems[2].model;
      const challenge = this.stepItems[3].model;
      const pleasure = this.stepItems[4].model;
      const author = this.stepItems[5].model;
      const found = this.stepItems[6].model;
      const date = this.stepItems[7].model;
      const picture = this.stepItems[8].model;
      const note = this.stepItems[9].model;

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
        note,
      };
      return object;
    },
  },
  watch: {
    isAuthorized(val) {
      if (val) {
        this.sendAuthorizedApiRequest(process.env.spreadsheetId);
      }
    },
    spreadSheetData: function (data) {
      this.filteredDataArray = data.values[0];
    },
  },
  mounted() {
    this.authSetup();
  },
  methods: {
    checkStep() {
      const item = this.stepItems[this.activeStep];

      if (!item.done) {
        item.done = true;
        setTimeout(() => {
          this.activeStep++;
        }, 400);
      }
    },
    async authSetup() {
      let gapi = await this.$gapi.getGapiClient();
      let googleAuth = await gapi.auth2.getAuthInstance();
      this.GoogleAuth = googleAuth;

      this.isAuthorized = googleAuth.isSignedIn.get();

      if (!this.isAuthorized) {
        this.isAuthorized = await this.loginAttempt(googleAuth);
      }
    },
    async loginAttempt(auth_instance) {
      console.log('Attempting login');
      try {
        let response = await auth_instance.signIn();
        if (!response) return false;
        let logged_in = response.isSignedIn();
        return logged_in;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    async sendAuthorizedApiRequest(requestDetails) {
      var self = this;
      this.currentApiRequest = requestDetails;
      if (this.isAuthorized) {
        const params = {
          // The ID of the spreadsheet to retrieve data from.
          spreadsheetId: this.currentApiRequest,
          range: 'A:J',
          majorDimension: 'ROWS',
        };
        // Make API request
        // gapi.client.request(requestDetails)
        this.$gapi.getGapiClient().then(function (gapi) {
          console.log(gapi);
          gapi.client.sheets.spreadsheets.values
            .get(params)
            .then((response) => {
              self.spreadSheetData = response.result;
              console.log(self.spreadSheetData);
            });
        });
      } else if (this.GoogleAuth) {
        let logged_in = await this.loginAttempt(this.GoogleAuth);
        if (logged_in) this.sendAuthorizedApiRequest(requestDetails);
        else
          alert(
            'User needs to be signed in before making request to Google Sheets API'
          );
      }
    },
  },
};
</script>

<style></style>
