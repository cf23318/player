<template>
  <div id="vjs-download-app" v-if="visible">
    <div id="vjs-download-app__content">
      <div id="vjs-download-app__text">5分钟试看已结束，下载App观看完整版。</div>
      <a id="vjs-download-app__download" href="javascript:;" @click="downloadApp">下载APP</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'download-app',

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
    },
    currentTime: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      visible: false
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

  watch: {
    'currentTime' (newVal) {
      if (this.isLimit && newVal > this.options.prologue + 300) {
        this.$set(this, 'visible', true)
        this.$emit('pause', 'cover play button: limit')
      }
    }
  },

  methods: {
    downloadApp () {
      this.options.downloadApp && this.options.downloadApp()

      window.location.href = this.href
    }
  }
}
</script>

<style>
  #vjs-download-app {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
    background: #4B4A4F;
    font-size: 15px;
    text-align: center;
  }

  #vjs-download-app #vjs-download-app__content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  #vjs-download-app #vjs-download-app__text {
    margin-bottom: 20px;
  }

  #vjs-download-app #vjs-download-app__download {
    display: block;
    width: 98px;
    height: 35px;
    line-height: 35px;
    background: linear-gradient(90deg,rgba(255,133,11,1) 0%,rgba(255,89,84,1) 100%);
    border-radius: 24px;
    margin: 0 auto;
    color: #fff;
    text-decoration: none;
  }
</style>
