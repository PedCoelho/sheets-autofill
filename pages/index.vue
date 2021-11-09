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
    <div class="section">
      <b-steps
        v-model="activeStep"
        class="has-text-centered container"
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
              @keydown.enter.native="handleEnter"
              v-model="item.model"
              class="container"
              rounded
              :data="filterOptions(item.model, autoCompleteData[index])"
              icon="magnify"
              clearable
              @select="handleEnter($event)"
            >
              <template #empty> No results found </template>
            </b-autocomplete>
          </b-field>
          <div id="image" v-else-if="item.type == 'file'">
            <input :type="item.type" accept="image/*" @change="readImage" />
          </div>

          <b-input
            v-else
            @keydown.enter.native="handleEnter"
            v-model="item.model"
            min="0"
            max="10"
            :type="item.type"
          ></b-input>
        </b-step-item>
      </b-steps>
      <div class="mt-5 container has-text-centered">
        <p class="feedback-text">{{ feedback }}</p>
        <p class="feedback-text-positive">{{ positive_feedback }}</p>
        <b-button @click="sendData" type="is-success">SEND</b-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      feedback: '',
      positive_feedback: '',
      stepItems: [
        {
          name: 'Model',
          done: false,
          type: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Category',
          done: false,
          type: 'autocomplete',
          model: undefined,
        },
        {
          name: 'Sub-category',
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
    authorSelected() {
      return this.modelData.author;
    },

    booksWithAuthors() {
      let valores = this.spreadSheetData?.values;

      if (valores) {
        let obj = { authors: valores[5].slice(1), books: valores[6].slice(1) };
        return obj.books.reduce((a, book, i) => {
          if (obj['authors'][i] == '') return a;

          !a[book]
            ? (a[book] = [obj['authors'][i]])
            : a[book].push(obj['authors'][i]);

          a[book] = [...new Set(a[book])];
          return a;
        }, {});
      } else {
        return [];
      }
    },

    foundInAutocomplete() {
      let books = [];
      Object.entries(this.booksWithAuthors).forEach(([book, authors]) => {
        if (
          authors.some((author) =>
            author?.toUpperCase().includes(this.authorSelected?.toUpperCase())
          )
        )
          books.push(book);
      });

      return books;
    },

    autoCompleteData() {
      let valores = this.spreadSheetData?.values;
      if (valores) {
        valores = valores.map(([header, ...rest]) =>
          [...new Set(rest)]
            .filter((x) => Boolean(x.length))
            .sort((a, b) => a.localeCompare(b))
        );
        valores[6] = this.foundInAutocomplete;
        return valores;
      } else {
        return [];
      }
    },
  },
  watch: {
    isAuthorized(val) {
      if (val) {
        this.sendAuthorizedApiRequest();
      }
    },
  },
  mounted() {
    this.authSetup();

    let date = new Date();
    this.stepItems[7].model =
      date.toISOString().substr(0, 10) + 'T' + date.toLocaleTimeString();
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
      try {
        let gapi = await this.$gapi.getGapiClient();
        let googleAuth = await gapi.auth2.getAuthInstance();
        this.GoogleAuth = googleAuth;

        this.isAuthorized = googleAuth.isSignedIn.get();

        if (!this.isAuthorized) {
          this.positive_feedback = 'Attempting Google oAuth2.0';

          this.isAuthorized = await this.loginAttempt(googleAuth);
        }
      } catch (e) {
        this.positive_feedback = '';
        this.feedback = e.error.message;
      }
    },
    async loginAttempt(auth_instance) {
      this.positive_feedback = 'Attempting login';
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
    async sendAuthorizedApiRequest() {
      var self = this;
      let spreadsheetId = process.env.spreadsheetId;

      if (this.isAuthorized) {
        const params = {
          // The ID of the spreadsheet to retrieve data from.
          spreadsheetId,
          range: 'Main',
          majorDimension: 'COLUMNS',
        };
        // Make API request
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
        if (logged_in) this.sendAuthorizedApiRequest();
        else
          alert(
            'User needs to be signed in before making request to Google Sheets API'
          );
      }
    },
    filterOptions(model, opts) {
      if (!opts) return;

      return opts.filter((option) => {
        if (!option) return false;
        return (
          option.toString().toLowerCase().indexOf(model?.toLowerCase()) >= 0
        );
      });
    },
    handleEnter(evt) {
      console.log(evt);
      if (!evt) return;
      this.activeStep += 1;
    },
    readImage(evt) {
      console.log(evt);
      let self = this;
      if (evt.target.files && evt.target.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          if (e.target.result) {
            self
              .shrinkImage(e.target.result)
              .then(
                (response) =>
                  (self.stepItems.filter(
                    (x) => x.name == 'Picture'
                  )[0].model = `"${response}"`)
              );
          }
        };

        reader.readAsDataURL(evt.target.files[0]);
      }
    },
    imageOverLimit(imageDataURL) {
      const CELL_LIMIT = 50000;
      const imageLength = imageDataURL.length;
      const difference = CELL_LIMIT - imageLength;

      let biggerByPercent = 0;

      if (difference < 0) {
        biggerByPercent = (-difference * 100) / imageLength;
      }

      return {
        limit_exceeded: difference < 0,
        difference,
        biggerByPercent,
      };
    },
    async shrinkImage(imageDataURL) {
      console.group(`shrinkImage`);
      let shouldShrink = this.imageOverLimit(imageDataURL);
      console.log(shouldShrink);

      let smallerImg;

      while (shouldShrink.limit_exceeded) {
        console.group(
          `shouldShrink by ${shouldShrink.biggerByPercent.toFixed(2)}%`
        );
        console.log(`length difference: ${shouldShrink.difference}`);

        smallerImg = await this.resizeBase64Img(
          imageDataURL,
          shouldShrink.biggerByPercent
        );

        imageDataURL = smallerImg.base64URL;
        console.log(`smallerImg: ${smallerImg.resolution}`);

        shouldShrink = this.imageOverLimit(imageDataURL);
        console.groupEnd();
      }

      console.groupEnd();
      return smallerImg.base64URL;
    },
    /**
     * Resize a base 64 Image
     * @param {String} base64 - The base64 string (must include MIME type)
     * @param {Number} newWidth - The width of the image in pixels
     * @param {Number} newHeight - The height of the image in pixels
     */
    resizeBase64Img(base64, factor) {
      return new Promise((resolve, reject) => {
        var canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let img = document.createElement('img');
        img.src = base64;

        img.onload = function () {
          // let reduceBy = (factor, total) => (factor * total) / 100;
          // let reducedW = img.width - reduceBy(factor, img.width);
          // let reducedH = img.height - reduceBy(factor, img.height);

          let scaleFactor = 1 - factor / 100;

          window.img = img;

          let reducedW = parseInt(img.width * scaleFactor);
          let reducedH = parseInt(img.height * scaleFactor);

          canvas.style.width = reducedW.toString() + 'px';
          canvas.style.height = reducedH.toString() + 'px';

          // window.ctx = ctx;
          canvas.width = reducedW;
          canvas.height = reducedH;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // window.canvas = canvas;
          ctx.scale(scaleFactor, scaleFactor);

          ctx.drawImage(img, 0, 0);

          let drawnCanvas = document.querySelector('#image canvas');

          if (!drawnCanvas) {
            document.getElementById('image').prepend(canvas);
          } else {
            document.getElementById('image').replaceChild(canvas, drawnCanvas);
          }

          resolve({
            resolution: `${reducedW}x${reducedH}`,
            base64URL: canvas.toDataURL(),
          });
        };
      });
    },
    checkRequired() {
      let required = ['name', 'cat', 'subcat', 'challenge', 'pleasure', 'date'];
      let check = required.filter((key) => !this.modelData[key]);

      /* ----------- if no required keys have missing values return true ---------- */

      if (check.length) {
        return check;
      } else return true;
    },
    sendData() {
      this.feedback = '';
      this.positive_feedback = '';

      let ok = this.checkRequired();
      ok = true;

      if (ok === true) {
        // send data
        try {
          this.appendToSheetRequest();
        } catch (e) {
          this.feedback = e;
        }
      } else {
        this.feedback = `Faltando valores obrigatórios: ${ok.join(', ')}`;
      }
    },
    async addEmptyRowAndPasteData() {
      let spreadsheetId = process.env.spreadsheetId;

      let insertRowReq = {
        insertDimension: {
          range: {
            sheetId: 0,
            dimension: 'ROWS',
            startIndex: 1,
            endIndex: 2,
          },
          inheritFromBefore: false,
        },
      };

      let pasteDataReq = {
        pasteData: {
          delimiter: ',',
          type: 'PASTE_NORMAL',
          data: Object.values(this.modelData).join(','),
          coordinate: {
            columnIndex: 0,
            rowIndex: 1,
            sheetId: 0,
          },
        },
      };

      const params = {
        spreadsheetId,
        resource: {
          requests: [insertRowReq, pasteDataReq],
        },
      };

      let gapi = await this.$gapi.getGapiClient();

      await gapi.client.sheets.spreadsheets
        .batchUpdate(params)
        .then((response) => {
          console.log(response);
          this.positive_feedback = response;
        })
        .catch((e) => {
          this.feedback = e.result.error.message;
        });
    },
    async appendToSheetRequest() {
      if (this.isAuthorized) {
        await this.addEmptyRowAndPasteData();
      } else if (this.GoogleAuth) {
        let logged_in = await this.loginAttempt(this.GoogleAuth);
        if (logged_in) this.appendToSheetRequest();
        else
          this.feedback =
            'User needs to be signed in before making request to Google Sheets API';
      }
    },
  },
};
</script>

<style>
.feedback-text {
  color: red;
  margin-bottom: 1rem;
}
.feedback-text-positive {
  color: green;
  margin-bottom: 1rem;
}

#image {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
}
#image canvas {
  margin-bottom: 1rem;
}
.column {
  padding: unset;
}
</style>
