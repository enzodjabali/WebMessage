<template>
  <transition name="fade">
    <div v-if="isShow" @click="handleClickOverlay" class="vc-overlay" id="vueConfirm">
      <transition name="zoom">
        <div v-if="isShow" ref="vueConfirmDialog" class="vc-container">
          <span class="vc-text-grid">
            <h4 v-if="dialog.title" class="vc-title">{{ dialog.title }}</h4>
            <p v-if="dialog.message" class="vc-text">{{ dialog.message }}</p>
            <span v-if="dialog.auth">
              <input
                v-model="password"
                @keyup.enter="e => handleClickButton(e, true)"
                class="vc-input"
                type="password"
                name="vc-password"
                placeholder="Password"
                autocomplete="off"
              />
            </span>
          </span>
          <div class="vc-btn-grid" :class="{ isMono: !dialog.button.no || !dialog.button.yes }">
            <button v-if="dialog.button.no" @click.stop="e => handleClickButton(e, false)" class="vc-btn left">
              {{ dialog.button.no }}
            </button>

            <button
              v-if="dialog.button.yes"
              :disabled="dialog.auth ? !password : false"
              @click.stop="e => handleClickButton(e, true)"
              class="vc-btn"
              :class="{ destructive: dialog.destructive }"
            >
              {{ dialog.button.yes }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
const Component = {
  name: 'ConfirmDialog',
  data() {
    return {
      isShow: false,
      password: null,
      dialog: {
        auth: false,
        destructive: false,
        title: '',
        message: '',
        button: {},
      },
      params: {},
    }
  },
  methods: {
    resetState() {
      this.password = null
      this.dialog = {
        auth: false,
        destructive: false,
        title: '',
        message: '',
        button: {},
        callback: () => {},
      }
    },
    handleClickButton({ target }, confirm) {
      if (target.id == 'vueConfirm') return
      if (confirm && this.dialog.auth && !this.password) return
      this.isShow = false
      // callback
      if (this.params.callback) {
        this.params.callback(confirm, this.password)
      }
    },
    handleClickOverlay({ target }) {
      if (target.id == 'vueConfirm') {
        this.isShow = false
        // callback
        if (this.params.callback) {
          this.params.callback(false, this.password)
        }
      }
    },
    handleKeyUp({ keyCode }) {
      if (keyCode == 27) {
        this.handleClickOverlay({ target: { id: 'vueConfirm' } })
      }
      if (keyCode == 13) {
        this.handleClickButton({ target: { id: '' } }, true)
      }
    },
    open(params) {
      this.resetState()
      this.params = params
      this.isShow = true
      // set params to dialog state
      Object.entries(params).forEach(param => {
        if (typeof param[1] == typeof this.dialog[param[0]]) {
          this.dialog[param[0]] = param[1]
        }
      })
    },
  },
}
export default Component
</script>

<style>
/**
* Dialog - styled like a native iOS (dark) UIAlertController
*/
.vc-overlay *,
.vc-overlay *:before,
.vc-overlay *:after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  text-decoration: none;
  -webkit-touch-callout: none;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}
.vc-title {
  color: #ffffff;
  padding: 0 1rem;
  width: 100%;
  font-weight: 600;
  text-align: center;
  font-size: 17px;
  line-height: 22px;
}
.vc-text {
  color: #ffffff;
  padding: 4px 1rem 0;
  width: 100%;
  font-weight: 400;
  text-align: center;
  font-size: 13px;
  line-height: 17px;
}
.vc-overlay {
  background-color: rgba(0, 0, 0, 0.4);
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 999999999999;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: baseline;
}
.vc-container {
  background-color: rgba(37, 37, 37, 0.86);
  backdrop-filter: saturate(180%) blur(25px);
  -webkit-backdrop-filter: saturate(180%) blur(25px);
  border-radius: 14px;
  width: 270px;
  height: auto;
  display: grid;
  grid-template-rows: 1fr max-content;
  overflow: hidden;
}
.vc-text-grid {
  padding: 19px 0 17px;
}
.vc-btn-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border-top: 0.5px solid rgba(84, 84, 88, 0.65);
}
.vc-btn-grid.isMono {
  grid-template-columns: 1fr;
}
.vc-btn {
  border-radius: 0;
  color: #0a84ff;
  background-color: transparent;
  border: 0;
  font-size: 17px;
  cursor: pointer;
  font-weight: 600;
  outline: none;
  min-height: 44px;
  transition: background-color 0.1s ease;
}
.vc-btn.destructive {
  color: #ff453a;
}
.vc-btn:active {
  background-color: rgba(255, 255, 255, 0.08);
}
.vc-btn:disabled {
  color: rgba(235, 235, 245, 0.3);
}
.vc-btn.left {
  border-right: 0.5px solid rgba(84, 84, 88, 0.65);
  font-weight: 400;
}
.vc-input[type='password'] {
  width: calc(100% - 32px);
  outline: none;
  border-radius: 8px;
  height: 32px;
  border: 0.5px solid rgba(84, 84, 88, 0.65);
  margin: 12px 16px 0;
  background-color: rgba(118, 118, 128, 0.24);
  color: #ffffff;
  padding: 0 0.5rem;
  font-size: 14px;
}
/**
* Transition
*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.21s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.zoom-enter-active,
.zoom-leave-active {
  animation-duration: 0.21s;
  animation-fill-mode: both;
  animation-name: zoom;
}
.zoom-leave-active {
  animation-direction: reverse;
}
@keyframes zoom {
  from {
    opacity: 0;
    transform: scale3d(1.1, 1.1, 1.1);
  }
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}
</style>
