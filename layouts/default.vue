<template>
  <div>
    <div class="column">
      <nuxt />
    </div>
  </div>
</template>

<script>
// import Navbar from '~/components/Navbar';

export default {
  components: {
    // Navbar,
  },
  data () {
    return {
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Test',
          icon: 'lightbulb',
          to: { name: 'test' }
        }
      ]
    }
  }
}
</script>
<style></style>
