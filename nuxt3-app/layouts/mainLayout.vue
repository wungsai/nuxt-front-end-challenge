<template>
  <div>
    <header class="bg-gray-800 text-white p-4">
      <nav class="container mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="hover:text-gray-300">Home</NuxtLink>
        <!-- Add other navigation links here if needed -->
      </nav>
    </header>

    <main class="container mx-auto p-4">
      <slot />
    </main>

    <footer class="bg-gray-200 text-gray-700 p-4 text-center">
      @WSLVC-IT
    </footer>
  </div>
</template>

<script setup>
// No specific script needed for this simple layout yet
</script>

<style scoped>
/* Scoped styles for the layout if needed */
</style>
