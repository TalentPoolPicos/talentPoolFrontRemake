<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavigatorBar from './components/NavigatorBar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <NavigatorBar />
  <RouterView />
  <Footer />
</template>
