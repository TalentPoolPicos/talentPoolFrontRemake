<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavigatorBar from './components/NavigatorBar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <NavigatorBar />
  <RouterView />
  <div class="size"></div>
  <Footer />
</template>

<style scoped>
.size {
  height: calc(10vh + 2000px);
}
</style>
