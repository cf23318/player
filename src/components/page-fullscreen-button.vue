<template>
  <div
    id="vjs-page-fullscreen-button"
    class="vjs-control-bar__element vjs-control-bar__button vjs-iconfont"
    :class="{'vjs-disabled': disabled}"
    title="网页全屏"
    tabindex="8"
    v-clickAndKeydown="handleClick">
  </div>
</template>

<script>
export default {
  name: 'page-fullscreen-button',

  props: {
    options: {
      type: Object,
      required: true
    },
    pageFullscreenState: {
      type: Boolean,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  methods: {
    handleClick () {
      if (document.body.classList.contains('vjs-page-fullscreen')) {
        this.exitFullscreen()
      } else {
        this.requestFullscreen()
      }
    },
    requestFullscreen () {
      document.body.classList.add('vjs-page-fullscreen')
      document.querySelector(this.options.playerBox).classList.add('vjs-page-fullscreen')
      this.$emit('update:pageFullscreenState', true)
      if (this.options.onPageRequestFullscreen) this.options.onPageRequestFullscreen()
    },
    exitFullscreen () {
      document.body.classList.remove('vjs-page-fullscreen')
      document.querySelector(this.options.playerBox).classList.remove('vjs-page-fullscreen')
      this.$emit('update:pageFullscreenState', false)
      if (this.options.onPageExitFullscreen) this.options.onPageExitFullscreen()
    }
  }
}
</script>

<style>
  .vjs-mobi #vjs-page-fullscreen-button,
  .vjs-ipad #vjs-page-fullscreen-button {
    display: none;
  }

  #vjs-page-fullscreen-button::before {
    content: '\e615';
  }

  .vjs-page-fullscreen #vjs-page-fullscreen-button::before {
    content: '\e616';
  }
</style>
