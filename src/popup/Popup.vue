<script setup lang="ts">
import { sign } from '~/logic'

import { isDark, toggleDark } from '~/composables'

const isEdit = ref(false)

function saveSign() {
  isEdit.value = false
}
function openOptions() {
  browser.runtime.openOptionsPage()
}

</script>

<template>
  <main
    class="text-center py-4 overflow-x-hidden w-200px min-w-200px dark:bg-[#0d1117] border-0 text-dark-200 dark:text-gray-400"
  >
    <header class="absolute left-4 top-2 right-4 text-left flex items-center justify-between select-none">
      <i class="text-xs not-italic text-dark-200/40 dark:text-gray-400/40">Popup</i>

      <ic:round-brightness-2
        v-if="isDark" class="text-sm mt-1 cursor-pointer opacity-50 hover:opacity-70"
        @click="toggleDark"
      />
      <ic:round-wb-sunny v-else class="text-sm mt-1 cursor-pointer opacity-50 hover:opacity-70" @click="toggleDark" />
    </header>
    <h2 class="text-lg mb-4 leading-none">
      <Logo />
      <span class="block">
        WebExt Starter
      </span>
    </h2>
    <button class="btn" @click="openOptions">
      Open options
    </button>
    <div class="px-2 flex">
      <textarea
        v-if="isEdit"
        v-model="sign"
        name="sign" rows="5" placeholder="Input your sign, then keypress Ctrl + Enter key to save it."
        class="w-full outline-0 resize-y bg-transparent border-gray-400/40 text-white px-2 py-1 my-4"
        @keydown.ctrl.enter="saveSign"
      />
      <p v-else class="text-center text-base w-full select-all leading-tight" @dblclick="isEdit = true">
        {{ sign }}
      </p>
    </div>
  </main>
</template>
