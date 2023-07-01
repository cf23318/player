<template>
  <div id="vjs-mandatory-advertisement" v-show="displayState">
    <div id="vjs-mandatory-advertisement__href" @click="handleAdClick(currentAdvertisingInfo)">
      <video
        class="vjs-mandatory-advertisement__video vjs-mandatory-advertisement__video0"
        preload="auto"
        poster="~assets/img/video_backdark.jpg"
        playsinline="isiPhoneShowPlaysinline"
        webkit-playsinline="isiPhoneShowPlaysinline"
        x-webkit-airplay="allow"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        @timeupdate="handleTimeupdate"
        @error="handleError"
        @ended="handleEnded"
      ></video>

      <video
        class="vjs-mandatory-advertisement__video vjs-mandatory-advertisement__video1"
        preload="auto"
        poster="~assets/img/video_backdark.jpg"
        playsinline="isiPhoneShowPlaysinline"
        webkit-playsinline="isiPhoneShowPlaysinline"
        x-webkit-airplay="allow"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        @timeupdate="handleTimeupdate"
        @error="handleError"
        @ended="handleEnded"
      ></video>
    </div>

    <div id="vjs-mandatory-advertisement__controls" v-show="controlsVisibleState">
      <div id="vjs-mandatory-advertisement__countdown-box">广告还有 <span id="vjs-mandatory-advertisement__countdown" v-text="advertisingTotalTime"></span> 秒</div>
      <div id="vjs-mandatory-advertisement__close" v-if="this.advertising.closeMandatory" @click="endOfAdvertisement">关闭广告</div>
    </div>

    <front-logo v-show="logoDisplayState" :options="options"></front-logo>
  </div>
</template>

<script>
import FrontLogo from 'components/front-logo.vue'
import videoLocal from '@/config/video-local'

import { cloneDeep, isObject, isUndefined, isString } from 'lodash'
import { debuglog, deepMerge, getVideoType, hasUseMainPlayFn } from 'utils'

export default {
  name: 'mandatory-advertisement',

  components: {
    FrontLogo
  },

  props: {
    dom: {
      type: Object,
      required: true
    },
    player: {
      type: Object,
      required: true
    },
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
    options: {
      type: Object,
      required: true
    },
    playState: {
      type: Boolean,
      required: true
    },
    coverState: {
      type: Boolean,
      required: true
    },
    bigPlayDisplayState: {
      type: Boolean,
      required: true
    },
    mainWatchAdTime: {
      type: Number,
      required: true
    },
    timeUpdateState: {
      type: Boolean,
      required: true
    },
    advertising: {
      type: Object,
      required: true,
      default: () => {
        return {
          // pause: [],
          // closeMandatory: true,
          // recordHistoryMandatoryAd: true,
          // mandatory: {
          //   0: [
          //     {
          //       'seconds': 15,
          //       'photo': '/static/video/adv-1.mp4',
          //       // 'state': '', // undefined 未读取 current 当前 preload 预加载 end 结束
          //     },
          //   ]
          // },
          // trigger: function ({ url }) {
          //   window.open(url)
          // }
        }
      }
    },
    mainPlayerLogoDisplayState: {
      type: Boolean,
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
    coverAndProhibitPlay: {
      type: Boolean,
      required: true
    },
    coverAndAllowPlay: {
      type: Boolean,
      required: true
    },
    playSuccessState: {
      type: Boolean,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    videoType: {
      type: String,
      required: true
    },
    startPrompt: {
      type: Boolean,
      required: true
    },
    volume: {
      type: Number,
      required: true
    },
    muted: {
      type: Boolean,
      required: true
    },
    windowDisplayState: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      // 是否使用主 video 来播放广告
      hasUseMainPlay: true,
      // 广告检测开关，每个视频只允许执行一次
      onOff: {},
      // 切换video的时候记录一些信息
      oldVideoInfo: {
        // currentTime: 0,
      },
      // 是否调用过预加载
      hasPreload: false,
      // 当前广告列表
      currentAdvertisingList: [],
      // 当前广告序列号
      currentAdvertisingIndex: -1,
      // 当前广告剩余时长
      currentAdvertisingTime: 0,
      // 当前广告的详细信息
      currentAdvertisingInfo: {},
      // 广告定时器
      advertisingTimer: null,
      // 是否跳回保存的秒数
      jumpTimeState: false,
      // 播放状态
      adPlayState: false,
      // 当前视频是否播放结束，如果播放结束，不允许再次调用 play，防止重复播放同一个广告
      adPlayEnded: false,
      // 贴片广告广告初始时加载状态
      adStartLoadingStatus: false,
      // 观看时长
      lastWatchAdCurrentTime: 0,
      watchAdTime: 0,
      // 主播放器播放广告时，是否调用了倒计时
      hasUseCountdown: false,
      // 是否点击了 big play 大播放按钮
      hasClickBigPlay: false,
      // 播放广告第一帧的超时函数
      playTimer: null
    }
  },

  computed: {
    /**
     * logo 的显示状态
     */
    logoDisplayState () {
      let displayTime = 0.2

      if (this.hasUseMainPlay) {

      } else {
        return !this.bigPlayDisplayState && this.adPlayState && this.watchAdTime < displayTime
      }

      return false
    },
    controlsVisibleState () {
      return (this.playState || this.adPlayState) && !this.bigPlayDisplayState && !this.mainPlayerLogoDisplayState && !this.logoDisplayState
    },
    /**
     * 当前广告剩余总时长
     */
    advertisingTotalTime () {
      let advertisingTotalTime = 0

      this.currentAdvertisingList.forEach((currentAdvertising) => {
        if (currentAdvertising.state === 'end') return

        if (currentAdvertising.state === 'current') {
          advertisingTotalTime += currentAdvertising.seconds - this.currentAdvertisingTime
        } else {
          advertisingTotalTime += currentAdvertising.seconds
        }
      })

      // 开始预加载
      if (!this.hasPreload && advertisingTotalTime > 0 && advertisingTotalTime < 10) {
        this.$set(this, 'hasPreload', true)
        this.$emit('preload', advertisingTotalTime)
      }

      return parseInt(advertisingTotalTime)
    }
  },

  watch: {
    // 使用 主播放器 播放片头广告时，在 logo 消失之后，调用倒计时
    // mainPlayerLogoDisplayState (newVal) {
    //   if (!this.hasUseCountdown && !newVal && this.hasUseMainPlay && this.playSuccessState && this.currentAdvertisingIndex !== -1) {
    //     clearTimeout(this.playTimer)
    //     this.$set(this, 'hasUseCountdown', true)
    //     this.countdown('mainPlayerLogoDisplayState')
    //   }
    // },

    currentTime (newVal) {
      if (newVal !== 0) this.processingJudgment(newVal, 'currentTime')

      if (this.hasUseMainPlay && newVal > 0.1 && this.jumpTimeState && this.oldVideoInfo.currentTime) {
        this.$set(this, 'jumpTimeState', false)
        this.$emit('changeCurrentTime', { time: this.oldVideoInfo.currentTime })
      }
    },

    // 主播放器播放广告后，调用倒计时
    mainWatchAdTime (newVal) {
      if (!this.hasUseCountdown && this.hasUseMainPlay && newVal > 0.2) {
        clearTimeout(this.playTimer)
        this.$set(this, 'hasUseCountdown', true)
        this.countdown('mainWatchAdTime')
      }
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

    volume (newVal) {
      if (!document.querySelector('.vjs-mandatory-advertisement__video0')) return false

      document.querySelector('.vjs-mandatory-advertisement__video0').volume = newVal
      document.querySelector('.vjs-mandatory-advertisement__video1').volume = newVal
    },

    muted (newVal) {
      if (!document.querySelector('.vjs-mandatory-advertisement__video0')) return false

      document.querySelector('.vjs-mandatory-advertisement__video0').muted = newVal
      document.querySelector('.vjs-mandatory-advertisement__video1').muted = newVal
    },

    windowDisplayState (newVal) {
      if (this.options.customControl.isMandatoryAdvertisementHiddenPause && this.currentAdvertisingIndex !== -1) {
        if (newVal) {
          this.play('windowDisplayState')
          this.countdown('windowDisplayState')
        } else {
          this.pause()
          clearTimeout(this.advertisingTimer)
        }
      }
    }
  },

  created () {
    this.$set(this, 'hasUseMainPlay', hasUseMainPlayFn())
    this.setOnOff()
    this.$nextTick(() => {
      this.processingJudgment(0, 'created')
    })
  },

  mounted () {
    this.setVideoVolume()
  },

  beforeDestroy () {
    clearTimeout(this.advertisingTimer)
  },

  methods: {
    /**
     * 重置
     */
    reset () {
      deepMerge(this.$data, this.$options.data(), {
        hasUseMainPlay: this.hasUseMainPlay
      })

      this.$nextTick(() => {
        this.empty()
        this.setOnOff()
        this.$nextTick(() => {
          this.processingJudgment(0, 'reset')
        })
      })
    },
    /**
     * 通过开关去控制广告的输出
     */
    setOnOff () {
      if (!this.advertising || !isObject(this.advertising.mandatory) || !!this.advertising.disableMandatory) return

      let onOff = {}
      let keys = Object.keys(this.advertising.mandatory)

      for (let i = 0; i < keys.length; i++) {
        onOff[keys[i]] = true
      }

      this.$set(this, 'onOff', onOff)
    },
    /**
     * 清空广告内容
     */
    empty () {
      [...document.querySelectorAll(`.vjs-mandatory-advertisement__video`)].forEach((currentDom) => {
        currentDom.src = ''
      })
    },
    /**
     * 点击广告的回掉函数
     */
    handleAdClick (advertisingInfo) {
      if (this.advertising.mandatoryClick) this.advertising.mandatoryClick(advertisingInfo)

      if (this.advertising.trigger) {
        if (!this.advertising.trigger(advertisingInfo)) {
          return
        }
      }

      // 如果不使用 advertising.trigger 的话，默认用页面打开 url
      if (advertisingInfo.url) {
        window.open(advertisingInfo.url)
      }
    },
    /**
     * 点击大的播放按钮时的回掉函数
     */
    handleBigPlayClick () {
      if (!this.hasClickBigPlay && this.currentAdvertisingIndex !== -1) {
        // 给广告 8 秒加载机会，如果无法加载，开启定时器，如果视频成功播放则取消
        this.playTimer = setTimeout(() => {
          this.endOfAdvertisement('playSuccessState')
        }, 8000)
      }

      this.$set(this, 'hasClickBigPlay', true)
    },
    /**
     * 播放广告
     */
    play (position) {
      debuglog.log('adv play', position)

      if (!this.windowDisplayState && this.options.customControl.isMandatoryAdvertisementHiddenPause && this.currentAdvertisingIndex !== -1) return
      if (this.adPlayEnded) return
      if (this.currentAdvertisingIndex === -1) return

      const videoplay = this.getCurrentVideoDom().play()

      const compatible = () => {
        if (this.getCurrentVideoDom().paused) {
          this.$set(this, 'adPlayState', false)
          // this.$emit('update:playSuccessState', false);
        } else {
          this.$set(this, 'adPlayState', true)
          this.$emit('update:playSuccessState', true)
        }
      }

      if (videoplay && videoplay.then) {
        // this.$set(this, 'adPlayState', true);
        // this.$emit('update:playSuccessState', true);
        let isWhether = true

        videoplay
          .then(() => {
            isWhether = false
            this.$set(this, 'adPlayState', true)
            this.$emit('update:playSuccessState', true)
          })
          .catch((error) => {
            isWhether = false
            this.$set(this, 'adPlayState', false)
            // this.$emit('update:playSuccessState', false);
            console.error(error)
          })

        setTimeout(() => {
          if (isWhether) {
            compatible()
          }
        }, 5000)
      } else {
        setTimeout(() => {
          compatible()
        }, 300)
      }
    },
    /**
     * 影片开始播放之后在开始倒计时
     * 广告 hasUseMainPlay 为 false 的时候使用
     */
    handleTimeupdate (ev) {
      if (!this.currentAdvertisingInfo.playSuccess && ev.target.currentTime > 0.1) {
        clearTimeout(this.playTimer)
        this.$set(this.currentAdvertisingInfo, 'playSuccess', true)
        this.countdown('handleTimeupdate')
      }

      this.calculateWatchAdTime(ev.target.currentTime)
    },
    /**
     * 处理错误
     */
    handleError (ev) {
      //  广告出现错误,跳转到下一条
      if (this.currentAdvertisingIndex === parseInt(ev.target.dataset.adIndex)) {
        this.nextAdvertisement()
      }
    },
    /**
     * 处理广告播放结束
     * 如果播放结束，不允许再次调用播放按钮，得等待 下次刷新
     */
    handleEnded () {
      this.$set(this, 'adPlayEnded', true)
    },
    /**
     * 暂停广告
     */
    pause () {
      [...document.querySelectorAll(`.vjs-mandatory-advertisement__video`)].forEach((currentDom) => {
        currentDom.pause()
      })
    },
    /**
     * 计算观看时长
     * @param {Number} newVal 当前播放的秒数currentTime
     */
    calculateWatchAdTime (currentTime) {
      let diff = currentTime - this.lastWatchAdCurrentTime

      // 差值必须在合理范围内
      if (diff > 0 && diff < 2) {
        this.$set(this, 'watchAdTime', this.watchAdTime + diff)
      }
      this.$set(this, 'lastWatchAdCurrentTime', currentTime)
    },
    /**
     * 获取当前 video dom
     */
    getCurrentVideoDom () {
      const currentDom = document.querySelectorAll(`.vjs-mandatory-advertisement__video`)

      return currentDom[this.currentAdvertisingIndex % 2]
    },
    /**
     * 获取下一个 video dom
     */
    getNextVideoDom () {
      const currentDom = document.querySelectorAll(`.vjs-mandatory-advertisement__video`)

      return currentDom[this.currentAdvertisingIndex % 2 === 0 ? 1 : 0]
    },
    changeMainPlayerSrcAndPlay ({ url }) {
      if (!isUndefined(url) && !isString(url)) throw new Error('url is unreasonable.')

      this.$emit('update:videoType', 'advertising')
      this.$emit('resetVideoAttr')
      debuglog.log('adv url', url)
      // 设置src
      this.player.src({
        src: url,
        type: getVideoType(url)
      })
      this.player.load()
      this.player.ready(() => {
        this.$emit('play', 'mandatory advertisement: play video')
      })
      // this.$emit('play', 'mandatory advertisement: play video');
    },
    /**
     * 处理广告的添加
     */
    processingJudgment (newVal) {
      debuglog.log('adv')
      if (this.coverState) return

      if (
        // 拖动时不允许读取广告
        !this.timeUpdateState &&
        (
          this.userAgent.isPc ||
          (this.userAgent.isIos && parseFloat(this.userAgent.version) >= 11) ||
          (this.userAgent.isAndroid && parseFloat(this.userAgent.version) >= 5)
        )
      ) {
        for (let key in this.onOff) {
          // debuglog.log(
          //   'processingJudgment',
          //   parseInt(key),
          //   this.onOff[key],
          //   'newVal',
          //   newVal,
          //   this.advertising.mandatory[key].length,
          //   !!this.onOff[key] && newVal >= parseInt(key) && this.advertising.mandatory[key].length
          // );

          if (this.onOff[key] && newVal >= parseInt(key) && this.advertising.mandatory[key] && this.advertising.mandatory[key].length) {
            if (parseInt(key) === 0) {
              // 如果 time 为0，end为true，那么不需要显示了
              if (this.initState.end) return

              if (!this.initState.start) {
                this.$emit('update:initState', { start: true })
              }

              // 按照指定顺序执行内容
              let hasSuccess = false
              for (let i = 0; i < this.preInitialLoadOtherPluginsOrder.length; i++) {
                if (this.preInitialLoadOtherPluginsOrder[i] === 'mandatoryAd') {
                  hasSuccess = true
                }

                if (!hasSuccess && !this.preInitialLoadOtherPlugins[this.preInitialLoadOtherPluginsOrder[i]].end) return
              }
            }

            this.$set(this.onOff, key, false)

            if (this.advertising.recordHistoryMandatoryAd && parseInt(key) === 0) {
              videoLocal
                .getItem('lastWatchedStartAdInfo')
                .then((data) => {
                  // 和上一次的广告视频信息不等
                  if (
                    (this.options.id && data.id !== this.options.id.toString().trim()) ||
                    (this.options.part_id && data.part_id !== this.options.part_id.toString().trim())
                  ) {
                    this.playAdvertisement(this.advertising.mandatory[key])
                  } else {
                    // 跳过广告的话，调用 结束广告
                    this.endOfAdvertisement()
                  }
                })
                .catch(() => {
                  this.playAdvertisement(this.advertising.mandatory[key])
                })
            } else {
              this.playAdvertisement(this.advertising.mandatory[key])
            }
          }
        }
      }

      this.$nextTick(() => {
        if (!this.initState.start) {
          this.$emit('update:initState', { start: true, end: true })
        }
      })
    },
    /**
     * 开始播放广告
     */
    playAdvertisement (advertisementList) {
      if (this.hasUseMainPlay) {
        this.$emit('resetVideoAttr')
        this.$set(this, 'oldVideoInfo', {
          currentTime: this.currentTime
        })
        this.$emit('update:coverAndAllowPlay', true)
      } else {
        this.$emit('update:coverAndProhibitPlay', true)
      }

      this.currentAdvertisingList = cloneDeep(advertisementList)

      this.$emit('update:displayState', true)

      this.nextAdvertisement()

      // if (this.playState && !this.mainPlayerLogoDisplayState) this.countdown('playAdvertisement')
    },
    /**
     * 下一个广告
     */
    nextAdvertisement () {
      const currentAdvertisingIndex = this.currentAdvertisingIndex + 1
      this.$set(this, 'adPlayEnded', false)
      this.$set(this, 'currentAdvertisingIndex', currentAdvertisingIndex)
      this.$set(this, 'currentAdvertisingTime', 0)

      // 播放结束，初始化内容。
      if (currentAdvertisingIndex >= this.currentAdvertisingList.length) {
        this.endOfAdvertisement()
        // 最后一个广告播放结束
        if (this.advertising.mandatoryEnd) this.advertising.mandatoryEnd(this.currentAdvertisingList[this.currentAdvertisingList.length - 1])
      }

      this.$nextTick(() => {
        const currentDom = document.querySelector(`.vjs-mandatory-advertisement__video`)
        this.pause()

        const newCurrentAdvertisingList = this.currentAdvertisingList.map((currentAdvertising, index) => {
          // 已结束
          if (index < currentAdvertisingIndex && currentAdvertising.state !== 'end') {
            currentAdvertising.state = 'end'
          }

          // 当前
          if (index === currentAdvertisingIndex) {
            // 上一个广告播放完之后，才允许传递回调函数
            if (index >= 1 && this.advertising.mandatoryEnd) this.advertising.mandatoryEnd(this.currentAdvertisingList[index - 1])

            currentAdvertising.state = 'current'
            this.$set(this, 'currentAdvertisingInfo', currentAdvertising)

            if (this.hasUseMainPlay) {
              let src = currentDom.src

              if (index === 0) {
                // 当前序列号为0时，需要补充指定属性
                src = currentAdvertising.photo
              }

              this.changeMainPlayerSrcAndPlay({ url: src })
            } else {
              const nextVideoDom = this.getNextVideoDom()
              nextVideoDom.classList.remove('play')

              const currentVideoDom = this.getCurrentVideoDom()
              currentVideoDom.classList.add('play')
              currentVideoDom.src = currentAdvertising.photo
              currentVideoDom.dataset.adIndex = index
              this.play()
            }
          }

          if (index === currentAdvertisingIndex + 1) {
            if (this.hasUseMainPlay) {
              currentDom.src = currentAdvertising.photo
            } else {
              const nextVideoDom = this.getNextVideoDom()
              nextVideoDom.src = currentAdvertising.photo
              nextVideoDom.dataset.adIndex = index
            }
          }

          return currentAdvertising
        })

        this.$set(this, 'currentAdvertisingList', newCurrentAdvertisingList)
      })
    },
    /**
     * 倒计时
     */
    countdown (position) {
      if (!this.playSuccessState) return
      if (this.currentAdvertisingIndex === -1) return

      debuglog.log('countdown', position)

      clearTimeout(this.advertisingTimer)
      this.advertisingTimer = setTimeout(() => {
        if (this.currentAdvertisingIndex === -1) return
        if (this.currentAdvertisingIndex !== -1) this.countdown('countdown')

        this.$set(this, 'currentAdvertisingTime', this.currentAdvertisingTime + 0.3)

        if (this.currentAdvertisingTime > this.currentAdvertisingList[this.currentAdvertisingIndex].seconds) {
          this.nextAdvertisement()
        }
      }, 300)
    },
    /**
     * 关闭广告或者广告结束
     */
    endOfAdvertisement () {
      this.pause()
      this.empty()

      const ready = () => {
        this.$set(this, 'currentAdvertisingIndex', -1)
        this.$set(this, 'currentAdvertisingInfo', {})
        if (!this.initState.end) {
          this.$emit('update:initState', { start: true, end: true, skipOtherOptions: true })
        }
        this.$emit('update:displayState', false)
        if (this.hasUseMainPlay) {
          this.$emit('update:coverAndAllowPlay', false)
          if (!this.startPrompt) this.$set(this, 'jumpTimeState', true)
        } else {
          this.$emit('update:coverAndProhibitPlay', false)
        }
        this.$emit('play', 'mandatory advertisement: endOfAdvertisement')

        this.saveADInfoToLocal()
      }

      if (this.hasUseMainPlay) {
        if (this.videoType === 'normal') {
          ready()
        } else {
          // 设置src
          this.player.src({
            src: this.options.playUrl,
            type: getVideoType(this.options.playUrl)
          })
          this.player.load()
          this.player.ready(() => {
            // 重置一部分状态
            this.$emit('resetVideoAttr')
            this.$emit('update:videoType', 'normal')

            ready()
          })
        }
      } else {
        ready()
      }
    },
    /**
     * 看过了广告的话，把广告信息放入本地
     */
    saveADInfoToLocal () {
      // 设置缓存，用户刷新刷新页面时不需要观看当前剧集的广告
      let id = this.options.id
      let partId = this.options.part_id
      if (id && partId) {
        id = id.toString().trim()
        partId = partId.toString().trim()

        if (id && partId) {
          videoLocal.setItem('lastWatchedStartAdInfo', {
            'id': id,
            'part_id': partId
          })
        }
      }
    },
    /**
     * 设置播放器音量
     */
    setVideoVolume () {
      const video0 = document.querySelector('.vjs-mandatory-advertisement__video0')
      const video1 = document.querySelector('.vjs-mandatory-advertisement__video1')

      video0.volume = this.volume
      video0.muted = this.muted
      video1.volume = this.volume
      video1.muted = this.muted
    }
  }
}
</script>

<style>
#vjs-mandatory-advertisement {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  /* opacity: 0.3; */
}

#vjs-mandatory-advertisement #vjs-mandatory-advertisement__controls {
  display: flex;
  justify-content: space-between;
  position: absolute;
  right: 0;
  top: 0;
  height: 36px;
  line-height: 36px;
  text-align: center;
  font-size: 14px;
}

#vjs-mandatory-advertisement #vjs-mandatory-advertisement__countdown-box {
  width: 136px;
  margin-right: 15px;
  background: rgba(0,0,0,0.6);
}

#vjs-mandatory-advertisement #vjs-mandatory-advertisement__countdown {
  color: #FF6329;
}

#vjs-mandatory-advertisement #vjs-mandatory-advertisement__muted {
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,0.6);
  font-size: 20px;
  cursor: pointer;
}

#vjs-mandatory-advertisement #vjs-mandatory-advertisement__muted::before {
  content: '\e87a';
}

#vjs-mandatory-advertisement #vjs-mandatory-advertisement__muted.muted::before {
  content: '\e614';
}

#vjs-mandatory-advertisement #vjs-mandatory-advertisement__close {
  width: 96px;
  margin-left: 15px;
  background: rgba(0,0,0,0.6);
  cursor: pointer;
}

#vjs-mandatory-advertisement #vjs-mandatory-advertisement__href {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

#vjs-mandatory-advertisement .vjs-mandatory-advertisement__video {
  display: block;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 1px;
  height: 1px;
  background: #000;
  opacity: 0.1;
}

#vjs-mandatory-advertisement .vjs-mandatory-advertisement__video.play {
  width: 100%;
  height: 100%;
  opacity: 1;
}
</style>
