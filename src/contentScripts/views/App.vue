<script setup lang="ts">
import { useDark } from '@vueuse/core'
import 'virtual:windi.css'

useDark()

function scrollToTop() {
  window.scroll({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div
    class="fixed right-0 bottom-0 m-8 z-100 flex font-sans select-none leading-1em rounded-1/2 bg-gray-500/40 p-3 flex"
    title="Click to scroll to top - WebExt Starter"
    @click="scrollToTop"
  >
    <ic:round-arrow-upward class="text-3xl cursor-pointer text-gray-200 opacity-50 inline-block hover:opacity-80" />
  </div>
</template>
