<template>
  <div
    id="vjs-fullscreen-button"
    class="vjs-control-bar__element vjs-control-bar__button vjs-iconfont"
    :class="{'vjs-disabled': disabled}"
    title="全屏"
    tabindex="9"
    v-clickAndKeydown="handleClick"
  ></div>
</template>

<script>
export default {
  name: 'fullscreen-button',

  props: {
    disabled: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  methods: {
    handleClick () {
      this.$emit('on-click')
    }
  }
}
</script>

<style>
  #vjs-fullscreen-button::before {
    content: '\e6e0';
  }

  .vjs-fullscreen #vjs-fullscreen-button::before {
    content: '\e683';
  }
</style>
