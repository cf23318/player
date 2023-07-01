<template>
  <div
    id="vjs-play-buttom"
    :class="{'vjs-disabled': disabled}"
    class="vjs-control-bar__element vjs-control-bar__button vjs-iconfont"
    title="播放/暂停"
    tabindex="1"
    v-clickAndKeydown="handleClick"
  ></div>
</template>

<script>
export default {
  name: 'play-button',

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
#vjs-play-buttom::before {
  content: '\e79c';
  font-size: 22px;
}

.vjs-paused #vjs-play-buttom::before {
  content: '\e62a';
  color: #3a94e3;
}
</style>
