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
      class="has-text-centered section"
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
      ></b-step-item>
    </b-steps>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stepItems: [
        { name: 'Modelo', done: false },
        { name: 'Categoria', done: false },
        { name: 'Sub-categoria', done: false },
        { name: 'Difficulty', done: false },
        { name: 'Enjoyment', done: false },
        { name: 'Author', done: false },
        { name: 'Found in', done: false },
        { name: 'Date', done: false },
        { name: 'Picture', done: false },
        { name: 'Notes', done: false },
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
      mobileMode: 'minimalist',
    };
  },
  methods: {
    morphIndex(activeStep) {
      const item = this.stepItems[activeStep];
      // console.log(newObj);
      item.done = true;
      console.log(item);
    },
  },
};
</script>

<style></style>
