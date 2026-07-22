<template>
  <div>
    <login v-if="!isAuthenticated" @authenticated="handleAuthenticated" />
    <home v-else @logout="handleLogout" />
  </div>
</template>

<script>
import Home from '@/views/Home'
import Login from '@/components/Login.vue'
import { isAuthenticated, clearAuthentication, requestPersistentStorage } from '@/utils/auth'

export default {
  name: 'App',
  components: {
    Home,
    Login,
  },
  data() {
    return {
      isAuthenticated: false,
    }
  },
  mounted() {
    requestPersistentStorage()
    this.isAuthenticated = isAuthenticated()
  },
  methods: {
    handleAuthenticated() {
      this.isAuthenticated = true
    },
    handleLogout() {
      this.isAuthenticated = false
      clearAuthentication()
    }
  }
}
</script>
