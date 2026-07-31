<script setup lang="ts">
import { onMounted } from 'vue'
import { gsap } from 'gsap'

onMounted(() => {
  gsap.from('#app', { opacity: 0, duration: 0.6 })
})
</script>

<template>
  <router-view />
</template>
