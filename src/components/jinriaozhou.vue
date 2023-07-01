<template>
  <div v-if="visible" class="vjs-jinri">
    <div v-if="userAgent.isPc && visible" class="vjs-jinri__pc" :style="{backgroundImage: `url(${jinri.pcPic.bg})`}">
      <div class="vjs-jinri__pc-layout">
        <img class="vjs-jinri__pc__top" :src="jinri.pcPic.top" />
        <div class="vjs-jinri__pc__center">
          <div class="vjs-jinri__pc__app-pic-layout">
            <img class="vjs-jinri__pc__app-pic" :src="jinri.pcPic.appPic" />
          </div>

          <div class="vjs-jinri__pc__qr-code">
            <qrcode-vue class="vjs-jinri__pc__qr-code-img" :value="jinriUrl" level="H" :title="jinriUrl" size="300"></qrcode-vue>
          </div>
        </div>
        <img class="vjs-jinri__pc__bottom" :src="jinri.pcPic.bottom" />
      </div>
    </div>

    <div v-if="userAgent.isMobi && visible" class="vjs-jinri__mobi" :style="{backgroundImage: `url(${jinri.mobiPic.bg})`}">
      <img class="vjs-jinri__mobi__top" :src="jinri.mobiPic.top" />

      <img class="vjs-jinri__mobi__app-pic" :src="jinri.mobiPic.appPic" />

      <img class="vjs-jinri__mobi__button" :src="jinri.mobiPic.button" :data-clipboard-text="jinriPassword" />

      <img class="vjs-jinri__mobi__bottom" :src="jinri.mobiPic.bottom" />
    </div>
  </div>
</template>

<script>
import videoLocal from '@/config/video-local'
import QrcodeVue from 'qrcode.vue'
import Clipboard from 'clipboard'

import { deepMerge } from 'utils'

export default {
  name: 'jinri',

  components: {
    QrcodeVue
  },

  props: {
    preInitialLoadOtherPlugins: {
      type: Object,
      required: true
    },
    preInitialLoadOtherPluginsOrder: {
      type: Array,
      required: true
    },
    initState: {
      type: Object,
      required: true
    },
    displayState: {
      type: Boolean,
      required: true
    },
    userAgent: {
      type: Object,
      required: true
    },
    coverState: {
      type: Boolean,
      required: true
    },
    otherDisplayState: {
      type: Boolean,
      required: true
    },
    coverAndProhibitPlay: {
      type: Boolean,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    jinri: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      visible: false,
      cancelSource: null,
      requestSubscribeTimer: null,
      requestTimeInterval: 5000,
      followedSuccess: false, // 是否关注成功
      jinriUrl: '',
      jinriPassword: '',
      watchNumber: -1,

      teseOne: true,
      teseTimer: null
    }
  },

  watch: {
    currentTime: {
      handler (newVal) {
        this.processingJudgment(newVal, 'currentTime')
      },
      immediate: true
    },

    coverState: {
      handler (newVal) {
        // 在页面取消
        if (!newVal) {
          if (this.initState.firstTimeAfterReset) {
            this.$emit('update:initState', { firstTimeAfterReset: false })
          } else {
            this.processingJudgment(this.currentTime, 'coverState')
          }
        }
      },
      immediate: true
    },

    preInitialLoadOtherPlugins () {
      this.processingJudgment(this.currentTime, 'preInitialLoadOtherPlugins')
    },

    otherDisplayState: {
      handler (newVal) {
        if (newVal) {
          if (this.jinri.time >= 0) {
            const watchNumber = this.watchNumber + 1
            this.$set(this, 'watchNumber', watchNumber)
            videoLocal.setItem('jinriWatchNumber', watchNumber)
          }
        }
      },
      immediate: true
    }
  },

  mounted () {
    if (this.userAgent.isMobi) {
      this.jinriPassword = this.jinri.password

      let clipboard = new Clipboard('.vjs-jinri__mobi__button')
      clipboard.on('success', () => {
        alert('已为您复制口令')
        // window.open('https://syd.to/9wrv')
        if (this.options.onJinriWapOpenUrl) this.options.onJinriWapOpenUrl()
        // window.open('https://applink.jinri.com')
        window.location.href = 'https://applink.jinri.com'
      })
      clipboard.on('fail', () => {
        alert('口令复制失败')
      })
      clipboard.on('error', () => {
        alert('口令复制失败')
      })
    }
  },

  beforeDestroy () {
    clearTimeout(this.requestSubscribeTimer)
    clearTimeout(this.teseTimer)
  },

  methods: {
    /**
     * 处理关注和分享
     */
    processingJudgment (newVal) {
      if (this.coverState) return

      if (this.followedSuccess) return
      if (!this.jinriUrl) this.jinriUrl = this.jinri.url
      if (!this.jinriPassword) this.jinriPassword = this.jinri.password

      const next = () => {
        // 判断是否需要关注
        const time = this.jinri.time
        if (
          (this.jinriUrl || this.jinriPassword) &&
          this.watchNumber >= this.jinri.activeNumber &&
          time >= 0 && newVal >= time &&
          !(this.userAgent.isIos && parseFloat(this.userAgent.version) < 10) // 如果是 ios 的话，必须要大约 ios 9
        ) {
          // 如果 time 为0，end为true，那么不需要显示了
          if (time === 0) {
            if (this.initState.end) return

            if (!this.initState.start) {
              this.$emit('update:initState', { start: true })
            }

            // 按照指定顺序执行内容
            let hasSuccess = false
            for (let i = 0; i < this.preInitialLoadOtherPluginsOrder.length; i++) {
              if (this.preInitialLoadOtherPluginsOrder[i] === 'jinri') {
                hasSuccess = true
              }

              if (!hasSuccess && !this.preInitialLoadOtherPlugins[this.preInitialLoadOtherPluginsOrder[i]].end) return
            }
          }

          this.$set(this, 'visible', true)
          this.$emit('update:coverAndProhibitPlay', true)
          if (this.userAgent.isMobi) {
            document.querySelector(this.options.playerBox).classList.add('vjs-jinri-page-fullscreen')
          }
          if (this.options.onJinriPcShow) this.options.onJinriPcShow()
          this.requestSubscribe(() => {
            if (this.userAgent.isMobi) document.querySelector(this.options.playerBox).classList.remove('vjs-jinri-page-fullscreen')
            this.$emit('update:coverAndProhibitPlay', false)
            if (!this.initState.end) {
              this.$emit('update:initState', { start: true, end: true, skipOtherOptions: true })
            }
          })
        }

        this.$nextTick(() => {
          if (!this.initState.start) {
            this.$emit('update:initState', { start: true, end: true })
          }
        })
      }

      if (this.watchNumber === -1) {
        videoLocal
          .getItem('jinriWatchNumber')
          .then((data) => {
            this.watchNumber = isNaN(data) ? 0 : Number(data)

            next()
          })
          .catch(() => {
            this.watchNumber = 0
          })
      } else {
        next()
      }
    },
    reset () {
      clearTimeout(this.requestSubscribeTimer)
      clearTimeout(this.teseTimer)

      deepMerge(this.$data, this.$options.data(), {
        visible: this.visible,
        cancelSource: this.cancelSource,
        followedSuccess: this.followedSuccess,
        jinriUrl: this.jinriUrl,
        jinriPassword: this.jinriPassword
      })
      this.$nextTick(() => {
        this.processingJudgment(0, 'reset')
      })
    },
    /**
     * 请求判断 是否关注公众号
     */
    requestSubscribe (cb) {
      if (this.options.jinriSubscribeFn) {
        const cancelSource = this.cancelSource = new Date().getTime()

        this.options.jinriSubscribeFn({
          success: (response) => {
            if (this.cancelSource !== cancelSource) return console.warn('获取关注公众号请求被下一个取消！')

            if (!this.followedSuccess && response.code === 0 && response.data.status === 1) {
              this.visible = false
              this.followedSuccess = true

              cb && cb()
            }

            // this.success(cb)
          },
          error: (error) => {
            console.error('获取wx关注失败!', error)
            // this.success(cb)
          }
        })

        if (!this.followedSuccess) {
          clearTimeout(this.requestSubscribeTimer)
          this.requestSubscribeTimer = setTimeout(this.requestSubscribe.bind(this, cb), this.requestTimeInterval)
        }
      }
    },
    success () {}
    // success (cb) {
    //   if (this.teseOne) {
    //     this.teseOne = false
    //     // debuglog.log('set teseOne');
    //     this.teseTimer = setTimeout(() => {
    //       this.followedSuccess = true

    //       cb && cb()
    //     }, 3000)
    //   }
    // },
  }
}
</script>

<style lang="scss">
.vjs-jinri {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 101;
  background: #000;
  background: #fff;
  font-size: 16px;
  cursor: default;
  overflow: auto;

  .vjs-jinri__pc {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .vjs-jinri__pc-layout {
    position: absolute;
    top: 50%;
    width: 100%;
    transform: translate(0, -50%);
  }

  .vjs-jinri__pc__top {
    display: block;
    width: 63.07%;
    margin: 0 auto;
  }

  .vjs-jinri__pc__center {
    position: relative;
    width: 57.86%;
    margin: 2.08% auto 0;
    overflow: hidden;

    .vjs-jinri__pc__app-pic-layout {
      float: left;
      position: relative;
      width: calc(60.306% + 16px);
      height: 0;
      padding-bottom: calc(32.223%);
      border: 8px solid #fff;
      border-radius: 15px;

      .vjs-jinri__pc__app-pic {
        position: absolute;
        left: 0;
        top: 0;
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 15px;
      }
    }

    .vjs-jinri__pc__qr-code {
      float: right;
      position: relative;
      width: calc(32.223% + 16px);
      padding-bottom: calc(32.223%);
      border: 8px solid #fff;
      border-radius: 15px;
      background: #B4B1B4;

      .vjs-jinri__pc__qr-code-img {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;

        & > canvas {
          width: 100% !important;
          height: 100% !important;
        }
      }
    }
  }

  .vjs-jinri__pc__bottom {
    display: block;
    width: 56.71%;
    margin: 2.96% auto 0;
  }

  .vjs-jinri__mobi {
    width: 100%;
    min-height: 100%;
    padding-bottom: 100px;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .vjs-jinri__mobi__top {
    width: calc(100% - 10.67%);
    margin: 12% 5.33% 0;
  }

  .vjs-jinri__mobi__app-pic {
    width: calc(100% - 10.67%);
    border: 8px solid #fff;
    border-radius: 15px;
    margin: 5.33% 5.33% 0;
  }

  .vjs-jinri__mobi__button {
    width: calc(100% - 10.67%);
    margin: 6.4% 5.33% 0;
    cursor: pointer;
  }

  .vjs-jinri__mobi__bottom {
    width: calc(100% - 10.67%);
    margin: 8% 5.33% 0;
  }
}
</style>
