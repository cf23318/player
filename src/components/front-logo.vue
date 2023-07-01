<template>
  <div id="vjs-front-logo">
    <img :src="logoImgSrc" @error="handleError">
  </div>
</template>

<script>
import defaultLogo from 'assets/img/video_loading.svg'

export default {
  name: 'front-logo',

  props: {
    options: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      // 错误时切换图片
      logoImgType: 'other'
    }
  },

  created () {
    if (!this.options.logo) {
      this.logoImgType = 'otherDefault'
    }

    if (!this.options.logo && !this.options.defaultLogo) {
      this.logoImgType = 'default'
    }
  },

  computed: {
    logoImgSrc () {
      switch (this.logoImgType) {
        case 'other':
          return this.options.logo
        case 'otherDefault':
          return this.options.defaultLogo
        case 'default':
          return defaultLogo
        default:
          return defaultLogo
      }
    }
  },

  methods: {
    handleError () {
      if (this.logoImgType === 'other') {
        this.logoImgType = 'otherDefault'
      } else if (this.logoImgType === 'otherDefault') {
        this.logoImgType = 'default'
      }
    }
  }
}
</script>

<style>
  #vjs-front-logo {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 40;
    width: 100%;
    height: 100%;
    background: #000;
  }

  #vjs-front-logo img {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 70;
    transform: translate(-50%, -50%) scale(.5);
  }
</style>
