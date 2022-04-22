<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { sign } from '~/logic'

useDark()

</script>

<template>
  <main class="px-4 py-10 text-center w-500px mx-auto text-gray-700 dark:text-gray-200">
    <h2 class="flex items-center">
      <img src="/assets/icon-512.png" class="icon-btn mx-2 w-2rem" alt="extension icon">
      <span class="ml-2">WebExt - Options Page</span>
    </h2>

    <div class="flex">
      <textarea v-model="sign" rows="5" class="text-base" />
    </div>

    <div class="mt-4 text-sm">
      Powered by Vite <logos:vitejs class="align-middle" />
    </div>
  </main>
</template>

<style>
html.dark body {
  background-color: #181818;
}
</style>
