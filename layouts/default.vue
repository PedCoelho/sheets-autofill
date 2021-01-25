<template>
  <div>
    <nav
      class="navbar header has-shadow is-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <a class="navbar-item" href="/">
          <img src="~assets/buefy.png" alt="Buefy" height="28" />
        </a>

        <div class="navbar-burger">
          <span />
          <span />
          <span />
        </div>
      </div>
    </nav>

      <div class="section">
        <div class="container ">
          <div class="main-content columns">

          <aside class="column is-2 section">
            <p class="menu-label is-hidden-touch">General</p>
            <ul class="menu-list">
              <li v-for="(item, key) of items" :key="key">
                <nuxt-link :to="item.to" exact-active-class="is-active">
                  <b-icon :icon="item.icon" /> {{ item.title }}
                </nuxt-link>
              </li>
            </ul>
          </aside>
          

          <div class="column">
            <nuxt />
          </div>


    </div>
  </div>
  </div>
    
  </div>
</template>

<style>
  #__nuxt, body, html{
     /* overflow-x: auto; 
    max-width: 100%;  */
  }
</style>

<script>
export default {
  data() {
    return {
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' },
        },
        {
          title: 'Inspire',
          icon: 'lightbulb',
          to: { name: 'inspire' },
        },
      ],
    }
  },
}
</script>
