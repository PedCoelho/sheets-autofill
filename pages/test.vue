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
        :clickable="true"
      >
        <b-field v-if="item.type == 'autocomplete'">
          <b-autocomplete
            v-model="item.model"
            class="container"
            rounded
            :data="autoCompleteData[index]"
            icon="magnify"
            clearable
            @select="(option) => (selected = option)"
          >
            <template #empty> No results found </template>
          </b-autocomplete>
        </b-field>
        <input
          v-else-if="item.type == 'file'"
          :type="item.type"
          accept="image/*"
          capture
          @change="readImage"
        />

        <b-input
          v-else
          v-model="item.model"
          min="0"
          max="10"
          :type="item.type"
        ></b-input>
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
          type: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Categoria',
          done: false,
          type: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Sub-categoria',
          done: false,
          type: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Difficulty',
          done: false,
          type: 'number',
          model: undefined,
        },
        {
          name: 'Enjoyment',
          done: false,
          type: 'number',
          model: undefined,
        },
        {
          name: 'Author',
          done: false,
          type: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Found in',
          done: false,
          type: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Date',
          done: false,
          type: 'datetime-local',
          model: undefined,
        },
        {
          name: 'Picture',
          done: false,
          type: 'file',
          model: undefined,
        },
        {
          name: 'Notes',
          done: false,
          type: 'text',
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

    autoCompleteData() {
      let valores = this.spreadSheetData?.values;
      if (valores) {
        return valores.map(([header, ...rest]) =>
          [...new Set(rest)]
            .filter((x) => Boolean(x.length))
            .sort((a, b) => a.localeCompare(b))
        );
      } else {
        return [];
      }
    },
  },
  watch: {
    isAuthorized(val) {
      if (val) {
        this.sendAuthorizedApiRequest(process.env.spreadsheetId);
      }
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
          range: 'Main',
          majorDimension: 'COLUMNS',
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
    readImage(evt) {
      console.log(evt);
      let self = this;
      if (evt.target.files && evt.target.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          console.log(e.target.result);
          if (e.target.result) {
            self.stepItems.filter((x) => x.name == 'Picture')[0].model =
              e.target.result;
          }
        };

        reader.readAsDataURL(evt.target.files[0]);
      }
    },
  },
};
</script>

<style></style>
