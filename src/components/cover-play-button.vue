<template>
  <div id="vjs-cover-play-button">
    <div id="vjs-cover-play-button__pc-play" v-if="!isLimit" @click="handleClick($event)">点击播放</div>

    <div id="vjs-cover-play-button__mobi" v-if="isLimit">
      <div id="vjs-cover-play-button__mobi-play" @click="handleClick($event)">试看5分钟</div>
      <a id="vjs-cover-play-button__mobi-download" href="javascript:;" @click="downloadApp">下载App看完整版</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'cover-play-button',

  props: {
    options: {
      type: Object,
      required: true
    },
    limit: {
      type: Object,
      default () {
        return {
          android: '',
          ios: ''
        }
      }
    },
    userAgent: {
      type: Object,
      required: true
    }
  },

  computed: {
    isLimit () {
      return this.limit &&
        (
          (this.userAgent.isMobi && this.userAgent.isAndroid && this.limit.android) ||
          (this.userAgent.isMobi && this.userAgent.isIos && this.limit.ios) ||
          (this.userAgent.isPc && this.userAgent.isIpad && this.limit.ipad)
        )
    },
    href () {
      if (!this.isLimit) return ''

      if (this.userAgent.isMobi && this.userAgent.isAndroid) {
        // 安卓
        return this.limit.android
      } else if (this.userAgent.isMobi && this.userAgent.isIos) {
        // ios
        return this.limit.ios
      } else if (this.userAgent.isPc && this.userAgent.isIpad) {
        // ipad
        return this.limit.ipad
      }

      return ''
    }
  },

  methods: {
    handleClick (ev) {
      this.$emit('play', 'cover-play-button')

      ev.stopPropagation()
    },

    downloadApp () {
      this.options.downloadApp && this.options.downloadApp()

      window.location.href = this.href
    }
  }
}
</script>

<style>
  #vjs-cover-play-button {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .3);
    cursor: default;
  }

  #vjs-cover-play-button #vjs-cover-play-button__pc-play {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100px;
    height: 36px;
    line-height: 36px;
    border-radius: 25px;
    background: #ff920b;
    transform: translate(-50%, -50%);
    font-size: 15px;
    text-align: center;
    color: #fff;
    cursor: pointer;
  }

  #vjs-cover-play-button #vjs-cover-play-button__mobi {
    position: absolute;
    left: 0;
    bottom: 12px;
    display: flex;
    justify-content: space-around;
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
  }

  .vjs-pc #vjs-cover-play-button #vjs-cover-play-button__mobi {
    height: 80px;
    line-height: 80px;
    font-size: 28px;
  }

  #vjs-cover-play-button #vjs-cover-play-button__mobi-play, #vjs-cover-play-button #vjs-cover-play-button__mobi-download {
    display: block;
    width: 40%;
    flex-shrink: 1;
    text-align: center;
    border-radius: 24px;
  }

  .vjs-pc #vjs-cover-play-button #vjs-cover-play-button__mobi-play, .vjs-pc #vjs-cover-play-button #vjs-cover-play-button__mobi-download {
    border-radius: 48px;
  }

  #vjs-cover-play-button #vjs-cover-play-button__mobi-play {
    background: rgba(255, 255, 255, .6);
    color: #000;
  }

  #vjs-cover-play-button #vjs-cover-play-button__mobi-download {
    background: #FF6329;
    color: #fff;
    text-decoration: none;
  }
</style>
