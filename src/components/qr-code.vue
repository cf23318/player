<template>
  <div id="vjs-qr-code" v-if="type">
    <div class="vjs-qr-code__subscription" v-if="userAgent.isPc && type === 'subscription'">
      <div class="vjs-qr-code__subscription-layout">
        <div class="vjs-qr-code__subscription-title">
          关注{{wxSubscribe.title}}“
          <font class="vjs-qr-code__subscription-title-emphasize" v-text="wxSubscribe.name"></font>
          <img class="vjs-qr-code__subscription-title__logo" :src="wxSubscribe.logo">
          ”即可免费观影
        </div>
        <div class="vjs-qr-code__subscription-title2" v-text="title2" />

        <div class="vjs-qr-code__subscription-content">
          <div class="vjs-qr-code__qr-code-box">
            <div class="vjs-qr-code__qr-code-title">
              <img src="~assets/img/video_wechat.png" width="40" height="32">
              <span>手机微信扫码</span>
            </div>

            <img class="vjs-qr-code__subscription-qr-code" :src="wxSubscribe.qrCode">
          </div>

          <div class="vjs-qr-code__subscription-text">
            <div class="vjs-qr-code__subscription-prompt">
              <div class="vjs-qr-code__subscription-prompt__line">1. 打开手机里的微信后，点击右上角<img class="vjs-add-icon" src="~assets/img/video_add.png" width="25" height="25">选择“扫一扫” </div>
              <div class="vjs-qr-code__subscription-prompt__line">2. 扫描左边二维码，点击关注公众号 </div>
              <div class="vjs-qr-code__subscription-prompt__line">3. 在公众号对话框输入下面的观影码，即可播放！ </div>
            </div>

            <div class="vjs-qr-code__subscription-code-box">观影码由<img class="vjs-qr-code__subscription-code__logo" :src="wxSubscribe.logo">独家提供:&nbsp;&nbsp;&nbsp;<span class="vjs-qr-code__subscription-code" v-text="wxSubscribeCode"></span></div>
          </div>

          <div class="vjs-qr-code__subscription-example">
            <span class="vjs-qr-code__subscription-example__title">如下图案例所示：</span>
            <img :src="wxSubscribe.pcExample" height="215">
          </div>
        </div>

        <div class="vjs-qr-code__subscription-footer">
          <div class="vjs-qr-code__subscription-footer__prompt-1">如果您换了其它浏览器或者使用了无痕模式，可能需要再次扫描二维码，并输入观影码。</div>
          <div class="vjs-qr-code__subscription-footer__prompt-2">感谢您的支持！</div>
        </div>
      </div>
    </div>

    <div class="vjs-qr-code__subscription-wap" v-if="userAgent.isMobi && type === 'subscription'">
      <div class="vjs-qr-code__subscription-wap-title">请关注官方公众号 即可免费观影!</div>
      <div>关注微信公众号“<span class="vjs-qr-code__subscription-wap-warn" v-text="wxSubscribe.name"></span>”后，在公众号对话框输入观影码，然后回到该页面刷新页面即可观影。只需关注一次，未来所有内容即可免费观看！</div>
      <div class="vjs-qr-code__subscription-wap-code-box"><span class="vjs-qr-code__subscription-wap-code" v-text="wxSubscribeCode"></span><span class="vjs-qr-code__subscription-wap-btn" :data-clipboard-text="wxSubscribeCode">复制观影码</span></div>
      <div class="vjs-qr-code__subscription-wap-prompt1">当前观影码有效期剩余<span class="vjs-qr-code__subscription-wap-prompt1-special" v-text="expirationFormatTime"></span>秒</div>
      <div class="vjs-qr-code__subscription-wap-prompt2">如遇任何问题，可尝试刷新页面</div>
      <div class="vjs-qr-code__subscription-wap-operation-tutorial-title">操作流程</div>
      <img class="vjs-qr-code__subscription-wap-operation-tutorial" :src="wxSubscribe.mobiExample">
    </div>

    <div class="vjs-qr-code__share" v-if="type === 'share'">
      <div class="vjs-qr-code__qr-code-box">
        <div class="vjs-qr-code__qr-code-title">
          <img src="~assets/img/video_wechat.png" width="50" height="40">
          <span>微信扫码</span>
        </div>

        <qrcode-vue class="vjs-qr-code-img" :value="shareUrl" size="215" level="H" :title="shareUrl"></qrcode-vue>
      </div>

      <div class="vjs-qr-code-text">
        <p>亲爱的用户:</p>
        <p>请打开微信，点击右上角<img class="vjs-add-icon" src="~assets/img/video_add.png" width="25" height="25">，选择扫一扫，扫码左边的二维码。</p>
        <p>并按照提示操作后，即可正常观看视频！</p>
      </div>
    </div>
  </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue'
import Clipboard from 'clipboard'

import { isNumber } from 'lodash'
import { deepMerge } from 'utils'

export default {
  name: 'qr-code',

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
    coverAndProhibitPlay: {
      type: Boolean,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    sharing: {
      type: Object,
      default () {
        return {}
      }
    },
    wxSubscribe: {
      type: Object,
      default () {
        return {}
      }
    },
    country: {
      type: Object,
      default () {
        return {}
      }
    }
  },

  data () {
    return {
      // subscriptionImgType: 'other',
      type: null,
      cancelSource: null,
      cancelSource2: null,
      ajaxOnOff: true,
      requestCodeTimer: null,
      requestSubscribeTimer: null,
      requestTimeInterval: 5000,
      shareUrl: '',
      shareSuccess: false, // 是否分享成功
      followedSuccess: false, // 是否关注成功
      wxSubscribeCode: null,
      expirationTime: 0, // 过期时间倒计时变量
      expirationFormatTime: 0, // 格式化后的时间
      expirationTimer: null, // 过期时间倒计时定时器变量

      teseOne: true,
      teseTimer: null
    }
  },

  computed: {
    // subscriptionImgSrc () {
    //   return this.subscriptionImgType === 'other' ? this.wxSubscribe.qrCode : this.wxSubscribe.defaultQrCode;
    // }

    title2 () {
      // title 对城市来讲是不好的宣传，但是对整个国家对宣传来讲，是友好地
      if (this.country.city) return ''
      if (!this.country.name) return ''

      return `${this.country.name}最新最全公众号${this.wxSubscribe.name}带你探索${this.country.name}`
    }
  },

  watch: {
    type: {
      handler: function (newVal) {
        this.$emit('update:displayState', !!newVal)
      },
      immediate: true
    },

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
    }
  },

  mounted () {
    if (this.userAgent.isMobi) {
      this.wxSubscribeCode = this.wxSubscribe.code

      let clipboard = new Clipboard('.vjs-qr-code__subscription-wap-btn')
      clipboard.on('success', function () {
        alert('已为您复制观影码！')
        window.location.href = 'weixin://'
      })
      clipboard.on('fail', function () {
        alert('观影码复制失败，请尝试长按观影码复制！')
      })
    }
  },

  beforeDestroy () {
    clearTimeout(this.requestCodeTimer)
    clearTimeout(this.requestSubscribeTimer)
    clearTimeout(this.expirationTimer)
    clearTimeout(this.teseTimer)
  },

  methods: {
    /**
     * 处理关注和分享
     */
    processingJudgment (newVal) {
      if (this.coverState) return

      // 每次最多执行一个操作
      let onOff = true
      if (this.followedSuccess || this.shareSuccess) onOff = false
      if (this.wxSubscribeCode === null) this.wxSubscribeCode = this.wxSubscribe.code

      // 判断是否需要关注
      const wxSubscribeTime = parseInt(this.wxSubscribe.time)
      if (onOff && !this.type && this.wxSubscribeCode && wxSubscribeTime >= 0 && newVal >= wxSubscribeTime) {
        // 如果 time 为0，end为true，那么不需要显示了
        if (wxSubscribeTime === 0) {
          if (this.initState.end) return

          if (!this.initState.start) {
            this.$emit('update:initState', { start: true })
          }

          // 按照指定顺序执行内容
          let hasSuccess = false
          for (let i = 0; i < this.preInitialLoadOtherPluginsOrder.length; i++) {
            if (this.preInitialLoadOtherPluginsOrder[i] === 'qrCode') {
              hasSuccess = true
            }

            if (!hasSuccess && !this.preInitialLoadOtherPlugins[this.preInitialLoadOtherPluginsOrder[i]].end) return
          }
        }

        this.$set(this, 'type', 'subscription')
        this.$emit('update:coverAndProhibitPlay', true)
        this.$set(this, 'expirationTime', new Date().getTime() + this.wxSubscribe.timeout * 1000)
        this.requestCode(this.wxSubscribe.timeout - 10)
        this.openExpirationTimer()
        if (this.userAgent.isMobi) {
          document.querySelector(this.options.playerBox).classList.add('vjs-qrCode-page-fullscreen')
        }
        this.requestSubscribe(() => {
          if (this.userAgent.isMobi) document.querySelector(this.options.playerBox).classList.remove('vjs-qrCode-page-fullscreen')
          this.$emit('update:coverAndProhibitPlay', false)
          if (!this.initState.end) {
            this.$emit('update:initState', { start: true, end: true, skipOtherOptions: true })
          }
        })

        onOff = false
      }

      // if (this.userAgent.isPc) {
      //   // 判断分享时间
      //   if (onOff && !this.type && this.sharing.time >= 0 && newVal >= this.sharing.time) {
      //     if (wxSubscribeTime === 0) {
      //       // 如果 time 为0，end为true，那么不需要显示了
      //       if (this.initState.end) return;
      //       if (!this.initState.start) this.$emit('update:initState', {start: true});
      //     }
      //     this.createShareImg(this.sharing.parm);
      //     this.requestUserShareparam((parseInt(this.sharing.timeout) - 5) * 1000);

      //     this.$set(this, 'type', 'share');
      //     this.$emit('update:coverAndProhibitPlay', true);
      //     this.requestUserShare(() => {
      //       this.$emit('update:coverAndProhibitPlay', false);
      //       if (!this.initState.end) {
      //         this.$emit('update:initState', {start: true, end: true, skipOtherOptions: true});
      //       }
      //     });

      //     onOff = false;
      //   }
      // }

      this.$nextTick(() => {
        if (!this.initState.start) {
          this.$emit('update:initState', { start: true, end: true })
        }
      })
    },
    reset () {
      clearTimeout(this.teseTimer)
      clearTimeout(this.expirationTimer)

      deepMerge(this.$data, this.$options.data(), {
        type: this.type,
        cancelSource: this.cancelSource,
        cancelSource2: this.cancelSource2,
        shareSuccess: this.shareSuccess,
        followedSuccess: this.followedSuccess,
        wxSubscribeCode: this.wxSubscribeCode,
        expirationTime: this.expirationTime
      })
      this.$nextTick(() => {
        this.processingJudgment(0, 'reset')
      })
    },
    /**
     * 生成分享的图片
     */
    // createShareImg (shareUrl) {
    //   let domain = window.location.host;
    //   if (!/^https?/.test(domain)) domain = `${window.location.protocol}//${domain}`;

    //   if (parseInt(this.sharing.time) !== -1) {
    //     this.shareUrl = `${this.options.url.shareDomainName}/saoma?qrcodeparm=${shareUrl}&tvid=${this.options.id}&sbID=${this.options.sbID}&token=${this.options.token}&country=${this.options.country.code}`;
    //   }
    // },
    /**
     * 请求判断链接参数是否改变
     */
    // requestUserShareparam (time) {
    //   setTimeout(() => {
    //     let self = this;

    //     if (this.options.url.shareParam) {
    //       window.$.ajax({
    //         url: this.options.url.shareParam,
    //         data: {},
    //         dataType: 'json',
    //         type: 'post',
    //         success: function (data) {
    //           if (self.ajaxOnOff) {
    //             if (data.status === 200) {
    //               self.createShareImg(data.data.qrcodeparm);
    //               self.requestUserShareparam(parseInt(data.data.qrcodeparmTimeout) * 1000);
    //             } else {
    //               self.requestUserShareparam(3000);
    //             }
    //           }
    //         },
    //         error: function (error) {
    //           if (self.ajaxOnOff) {
    //             self.requestUserShareparam(3000);
    //             console.error(error);
    //           }
    //         },
    //       });
    //     }
    //   }, time);
    // },
    /**
     * 请求判断是否分享
     */
    // requestUserShare (cb) {
    //   if (this.ajax) this.ajax.abort();
    //   let self = this;

    //   if (this.options.url.share) {
    //     this.ajax = window.$.ajax({
    //       url: this.options.url.share,
    //       data: {
    //         tvid: this.options.id,
    //         'part_id': this.options.part_id,
    //         country: this.options.country.code,
    //         get: 1
    //       },
    //       dataType: 'json',
    //       type: 'post',
    //       success: function (data) {
    //         if (self.ajaxOnOff && data.status === 200 && data.data === 1) {
    //           self.type = null;
    //           self.shareSuccess = true;
    //           self.ajaxOnOff = false;
    //         }

    //         self.success(cb);
    //       },
    //       error: function (err) {
    //         console.log('err', err);
    //       },
    //       complete: function () {
    //         self.success(cb);
    //       },
    //     });

    //     if (this.ajaxOnOff) setTimeout(this.requestUserShare.bind(this, cb), this.requestTimeInterval);
    //   }
    // },
    /**
     * 请求判断 是否关注公众号
     */
    requestSubscribe (cb) {
      if (this.options.wxSubscribeFn) {
        const cancelSource = this.cancelSource = new Date().getTime()

        this.options.wxSubscribeFn({
          code: 0,
          success: (data) => {
            if (this.cancelSource !== cancelSource) return console.warn('获取关注公众号请求被下一个取消！')

            const { code, wxCode } = data

            if (this.ajaxOnOff && code === 0 && !wxCode) {
              this.type = null
              this.followedSuccess = true
              this.ajaxOnOff = false

              cb && cb()
            }

            // this.success(cb)
          },
          error: (error) => {
            console.error('获取wx关注失败!', error)
            // this.success(cb)
          }
        })

        if (this.ajaxOnOff) {
          clearTimeout(this.requestSubscribeTimer)
          this.requestSubscribeTimer = setTimeout(this.requestSubscribe.bind(this, cb), this.requestTimeInterval)
        }
      }
    },
    requestCode (time) {
      if (this.followedSuccess) return
      if (!isNumber(time)) throw new Error('qr-code requestCode: time is not a valid value')

      if (time < 3) time = 3

      clearTimeout(this.requestCodeTimer)
      this.requestCodeTimer = setTimeout(() => {
        // 在created之前就会调用此函数
        if (this.options.wxSubscribeFn) {
          const cancelSource2 = this.cancelSource2 = new Date().getTime()

          this.options.wxSubscribeFn({
            code: 1,
            success: (data) => {
              if (this.cancelSource2 !== cancelSource2) return console.warn('更新关注公众号code被下一个请求取消！')

              const { wxCode, wxTimeout } = data

              if (this.ajaxOnOff && wxCode) {
                this.$set(this, 'wxSubscribeCode', wxCode)
                this.$set(this, 'expirationTime', new Date().getTime() + wxTimeout * 1000)
                this.requestCode(wxTimeout)
              }
            },
            error: (error) => {
              console.error('获取wxcode失败!', error)
            }
          })
        }
      }, time * 1000)
    },
    openExpirationTimer () {
      clearTimeout(this.expirationTimer)
      if (this.followedSuccess) return
      this.expirationTimer = setTimeout(() => {
        this.$set(this, 'expirationFormatTime', Math.max(Math.ceil((this.expirationTime - new Date().getTime()) / 1000), 0))
        this.openExpirationTimer()
      }, 200)
    },
    success () {}
    // success (cb) {
    //   if (this.teseOne) {
    //     this.teseOne = false
    //     // debuglog.log('set teseOne');
    //     this.teseTimer = setTimeout(() => {
    //       this.type = null
    //       this.shareSuccess = true
    //       this.followedSuccess = true
    //       this.ajaxOnOff = false

    //       cb && cb()
    //     }, 3000)
    //   }
    // }
  }
}
</script>

<style>
#vjs-qr-code {
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
}

#vjs-qr-code .vjs-add-icon {
  position: relative;
  top: -2px;
  margin: 0 14px;
}

#vjs-qr-code .vjs-qr-code__qr-code-box {
  flex-shrink: 0;
  width: 215px;
}

#vjs-qr-code .vjs-qr-code__qr-code-title {
  text-align: center;
  font-size: 20px;
  margin-bottom: 10px;
}

#vjs-qr-code .vjs-qr-code__qr-code-title img {
  vertical-align: middle;
  margin-right: 5px;
}

#vjs-qr-code .vjs-qr-code__subscription {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  color: #4A4A4A;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-layout {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center center;
  transform: translate(-50%, -50%);
}

.mtg-videoplay:not(.mtg-videoplay-widescreen) #vjs-qr-code .vjs-qr-code__subscription-layout {
  transform: translate(-50%, -50%) scale(0.8);
}

.mod_player #vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-layout {
  transform: translate(-50%, -50%) scale(0.3);
}

.live-videoplay .col-xs-9:not(.mtg-videoplay-widescreen) #vjs-qr-code .vjs-qr-code__subscription-layout {
  transform: translate(-50%, -50%) scale(0.8);
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-title {
  height: 56px;
  line-height: 56px;
  margin: 0 0 9px 0;
  text-align: center;
  font-size: 34px;
  color: #FF6329;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-title-emphasize {
  color: #478FE1;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-title__logo {
  width: 53px;
  height: 50px;
  margin: -3px 8px 0;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-title2 {
  height: 40px;
  line-height: 40px;
  margin-bottom: 40px;
  text-align: center;
  font-size: 28px;
  color: #FF6329;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-content {
  position: relative;
  display: flex;
  justify-content: center;
  line-height: 1.4em;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-qr-code {
  display: block;
  width: 215px;
  height: 215px;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-text {
  position: relative;
  width: 580px;
  height: 215px;
  margin: 42px 15px 0 15px;
  white-space: nowrap;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-prompt {
  font-size: 20px;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-prompt .vjs-qr-code__subscription-prompt__line {
  height: 24px;
  line-height: 24px;
  margin-bottom: 15px;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-code-box {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 66px;
  line-height: 66px;
  background: rgba(74,74,74,1);
  border-radius: 33px ;
  font-size: 24px;
  color: #fff;
  text-align: center;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-code__logo {
  width: 38px;
  height: 36px;
  margin: -2px 8px 0;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-code {
  font-size: 36px;
  vertical-align: middle;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-example {
  flex-shrink: 0;
  width: 208px;
  font-size: 20px;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-example .vjs-qr-code__subscription-example__title {
  display: inline-block;
  height: 32px;
  margin-bottom: 10px;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-footer {
  width: 100%;
  text-align: center;
  color: #999;
  font-size: 18px;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-footer {
  font-size: 18px;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-footer__prompt-1 {
  margin-top: 50px;
  color: #FF6329;
}

#vjs-qr-code .vjs-qr-code__subscription .vjs-qr-code__subscription-footer__prompt-2 {
  margin-top: 12px;
  color: #999999;
}

#vjs-qr-code .vjs-qr-code__subscription-wap {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: auto;
  height: auto;
  z-index: 1001;
  padding: 0 20px 20px;
  background: #f8f8f8;
  overflow-y: auto;
  font-size: 16px;
  color: #000;
  line-height: 1.4;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-title {
  margin: 21px 0 15px 0;
  font-size: 18px;
  color: #1F93EA;
  text-align: center;
  font-weight: Bold;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-warn {
  color: #1F93EA;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-code-box {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  padding-right: 100px;
  background: #4A4A4A;
  border-radius: 55px ;
  margin: 15px 0 15px;
  font-size: 14px;
  color: #fff;
  text-align: center;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-code {
  font-size: 24px;
  vertical-align: middle;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-btn {
  position: absolute;
  right: 0;
  width: 120px;
  height: 50px;
  line-height: 50px;
  background: #1F93EA;
  border-radius: 55px;
  font-size: 16px;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-prompt1 {
  font-size: 14px;
  text-align: center;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-prompt1-special {
  font-size: 20px;
  color: #FF6329;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-prompt2 {
  margin-bottom: 30px;
  font-size: 14px;
  text-align: center;
  color: #1F93EA;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-operation-tutorial-title {
  padding-left: 5px;
  margin-bottom: 10px;
  font-size: 18px;
}

#vjs-qr-code .vjs-qr-code__subscription-wap .vjs-qr-code__subscription-wap-operation-tutorial {
  width: calc(100% + 10px);
  margin: 0 0 28px -10px;
}

#vjs-qr-code .vjs-qr-code__share {
  display: flex;
  align-items: center;
  position: absolute;
  left: 50%;
  top: 50%;
  width: 700px;
  transform-origin: center center;
  transform: translate(-50%, -50%);
  color: #4A4A4A;
}

.mod_player #vjs-qr-code .vjs-qr-code__share {
  transform: translate(-50%, -50%) scale(0.4);
}

#vjs-qr-code .vjs-qr-code__share p {
  margin: 0;
  padding: 0;
}

#vjs-qr-code .vjs-qr-code__share .vjs-qr-code-img {
  flex-shrink: 0;
}

#vjs-qr-code .vjs-qr-code__share .vjs-qr-code-text  {
  width: 100%;
  padding-left: 15px;
  line-height: 2em;
  white-space: nowrap;
}

#vjs-qr-code .vjs-qr-code__share .vjs-qr-code-img img {
  box-sizing: initial;
  display: inline !important;
  width: 172px;
  height: 172px;
  padding: 10px;
  background: #fff;
}
</style>
