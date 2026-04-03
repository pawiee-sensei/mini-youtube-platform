<template>
  <div class="home">
    <h1>Welcome to Mini YouTube</h1>
    <p>Watch videos without logging in</p>

    <div class="cta">
      <button @click="$router.push('/register')">
        Get Started
      </button>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  margin-top: 100px;
}

.cta button {
  padding: 10px 20px;
  margin-top: 20px;
}
</style>