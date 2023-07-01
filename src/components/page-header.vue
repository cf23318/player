<template>
  <div id="vjs-page-header" :class="{'visible': visible}">
    <div id="vjs-page-header__left"></div>
    <div id="vjs-page-header__center" v-text="title"></div>
    <div id="vjs-page-header__right" v-text="time"></div>
  </div>
</template>

<script>
export default {
  name: 'page-header',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    now: {
      type: Number,
      required: true
    }
  },

  computed: {
    time () {
      return this.$date(this.now).format('HH:mm')
    }
  }
}
</script>

<style>
  #vjs-page-header {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 105px;
    padding: 20px 40px 0;
    background: linear-gradient(360deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.45) 50%,rgba(0,0,0,0.89) 100%);
    font-size: 20px;
    font-family: PingFang-SC-Medium;
    display: none;
  }

  .vjs-fullscreen.vjs-pc #vjs-page-header.visible {
    display: flex;
  }

  #vjs-page-header #vjs-page-header__center {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
</style>
