<template>
  <div id="vjs-error-icon" v-show="visibleError">
    <div id="vjs-error-icon__box">
      <div id="vjs-error-icon__style1">
        <img class="vjs-error-icon__refresh" src="~assets/img/video_fail.png" @click="reload">
        <div>加载失败，请尝试<a class="vjs-error-icon__refresh" @click="reload">刷新</a>页面</div>
        <!-- 切换线路或 -->
      </div>

      <div id="vjs-error-icon__style2">
        <img src="~assets/img/video_fail2.png">
        <div class="vjs-error-icon__style2-title">视频加载失败</div>
        <div>如长时间画面未加载，请尝试<i @click="reload">重新加载</i></div>
        <!-- <span v-if="isNextLine"><i @click="$emit('nextLine')">切换线路</i>或</span><span v-else>尝试</span><i @click="reload">重新加载</i> -->
        <div>如所有内容都无法播放，推荐使用Chrome或Safari浏览器。</div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { isBoolean } from 'lodash'
import { debuglog, deepMerge } from 'utils'

export default {
  name: 'error-icon',

  props: {
    options: {
      type: Object,
      required: true
    },
    player: {
      type: Object,
      required: true
    },
    dom: {
      type: Object,
      required: true
    },
    userAgent: {
      type: Object,
      required: true
    },
    playState: {
      type: Boolean,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    windowDisplayState: {
      type: Boolean,
      required: true
    },
    isNextLine: {
      type: Boolean,
      required: true
    },
    otherDisplayState: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      // 是否显示错误
      visibleError: false,
      // 超时次数
      catonNumber: 0,
      // 错误信息
      errorInfo: null,
      // 超时定时器
      timeoutTimer: null,
      // 当前超时时间 s
      currentTimeoutTime: 0,
      // 当waiting之后，需要两次timeupdate才算能流畅播放
      timeupdateNum: 1,
      // 是否允许显示切换线路的提示
      isShowLinePrompt: true,
      // 删除切换线路的提示
      removeLinePromptFn: null
    }
  },

  computed: {
    errorOptions () {
      const errorOptions = this.options.errorOptions || {}

      return {
        // 展示切换提示的时间
        timeoutTime: errorOptions.timeoutTime || 15,
        // 第一次卡顿向后台发送请求
        firstTimeoutRequestTime: errorOptions.firstTimeoutRequestTime || 10,
        // 持续性卡顿向后台发送请求
        timeoutRequestTime: errorOptions.timeoutRequestTime || 30,
        // 在持续性卡顿过程中，是否需要重复请求后台
        isRepeat: isBoolean(errorOptions.isRepeat) ? errorOptions.isRepeat : true,
        // 展示错误页面的时间
        errorTime: errorOptions.errorTime || 60,
        // 禁用时长，当卡顿秒数大于此数时，不会向后台发送请求
        disableTime: errorOptions.disableTime || 600
      }
    }
  },

  watch: {
    playState (newVal) {
      if (newVal) {

      } else {
        // debuglog.log('error pause');
        this.clearErrorTimeout('pause')
      }
    },

    currentTime () {
      // debuglog.log('error timeupdate');

      // 当waiting之后，需要两次timeupdate才算能流畅播放
      if (this.timeupdateNum === 1) {
        this.timeupdateNum += 1
      } else {
        this.timeupdateNum = 1
        this.clearErrorTimeout('currentTime')
        this.removeLinePrompt()
      }
    },

    visibleError: {
      handler (newVal) {
        if (newVal) {
          this.dom.videoBox.classList.add('vjs-play-error')
        } else {
          this.dom.videoBox.classList.remove('vjs-play-error')
        }

        this.$emit('updateVisibleError', newVal)
      },
      immediate: true
    },

    currentTimeoutTime (newVal) {
      if (newVal > this.errorOptions.errorTime) {
        console.warn(`error: 展现错误页面！`)
        this.$set(this, 'visibleError', true)
      }

      if (this.isShowLinePrompt && this.otherDisplayState && this.isNextLine && !this.errorInfo && newVal >= this.errorOptions.timeoutTime) {
        console.warn(`error: 展示切换提示！`)
        this.$set(this, 'isShowLinePrompt', false)

        var prompt = Vue.extend({
          props: {
            nextLine: {
              type: Function,
              required: true
            }
          },
          template: `<div>播放卡顿，不流畅？尝试更换线路试试 <span style="color: #ff6e0b; cursor: pointer;" @click="nextLine">切换线路</span></div>`
        })

        this.removeLinePromptFn = this.$vjsPrompt.add({
          component: prompt,
          props: {
            nextLine: () => {
              this.$emit('nextLine')
            }
          },
          autoClose: false
        }).remove
      }

      // 当前视频不报错
      // 当 当前超时 时间为 设定超时的n倍时，发送报错信息
      if (
        this.options.error &&
        !this.errorInfo &&
        newVal !== 0 &&
        newVal <= this.errorOptions.disableTime &&
        (
          newVal === this.errorOptions.firstTimeoutRequestTime ||
          (this.errorOptions.isRepeat && newVal % this.errorOptions.timeoutRequestTime === 0)
        )
      ) {
        console.warn(`error: 发送超时错误报告！`)

        this.catonNumber += 1

        this.options.error({
          code: 2,
          type: `资源卡顿`,
          tvid: this.options.id,
          'part_id': this.options.part_id,
          catonNumber: this.catonNumber, // 当前剧总卡顿次数
          consecutiveTimeoutNumber: newVal / this.errorOptions.timeoutRequestTime, // 当前卡顿时，总请求次数
          catonTime: newVal, // 卡顿时长
          playUrl: this.options.playUrl,
          sec: this.currentTime,
          userAgent: this.userAgent.userAgentInfo,
          os: this.userAgent.browserParser.os.name,
          osVersion: this.userAgent.browserParser.os.version,
          browser: this.userAgent.browserParser.browser.name,
          browserVersion: this.userAgent.browserParser.browser.version,
          platform: this.userAgent.isPc ? 'pc' : 'wap'
        })
      }
    }
  },

  methods: {
    reset () {
      clearTimeout(this.timeoutTimer)

      deepMerge(this.$data, this.$options.data())
    },
    reload () {
      window.location.reload()
    },
    setErrorTimeout () {
      // debuglog.warn('开启timeout定时器');
      this.timeoutTimer = setTimeout(() => {
        debuglog.warn('timeout error')

        // 当前页面处于显示时
        if (this.windowDisplayState) {
          this.currentTimeoutTime += 1
        }

        this.setErrorTimeout()
      }, 1000)
    },
    clearErrorTimeout (position) {
      // 存在错误时，不清除error
      if (this.errorInfo) return

      debuglog.warn(`clear: ${position}`)

      // debuglog.warn('清除timeout定时器');
      clearTimeout(this.timeoutTimer)
      this.$set(this, 'visibleError', false)
      this.currentTimeoutTime = 0
    },
    displayError () {
      console.warn(`error: 进入错误！`)
      if (this.player.error_ && this.player.error_.code > 0) {
        this.$set(this, 'visibleError', true)
        console.warn(`error: 显示错误！`)

        // 资源404之类的时，才会赋值
        if (this.player.error_.code === 4) {
          this.errorInfo = this.player.error_
        }
      }

      if (this.options.error && this.player.error_) {
        console.warn('异常')

        this.options.error({
          code: 1,
          type: `资源出现异常`,
          tvid: this.options.id,
          'part_id': this.options.part_id,
          playUrl: this.options.playUrl,
          videoErrorCode: this.player.error_.code,
          videoErrorMsg: this.player.error_.message
        })
      }
    },
    error () {
      this.clearErrorTimeout('error')

      this.displayError()
    },
    waiting () {
      // debuglog.log('waiting');
      this.clearErrorTimeout('waiting')
      this.setErrorTimeout()
    },
    removeLinePrompt () {
      this.$set(this, 'isShowLinePrompt', true)
      this.removeLinePromptFn && this.removeLinePromptFn()
    }
  }
}
</script>

<style>
  #vjs-error-icon {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: #000;
    z-index: 40;
  }

  .vjs-error #vjs-error-icon {
    display: block;
  }

  #vjs-error-icon #vjs-error-icon__box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    text-align: center;
  }

  #vjs-error-icon #vjs-error-icon__style1 {
    /* display: none; */
    font-size: 18px;
  }

  #vjs-error-icon #vjs-error-icon__style1 img.vjs-error-icon__refresh {
    display: block;
    width: 70px;
    height: 70px;
    margin: 0 auto 13px auto;
  }

  #vjs-error-icon #vjs-error-icon__style1 a.vjs-error-icon__refresh {
    color: #1f93ea;
    text-decoration: none;
    cursor: pointer;
  }

  #vjs-error-icon .vjs-error-icon__refresh {
    cursor: pointer;
  }

  #vjs-error-icon #vjs-error-icon__style2 {
    display: none;
    font-size: 18px;
  }

  #vjs-error-icon #vjs-error-icon__style2 img {
    display: block;
    width: 132px;
    height: 132px;
    margin: 0 auto 22px;
  }

  #vjs-error-icon #vjs-error-icon__style2 .vjs-error-icon__style2-title {
    margin-bottom: 46px;
  }

  #vjs-error-icon #vjs-error-icon__style2 > div {
    margin-bottom: 22px;
  }

  #vjs-error-icon #vjs-error-icon__style2 i {
    color: #0F91ED;
    cursor: pointer;
    font-style:normal;
  }
</style>
