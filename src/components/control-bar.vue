<template>
  <div
    id="vjs-control-bar"
    :class="[{'vjs-disabled': disabled}, visible ? 'vjs-control-bar__display' : 'vjs-control-bar__hidden']"
    @mousemove="handleMove"
  >
    <div id="vjs-control-bar__layout-left"><slot name="left"></slot></div>
    <slot></slot>
    <div id="vjs-control-bar__layout-right"><slot name="right"></slot></div>
  </div>
</template>

<script>
export default {
  name: 'control-bar',

  props: {
    visible: {
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
    handleMove () {
      this.$emit('on-move')
    }
  }
}
</script>

<style>
  #vjs-control-bar {
    display: flex;
    justify-content: space-between;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    width: 100%;
    height: 54px;
    line-height: 54px;
    background: linear-gradient(to bottom, transparent, #000);
    /* pointer-events: none; */
    user-select: none;
  }

  #vjs-control-bar.vjs-control-bar__hidden {
    display: none;
  }

  #vjs-control-bar__layout-left, #vjs-control-bar__layout-right {
    display: flex;
  }

  #vjs-control-bar__layout-right {
    flex-direction: row-reverse;
    justify-content: right;
  }

  .vjs-custom-player.vjs-pc #vjs-control-bar__layout-right {
    flex-wrap: wrap;
  }

  .vjs-control-bar__element {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 100%;
    text-align: center;
    cursor: pointer;
    font-size: 14px;
  }

  .vjs-control-bar__button {
    width: 50px;
  }

  .vjs-control-bar__button:hover {
    color: #3a94e3;
  }

  .vjs-player-box:not(.vjs-page-fullscreen) .vjs-custom-player.vjs-control-bar-bottom:not(.vjs-fullscreen) #vjs-control-bar {
    display: flex !important;
    bottom: -54px;
    background: #323334;
  }
</style>
