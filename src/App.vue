<template>
  <div id="vjs-component-box" class="vjs-component-box">
    <player-header :visible="visibleControlBar && otherDisplayState" :title="options.title" :now="now"></player-header>

    <control-bar :visible="visibleControlBar" @on-move="showControlBar" :disabled="controlsDisabledState">
      <progress-bar :videoType="state.videoType" :videoRatio="videoRatio" :duration="state.duration" :bufferProgressRatio="bufferProgressRatio" :disabled="progressBarDisabledState" :options="options" @showControlBar="showControlBar" @changeCurrentTime="changeCurrentTime"></progress-bar>

      <play-button slot="left" :disabled="playButtonDisabledState" @on-click="changePlayState"></play-button>
      <next-part slot="left" :disabled="nextPartDisabledState" @on-click="nextPart(false)"></next-part>
      <jump-button slot="left" :options="options" :number="-5" :disabled="jumpButtonDisabledState" @on-click="changeCurrentTime"></jump-button>
      <jump-button slot="left" :options="options" :number="5" :disabled="jumpButtonDisabledState" @on-click="changeCurrentTime"></jump-button>
      <time-display slot="left" :videoType="state.videoType" :currentTime="state.currentTime" :duration="state.duration" :timeFormat="options.timeFormat"></time-display>
      <barrage-button slot="left" :visible="options.customControl.isBarrage" v-model="state.barrage" :disabled="barrageButtonDisabledState"></barrage-button>
      <barrage-input slot="left" ref="barrageInput" :visible="options.customControl.isBarrage && state.barrage" :options="options" :visibleBarrageColor.sync="state.visibleBarrageColor" :currentTime="state.currentTime" :disabled="barrageInputDisabledState" :fullscreenState="state.fullscreenState" :pageFullscreenState="state.pageFullscreenState" @addBarrage="exportAddBarrage"></barrage-input>

      <fullscreen-button slot="right" @on-click="toggleFullscreenState" :disabled="fullscreenButtonDisabledState"></fullscreen-button>
      <page-fullscreen-button slot="right" ref="pageFullscreenButton" :options="options" v-show="options.customControl.isPageFullscreen" :pageFullscreenState.sync="state.pageFullscreenState" :disabled="fullscreenButtonDisabledState"></page-fullscreen-button>
      <setting-button slot="right" :options="options" :userAgent="userAgent" :nextPart.sync="state.nextPart" :jumpOpEd.sync="state.jumpOpEd"></setting-button>
      <expansion-button slot="right" :expansion="options.expansion"></expansion-button>
      <screenshot slot="right" :visible="options.customControl.isScreenshot" :options="options" :dom="dom" :userAgent="userAgent" :disabled="screenshotButtonDisabledState"></screenshot>
      <volume-button slot="right" :options="options" :volume="state.volume" :muted="state.muted" :disabled="volumeButtonDisabledState" :userAgent="userAgent" @changeVolume="changeVolume"></volume-button>
      <quality-button slot="right" :disabled="speedButtonDisabledState" :userAgent="userAgent" :options="options"></quality-button>
      <speed-button slot="right" :options="options" :playbackRate.sync="state.playbackRate" :disabled="speedButtonDisabledState" :userAgent="userAgent"></speed-button>
    </control-bar>

    <pause-icon @play="play" v-show="otherDisplayState"></pause-icon>
    <cover-play-button v-show="bigPlayDisplayState" :options="options" :limit="options.limit" :userAgent="userAgent" @play="play"></cover-play-button>
    <loading-icon v-show="otherDisplayState"></loading-icon>
    <front-logo v-show="logoDisplayState" :options="options"></front-logo>
    <error-icon ref="error" :options="options" :player="player" :dom="dom" :userAgent="userAgent" :playState="state.playState" :currentTime="state.currentTime" :windowDisplayState="state.windowDisplayState" :isNextLine="state.isNextLine" :otherDisplayState="otherDisplayState" @nextLine="nextLine(false)" @updateVisibleError="newVal => state.visibleError = newVal"></error-icon>
    <volume-icon v-show="visibleVolumeIcon" :volume="state.volume"></volume-icon>
    <prompt-list ref="promptList"></prompt-list>
    <local-storage ref="localStorage" :options="options" :localStorageSettingName="localStorageSettingName" :userAgent="userAgent" :state="state" :currentTime="state.currentTime" :watchTime="state.watchTime" :duration="state.duration"></local-storage>
    <barrage ref="barrage" :visible="options.customControl.isBarrage" :initSuccessful="initSuccessful" :currentTime="state.currentTime" :onOff="state.barrage" :options="options" :playState="state.playState" :userAgent="userAgent" :otherDisplayState="otherDisplayState" :visibleBarrageColor="state.visibleBarrageColor" :startPrompt="state.startPrompt"></barrage>
    <jinri :preInitialLoadOtherPlugins="state.preInitialLoadOtherPlugins" :preInitialLoadOtherPluginsOrder="state.preInitialLoadOtherPluginsOrder" :initState="state.preInitialLoadOtherPlugins.jinri" @update:initState="updatePreInitialLoadOtherPlugins($event, 'jinri')" :displayState.sync="state.jinriDisplayState" :userAgent="userAgent" :coverState="coverState" :otherDisplayState="otherDisplayState" :options="options" :jinri="options.jinri" :coverAndProhibitPlay.sync="state.coverAndProhibitPlay" :currentTime="state.currentTime" @showControl="showControl" @hideControl="hideControl"></jinri>
    <qr-code ref="qrCode" :preInitialLoadOtherPlugins="state.preInitialLoadOtherPlugins" :preInitialLoadOtherPluginsOrder="state.preInitialLoadOtherPluginsOrder" :initState="state.preInitialLoadOtherPlugins.qrCode" @update:initState="updatePreInitialLoadOtherPlugins($event, 'qrCode')" :displayState.sync="state.qrCodeDisplayState" :userAgent="userAgent" :coverState="coverState" :options="options" :sharing="options.sharing" :wxSubscribe="options.wxSubscribe" :coverAndProhibitPlay.sync="state.coverAndProhibitPlay" :currentTime="state.currentTime" :country="options.country" @showControl="showControl" @hideControl="hideControl"></qr-code>
    <pause-advertising :initSuccessful="initSuccessful" :playState="state.playState" :playSuccessState="state.playSuccessState" :userAgent="userAgent" :advertising="options.advertising"></pause-advertising>
    <corner-advertisement ref="cornerAdvertisement" :initSuccessful="initSuccessful" :playSuccessState="state.playSuccessState" :userAgent="userAgent" :advertising="options.advertising" :duration="state.duration" :currentTime="state.currentTime"></corner-advertisement>
    <mandatory-advertisement ref="mandatoryAdvertisement" :dom="dom" :player="player" :preInitialLoadOtherPlugins="state.preInitialLoadOtherPlugins" :preInitialLoadOtherPluginsOrder="state.preInitialLoadOtherPluginsOrder" :initState="state.preInitialLoadOtherPlugins.mandatoryAd" @update:initState="updatePreInitialLoadOtherPlugins($event, 'mandatoryAd')" :options="options" :bigPlayDisplayState="bigPlayDisplayState" :mainWatchAdTime="state.watchAdTime" :timeUpdateState="state.timeUpdateState" :advertising="options.advertising" :mainPlayerLogoDisplayState="logoDisplayState" :displayState.sync="state.mandatoryAdvDisplayState" :userAgent="userAgent" :playState="state.playState" :coverState="coverState" :coverAndProhibitPlay.sync="state.coverAndProhibitPlay" :coverAndAllowPlay.sync="state.coverAndAllowPlay" :playSuccessState.sync="state.playSuccessState" :currentTime="state.currentTime" :videoType.sync="state.videoType" :startPrompt="state.startPrompt" :volume="state.volume" :muted="state.muted" :windowDisplayState="state.windowDisplayState" @play="play" @pause="pause" @resetVideoAttr="resetVideoAttr" @changeCurrentTime="changeCurrentTime" @preload="preload"></mandatory-advertisement>
    <gambling-fixed-advertising :nbaInfo="options.nbaInfo" :userAgent="userAgent" :playSuccessState="state.playSuccessState" :fullscreenState="state.fullscreenState" :playerStyleScale="style.playerStyleScale"></gambling-fixed-advertising>
    <collection v-if="options.collect && options.collect.displayState && otherDisplayState" :defaultCollect="options.collect.isCollect" :toggleCollect="options.toggleCollect"></collection>
    <picture-in-picture :visible="options.customControl.isPictureInPicture" :otherDisplayState="otherDisplayState" :dom="dom" :options="options" :visibleControlBar="visibleControlBar"></picture-in-picture>
    <download-app :options="options" :limit="options.limit" :userAgent="userAgent" :currentTime="state.currentTime" @pause="pause"></download-app>
    <cover :options="options" :player="player" :userAgent="userAgent" :state="state" @showControlBar="showControlBar" @changePlayState="changePlayState" @toggleFullscreenState="toggleFullscreenState" @toggleControlBar="toggleControlBar" @changeCurrentTime="changeCurrentTime" @changeVolume="changeVolume" @changeVolumeIconState="changeVolumeIconState"></cover>
    <guide-list :options="options" :otherDisplayState="otherDisplayState" :userAgent="userAgent" :fullscreenState="state.fullscreenState" :pageFullscreenState="state.pageFullscreenState"></guide-list>
    <no-action-notification ref="noActionNotification" :options="options" @nextPart="nextPart(false, true)"></no-action-notification>
  </div>
</template>

<script>
import Vue from 'vue'
import videoOptions from '@/config/video-options'

import PlayerHeader from 'components/page-header.vue'
import ControlBar from 'components/control-bar.vue'
import ProgressBar from 'components/progress-bar.vue'
import PlayButton from 'components/play-button.vue'
import NextPart from 'components/next-part.vue'
import JumpButton from 'components/jump-button.vue'
import TimeDisplay from 'components/time-display.vue'
import BarrageButton from 'components/barrage-button.vue'
import BarrageInput from 'components/barrage-input.vue'
import SpeedButton from 'components/speed-button.vue'
import qualityButton from 'components/quality-button.vue'
import VolumeButton from 'components/volume-button.vue'
import Screenshot from 'components/screenshot.vue'
import ExpansionButton from 'components/expansion-button.vue'
import SettingButton from 'components/setting-button.vue'
import PageFullscreenButton from 'components/page-fullscreen-button.vue'
import FullscreenButton from 'components/fullscreen-button.vue'
import PauseIcon from 'components/pause-icon.vue'
import CoverPlayButton from 'components/cover-play-button.vue'
import LoadingIcon from 'components/loading-icon.vue'
import FrontLogo from 'components/front-logo.vue'
import ErrorIcon from 'components/error-icon.vue'
import VolumeIcon from 'components/volume-icon.vue'
import PromptList from 'components/prompt-list.vue'
import LocalStorage from 'components/local-storage.vue'
import Barrage from 'components/barrage.vue'
import QrCode from 'components/qr-code.vue'
import PauseAdvertising from 'components/pause-advertising.vue'
import CornerAdvertisement from 'components/corner-advertisement.vue'
import GamblingFixedAdvertising from 'components/gambling-fixed-advertising.vue'
import MandatoryAdvertisement from 'components/mandatory-advertisement.vue'
import Collection from 'components/collection.vue'
import PictureInPicture from 'components/picture-in-picture.vue'
import DownloadApp from 'components/download-app.vue'
import Cover from 'components/cover.vue'
import guideList from 'components/guide-list.vue'
import noActionNotification from 'components/no-action-notification.vue'
import jinri from 'components/jinri.vue'

import { cloneDeep, isNaN, pick, isNull, isBoolean, isFunction, isNumber, isString, isObject } from 'lodash'
import { userAgent, advancedDebounce, closure, playTimeformat, debuglog, deepMerge } from 'utils'
import fullscreenApi from '@/utils/fullscreen-api.js'

export default {
  name: 'ComponentBox',

  components: {
    PlayerHeader,

    ControlBar,
    ProgressBar,

    PlayButton,
    NextPart,
    JumpButton,
    TimeDisplay,
    BarrageButton,
    BarrageInput,

    SpeedButton,
    qualityButton,
    VolumeButton,
    Screenshot,
    ExpansionButton,
    SettingButton,
    PageFullscreenButton,
    FullscreenButton,

    PauseIcon,
    CoverPlayButton,
    LoadingIcon,
    FrontLogo,
    ErrorIcon,
    VolumeIcon,
    PromptList,
    LocalStorage,
    Barrage,
    QrCode,
    PauseAdvertising,
    CornerAdvertisement,
    GamblingFixedAdvertising,
    MandatoryAdvertisement,
    Collection,
    PictureInPicture,
    DownloadApp,
    Cover,
    guideList,
    noActionNotification,
    jinri
  },

  props: {
    // 在main中注入
    // 配置信息
    options: {
      type: Object,
      required: true
    },
    // video 框架对象
    videojs: {
      type: Function,
      required: true
    },
    // 播放器实例
    player: {
      type: Object,
      required: true
    },
    // dom节点
    dom: {
      type: Object,
      required: true
    }
  },

  data () {
    // 如果值时 {} 时，需要注意reset时无法更新的问题
    return {
      // 日志开关
      devtools: true,
      // userAgent
      userAgent: userAgent,
      // 状态储存对象
      state: {
        // 当前版本
        currVersion: '11',
        // 如果没有进行 reset，那么 first 就为 true
        isFirst: true,
        // 当前视频是正常视频还是广告视频 (normal | advertising)
        videoType: 'normal',
        // 读取缓存状态
        getCachingState: false,
        // 初始化之前，所有会影响播放的组件的状态，只有在所有状态都完成时，才能进行初始化，请增加时注意
        // qr-code为0秒等这种需要在播放器之前就展示的东西。
        preInitialLoadOtherPlugins: {
          jinri: {
            start: false,
            end: false,
            firstTimeAfterReset: true,
            skipOtherOptions: false
          },
          // qr-code 组件内的二维码
          qrCode: {
            start: false,
            end: false,
            firstTimeAfterReset: true,
            skipOtherOptions: false
          },
          // mandatory-advertisement 组件内的片头广告
          mandatoryAd: {
            start: false,
            end: false,
            firstTimeAfterReset: true,
            skipOtherOptions: false
          }
        },
        preInitialLoadOtherPluginsOrder: ['jinri', 'qrCode', 'mandatoryAd'],
        // 是否播放成功，第一次播放成功后触发
        playSuccessState: false,
        // 开始时跳过的秒数（片头，历史纪录等）
        startJumpTime: 0,
        // 是否进行过交互
        // isInteractive: false,
        // 开始播放时，从低级秒开始播放，防止跳转到0秒时造成的卡顿。
        startTime: 0.1,
        // 当前播放时间
        currentTime: 0,
        // 影视正片观看时长
        lastWatchCurrentTime: 0,
        watchTime: 0,
        // 广告观看时长
        lastWatchAdCurrentTime: 0,
        watchAdTime: 0,
        // 总时间
        duration: 0,
        // 缓冲进度
        bufferProgress: 0,
        // 音量
        volume: 1,
        // 静音
        muted: false,
        // 倍速
        playbackRate: 1,
        // 遮盖并且禁止播放
        coverAndProhibitPlay: false,
        // 遮盖并且允许播放
        coverAndAllowPlay: false,
        // 是否自动播放下一级
        nextPart: true,
        // 是否自动跳过片头片尾
        jumpOpEd: true,
        // 弹幕开关
        barrage: true,
        // 弹幕颜色是否使用多色
        visibleBarrageColor: true,
        // 隐藏控制条的时间
        hideControlBarTime: 3000,
        // 单双击间隔时间
        clickIntervalTime: 200,
        // 片头提示
        startPrompt: true,
        // 片尾提示
        endPrompt: true,
        // 是否存在下一集
        isNextPart: false,
        // 是否存在下一条线路
        isNextLine: false,
        // 是否处于播放状态
        playState: false,
        // 是否处于全屏状态
        fullscreenState: false,
        // 是否处于网页全屏状态
        pageFullscreenState: false,
        // 是否显示控制条
        controlBarDisplayState: false,
        // 是否在操作时间
        timeUpdateState: false,
        // 是否显示安卓音量图标
        volumeIconState: false,
        // 是否在加载下一集
        loadNextPart: false,
        // 二维码显示状态
        qrCodeDisplayState: false,
        // 广告显示状态
        mandatoryAdvDisplayState: false,
        jinriDisplayState: false,
        // 当前窗口是否处于显示状态
        windowDisplayState: true,
        // 是否使用原声控件
        isUseNativeControls: false,
        // 是否显示error页面
        visibleError: false,
        // 是否加载到元数据
        hasLoadloadedmetadata: false,
        // 待提示列表，在合适的时刻，会把其中的内容添加到提示列表中
        pendingPromptList: [],
        // 用户有没有进行操作
        hasNoAction: true,
        // 无操作聚集总数
        noActionNumber: 0,
        // 无操作开始时间
        noActionStartTime: 0
      },
      // 切换剧集时储存修改前的state
      oldState: null,
      // 一些属性
      style: {
        // 默认制图大小
        defaultPlayerWidth: 1920,
        defaultPlayerHeight: 1080,
        // 播放器样式 缩放比例，在momentd处会得到更新
        playerStyleScale: 1,
        // other
        documentWidth: window.innerWidth
      },
      // 各种全局定时器
      timerState: {
        changeCurrentTime: null,
        setNowTimer: null
      },
      now: 0
    }
  },

  computed: {
    /**
     * 初始化成功 1
     * 1. 读取完缓存并且更新完state
     * 2. 创建插件
     */
    initAndCreatePlugins () {
      var preInitialLoadOtherPluginsState = true

      for (let key in this.state.preInitialLoadOtherPlugins) {
        if (!this.state.preInitialLoadOtherPlugins[key].start) preInitialLoadOtherPluginsState = false
      }

      return this.state.getCachingState && preInitialLoadOtherPluginsState
    },
    /**
     * 初始化成功 2
     * 1. 插件执行结束
     * 2. 成功播放
     */
    initSuccessful () {
      var preInitialLoadOtherPluginsState = true

      for (let key in this.state.preInitialLoadOtherPlugins) {
        if (!this.state.preInitialLoadOtherPlugins[key].start) preInitialLoadOtherPluginsState = false
        if (!this.state.preInitialLoadOtherPlugins[key].end) preInitialLoadOtherPluginsState = false
      }

      return this.initAndCreatePlugins && preInitialLoadOtherPluginsState
    },
    // 视频类型 (onDemand | live)
    videoStreamType () {
      return this.state.duration === Infinity ? 'live' : 'onDemand'
    },
    // 当前视频播放时长对比总时长的比例
    videoRatio () {
      let videoRatio = this.state.currentTime / this.state.duration

      if (isNaN(videoRatio)) videoRatio = 0

      return videoRatio
    },
    // 当前视频缓冲时长对比总时长的比例
    bufferProgressRatio () {
      let bufferProgressRatio = this.state.bufferProgress / this.state.duration

      if (isNaN(bufferProgressRatio)) bufferProgressRatio = 0

      return bufferProgressRatio
    },
    /**
     * 遮盖状态
     */
    coverState () {
      return !!(this.state.coverAndProhibitPlay || this.state.coverAndAllowPlay || this.state.jinriDisplayState)
    },
    /**
     * 显示大的播放按钮
     */
    bigPlayDisplayState () {
      return !this.state.playSuccessState && !this.state.playState && !this.state.visibleError
    },
    /**
     * logo 的显示状态
     */
    logoDisplayState () {
      let displayTime = 0.1

      return !this.bigPlayDisplayState && this.state.playState && (
        (this.state.videoType === 'normal' && this.state.watchTime < displayTime) || // 正片
        (this.state.videoType === 'advertising' && this.state.watchAdTime < displayTime) // 广告，因为广告在主播放器播放时，加载过程也需要主播放器的 logo 动画
      )
    },
    /**
     * 显示其他需要延迟展示的控件
     */
    otherDisplayState () {
      let displayTime = 0.1

      return !this.bigPlayDisplayState && !this.coverState && this.initSuccessful && this.state.watchTime > displayTime
    },
    // 控制栏是否可见
    visibleControlBar () {
      // 显示错误页面时，强制显示控制条
      if (this.state.visibleError) return true
      // 大播放按钮显示的时候，不显示控制条
      if (this.bigPlayDisplayState) return false
      // 显示视频广告，强制显示控制条
      if (this.state.mandatoryAdvDisplayState) return true
      // logo显示的时候，强制显示控制条
      if (this.logoDisplayState) return true
      // 暂停状态，强制显示控制条
      if (!this.state.playState) return true
      // 各种延时消失的状态，强制显示控制条
      if (this.state.controlBarDisplayState) return true

      return false
    },
    // 是否显示Android音量icon
    visibleVolumeIcon () {
      return this.userAgent.isMobi && this.userAgent.isAndroid && this.state.volumeIconState
    },

    // 各种禁用状态
    controlsDisabledState () {
      // return this.state.mandatoryAdvDisplayState && this.userAgent.isIpad;
      return false
    },
    progressBarDisabledState () {
      return this.state.mandatoryAdvDisplayState
    },
    playButtonDisabledState () {
      return this.state.mandatoryAdvDisplayState && this.state.playSuccessState
    },
    jumpButtonDisabledState () {
      return this.state.mandatoryAdvDisplayState
    },
    barrageButtonDisabledState () {
      return this.state.mandatoryAdvDisplayState
    },
    barrageInputDisabledState () {
      return this.state.mandatoryAdvDisplayState
    },
    nextPartDisabledState () {
      return this.state.isNextPart
    },
    screenshotButtonDisabledState () {
      return this.state.mandatoryAdvDisplayState
    },
    speedButtonDisabledState () {
      return this.state.mandatoryAdvDisplayState
    },
    volumeButtonDisabledState () {
      // return this.state.mandatoryAdvDisplayState;
      return false
    },
    fullscreenButtonDisabledState () {
      return this.userAgent.isMobi && this.state.mandatoryAdvDisplayState
    },
    // 本地储存所使用的名称，正常视频的设置和短视频的设置在不同的地方保存
    localStorageSettingName () {
      if (this.options.hasUseShortVideoSetting) return 'shortVideoSetting'

      return 'setting'
    }
  },

  watch: {
    /**
     * 监听读取缓存的状态
     */
    'state.getCachingState' (newVal) {
      if (newVal) {
        // 数据需要更新
        {
          // 当切换剧集时，就存在 oldState ，否则调用当前state
          const state = this.oldState || this.state

          // this.changeVolume({muted: false});
          this.changeVolume({ muted: state.muted })
          this.changeVolume({ volume: state.volume })
          this.changeSpeed(state.playbackRate)
        }

        if (this.options.initLocal) this.options.initLocal()

        // 判断历史记录是否需要跳转集数
        let historicalInfo = this.options.history
        let minPart = this.options.minPart ? this.options.minPart : 1

        if (
          this.state.startPrompt && // 允许执行片头操作
          this.options.playGenus === 10344 && // 是正片时才允许跳历史纪录
          historicalInfo.part_id && // 存在上次以观看id
          this.options.part_id !== historicalInfo.part_id && // 当前集数的id不等于历史记录的id
          this.options.part === minPart // 当前集数是第一集
        ) {
          this.$set(this.state, 'startPrompt', false)
          // eslint-disable-next-line
          this.changePart({ id: this.options.id, part_id: historicalInfo.part_id });
        }
      }
    },

    'state.preInitialLoadOtherPlugins': {
      handler (newVal) {
        debuglog.log('preInitialLoadOtherPlugins', JSON.stringify(newVal))
      },
      deep: true
    },

    initSuccessful (newVal) {
      if (newVal) {
        debuglog.log('initSuccessful')
        // this.$set(this.state, 'videoType', 'normal');
        this.preload()
        // this.play('initSuccessful');
      }
    },

    otherDisplayState (newVal) {
      if (newVal) {
        this.consumptionPendingPromptList()
      }
    },

    // 'state.watchTime' (newVal) {
    //   console.log('watchTime', newVal);
    // },

    // 'state.videoType' (newVal) {
    //   debuglog.log('videoType', newVal);
    // },

    /**
     * 监听是否被遮盖并且需要 播放 暂停
     */
    'state.coverAndProhibitPlay' (newVal) {
      debuglog.log(`coverAndProhibitPlay: ${newVal}`, this.initSuccessful)

      if (newVal) {
        this.pause('coverAndProhibitPlay')
      } else {
        this.play('coverAndProhibitPlay')
      }
    },

    'state.playSuccessState' (newVal) {
      debuglog.log('playSuccessState', newVal)
    },

    /**
     * 监听播放进度
     */
    'state.currentTime' (newVal) {
      // 当页面被遮挡并且需要暂停视频时，暂停视频
      if (this.state.coverAndProhibitPlay) this.pause('currentTime: coverAndProhibitPlay')

      if (this.state.videoType === 'normal') {
        this.calculateWatchTime(newVal)
        this.startJump({ time: newVal, position: 'currentTime' })
      } else if (this.state.videoType === 'advertising') {
        this.calculateWatchAdTime(newVal)
      }
    },

    'state.duration' (newVal) {
      debuglog.log('duration', newVal)
    },

    /**
     * 是否是暂停状态
     */
    'state.playState': {
      handler (newVal) {
        // 控制条隐藏时,鼠标跟着隐藏
        if (newVal) {
          this.dom.videoBox.classList.add('vjs-playing')
          this.dom.videoBox.classList.remove('vjs-paused')
        } else {
          this.dom.videoBox.classList.add('vjs-paused')
          this.dom.videoBox.classList.remove('vjs-playing')
        }

        debuglog.log('playState', newVal)
      },
      immediate: true
    },

    /**
     * 监听控制栏是否可见
     */
    visibleControlBar: {
      handler (newVal) {
        // 控制条隐藏时,鼠标跟着隐藏
        if (newVal) {
          this.dom.videoBox.classList.add('vjs-display-control')
        } else {
          this.dom.videoBox.classList.remove('vjs-display-control')
        }

        this.options.changeControlBarDisplayState && this.options.changeControlBarDisplayState(newVal)
      },
      immediate: true
    },

    /**
     * 监听是否被遮盖，如 广告位遮盖 关注公众号遮盖
     * 遮挡时暂停，否则则启用视频
     */
    coverState (newVal) {
      if (newVal) {
        if (this.state.isUseNativeControls) {
          this.hideDefaultControl()
          this.showControl()
        }
      } else {
        if (this.state.isUseNativeControls) {
          this.showDefaultControl()
          this.hideControl()
        }

        this.consumptionPendingPromptList()
      }
    },

    /**
     * 控制播放器倍速
     */
    'state.playbackRate' (newVal) {
      this.changeSpeed(newVal)
    },

    /**
     * 监听 nextPart 选项改变
     */
    'state.nextPart' (newVal) {
      if (this.options.onNextPartStateChange) this.options.onNextPartStateChange(newVal)
    }
  },

  created () {
    /**
     * hack 处理第一次点击的兼容性问题
     */
    // let hack = () => {
    //   this.$set(this.state, 'isInteractive', true)

    //   document.removeEventListener('click', hack)
    // }
    // document.addEventListener('click', hack)
  },

  mounted () {
    this.setNow()
    this.init()
    this.addWindowEventListener()
    this.addPlayerEventListener()
    this.addDomEventListener()

    // 函数执行完成，视频开始加载，调用ready回掉函数
    this.options.created && this.options.created()
  },

  beforeDestroy () {
    clearTimeout(this.timerState.changeCurrentTime)
    clearInterval(this.timerState.setNowTimer)
    this.removeWindowEventListener()
    this.removeDomEventListener()
  },

  methods: {
    /**
     * 初始化信息
     */
    init () {
      // 获取缓存
      this.getLocalAndSetLocal()

      // 判断是否使用原生控件
      if (
        (this.userAgent.isAndroid && (!this.userAgent.version || (this.userAgent.version && parseFloat(this.userAgent.version) <= 4.4))) ||
        this.userAgent.isWechat
        // || this.userAgent.isIos
      ) {
        this.$set(this.state, 'isUseNativeControls', true)
        this.hideControl()
        this.showDefaultControl()
      }

      // 为播放器盒子添加指定class
      document.querySelector(this.options.playerBox).classList.add('vjs-player-box')
      if (this.options.customControl.live) document.querySelector(this.options.playerBox).classList.add('vjs-live')

      // 设置判断是否存在下一集
      this.$set(this.state, 'isNextPart', this.nextPart(true))
      // 设置判断是否存在下一条线路
      this.$set(this.state, 'isNextLine', this.nextLine(true))

      if (this.state.isFirst && isNumber(this.options.defaultVolume)) this.$set(this.state, 'volume', this.options.defaultVolume)

      // 设置class
      const videoBoxClassList = this.dom.videoBox.classList

      // 用于区分默认播放器和扩展播放器
      videoBoxClassList.add('vjs-custom-player')
      if (this.userAgent.isPc) {
        videoBoxClassList.add('vjs-pc')

        if (this.userAgent.isIpad) {
          videoBoxClassList.add('vjs-ipad')
        }
      } else if (this.userAgent.isMobi) {
        videoBoxClassList.add('vjs-mobi')
      }

      // 其他自定义样式，如果影响元素过多，则可能在此处为box添加class
      if (this.options.customControl.controlBar === 'bottom') videoBoxClassList.add('vjs-control-bar-bottom')

      // 设置更新播放器样式缩放比例
      this.getScale()
    },
    /**
     * 含有export关键字代表会被外部调用
     */
    exportReset () {
      this.reset()
    },
    exportAddBarrage (...args) {
      this.$refs.barrage.addBarrage(...args)
    },
    exportPlay (position) {
      this.play(position || 'exportPlay')
    },
    exportPause (position) {
      this.pause(position || 'exportPause')
    },
    exportChangePlayState (status) {
      this.changePlayState(status)
    },
    exportChangeNextPartState (status) {
      this.changeNextPartState(status)
    },
    exportGetVisibleBarrageColor () {
      return this.state.visibleBarrageColor
    },
    exportSetVisibleBarrageColor (state) {
      this.$set(this.state, 'visibleBarrageColor', !!state)
    },
    exportSetBarrageColor (info) {
      this.$refs.barrageInput.selectColor(info)
    },
    exportSetBarrageContent (newVal) {
      this.$refs.barrageInput.setContent(newVal)
    },
    exportChangeVolume (...args) {
      this.changeVolume(...args)
    },
    /**
     * 重置
     * 在main中被调用
     */
    reset () {
      debuglog.log('reset')

      deepMerge(this.$data, this.$options.data(), {
        // 需要保留的状态
        state: {
          isFirst: false,
          playSuccessState: this.state.playSuccessState,
          // isInteractive: this.state.isInteractive,
          volume: this.state.volume,
          muted: this.state.muted,
          playbackRate: this.state.playbackRate,
          fullscreenState: this.state.fullscreenState,
          windowDisplayState: this.state.windowDisplayState,
          isUseNativeControls: this.state.isUseNativeControls,
          noActionNumber: this.state.hasNoAction && this.state.videoType === 'normal' ? this.state.noActionNumber + 1 : 0,
          noActionStartTime: this.state.noActionStartTime
        },
        oldState: cloneDeep(this.state)
      })

      // 为了确保更新正确，在这使用nextTick
      this.$nextTick(() => {
        // 需要刷新的内容
        this.$refs.localStorage.reset()
        this.$refs.barrage.reset()
        this.$refs.qrCode.reset()
        this.$refs.cornerAdvertisement.reset()
        this.$refs.mandatoryAdvertisement.reset()
        this.$refs.promptList.reset()
        this.$refs.error.reset()
        this.$refs.noActionNotification.reset()
        this.init()
        // this.addDomEventListener(); // 使用 player.reset() 的时候才需要启用，因为会重置一个video元素
      })
    },
    /**
     * 重置播放器一定的属性
     */
    resetVideoAttr () {
      deepMerge(this.$data.state, pick(this.$options.data().state, [
        'currentTime', 'duration', 'bufferProgress'
      ]))
    },
    /**
     * 获取本地缓存 更新state对象
     */
    getLocalAndSetLocal () {
      if (
        /preview/i.test(location.search) || // 当前剧集为预览页，就不读取缓存了
        !this.options.hasUseLocalSetting // 不使用本地的设置等
      ) return this.$set(this.state, 'getCachingState', true)

      // 缓存相关
      videoOptions.getItem(this.localStorageSettingName)
        .then((data) => {
          // 开始赋值
          const next = () => {
            // 把缓存赋值到this.state上
            let oldState = cloneDeep(this.state)

            this.$set(this, 'state', deepMerge(oldState, data))

            this.$set(this.state, 'getCachingState', true)
          }

          // 为空
          if (isNull(data)) {
            data = {}
            return next()
          } else {
            // 版本不同
            if (parseInt(data.cachedVersion) !== parseInt(this.state.currVersion)) {
              data = {}
              return this.deleteLocalSetting(next)
            }

            // 正常
            return next()
          }
        }).catch((err) => {
          debuglog.error(err)
          this.$set(this.state, 'getCachingState', true)
        })
    },
    /**
     * 删除本地缓存对象
     */
    deleteLocalSetting (cb) {
      videoOptions.removeItem(this.localStorageSettingName)
        .then(() => {
          cb && cb()
        })
        .catch(() => {
          cb && cb()
          alert('清除本地缓存失败，请刷新页面重试!')
        })
    },
    /**
     * 添加window事件
     */
    addWindowEventListener () {
      // 检测窗口是否隐藏
      // use the property name to generate the prefixed event name
      let visProp = this.getHiddenProp()
      if (visProp) {
        let evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange'

        this.state.windowDisplayState = this.getVisibilityState()

        document.addEventListener(evtname, this.setWindowDisplayState, false)
      }

      // 监听esc
      document.addEventListener(fullscreenApi['fullscreenchange'], this.handlerFullscreenChange, false)
    },
    /**
     * 移除window事件
     */
    removeWindowEventListener () {
      let visProp = this.getHiddenProp()
      if (visProp) {
        let evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange'
        document.removeEventListener(evtname, this.setWindowDisplayState, false)
      }

      document.removeEventListener(fullscreenApi['fullscreenchange'], this.handlerFullscreenChange, false)
    },
    /**
     * 添加player on事件
     */
    addPlayerEventListener () {
      // mp4 preload 会调用
      // m3u8 preload 会调用
      this.player.on('loadstart', () => {
        debuglog.log('loadstart ===')

        // 此处调用播放主要是为了自动播放 mp4
        if (this.state.isFirst) {
          if (this.options.autoplay) this.play('loadstart')
        } else {
          this.play('loadstart')
        }
      })

      // 媒体的第一帧已经加载完毕，可以调用 跳过片头，历史纪录。
      this.player.on('loadeddata', () => {
        debuglog.log('loadeddata ===')
        if (this.state.videoType === 'normal') this.startJump({ time: 0, position: 'loadeddata' })
      })

      // 媒体的元数据已经加载完毕，现在所有的属性包含了它们应有的有效信息。
      // mp4 preload 不会调用
      // m3u8 preload 会调用
      this.player.on('loadedmetadata', () => {
        debuglog.log('loadedmetadata ===')

        if (this.state.videoType === 'normal') this.$set(this.state, 'hasLoadloadedmetadata', true)

        if (this.state.isFirst) {
          if (this.options.autoplay) this.play('loadedmetadata')
        } else {
          this.play('loadedmetadata')
        }
      })

      this.player.on('progress', () => {
        let bufferProgress = this.player.buffered().end(this.player.buffered().length - 1)

        this.$set(this.state, 'bufferProgress', bufferProgress)
      })

      this.player.on('waiting', () => {
        this.$refs.error.waiting()
      })

      this.player.on('error', () => {
        if (this.state.videoType === 'normal') {
          this.$refs.error.error()
        }
      })

      this.player.on('play', () => {
        debuglog.log('on play')
        // 更新当前播放状态
        this.$set(this.state, 'playState', true)

        if (this.options.play) this.options.play()
      })

      this.player.on('pause', () => {
        debuglog.log('on pause')
        // 更新当前播放状态
        this.$set(this.state, 'playState', false)

        if (this.options.pause) this.options.pause()
      })

      this.player.on('timeupdate', () => {
        // 更新当前播放时间
        if (!this.state.timeUpdateState) {
          let curremtTime = this.player.currentTime()

          this.$set(this.state, 'currentTime', curremtTime)
          this.options.onChangeCurrentTime && this.options.onChangeCurrentTime(curremtTime)
        }

        // 更新总时间
        let duration = this.player.duration()
        if ((!isNaN(duration) || duration === Infinity) && this.state.currentTime > 0.2) {
          this.$set(this.state, 'duration', parseInt(duration))
        }
      })

      this.player.on('volumechange', () => {
        this.$set(this.state, 'volume', this.player.volume())
        this.$set(this.state, 'muted', this.player.muted())

        const volume = this.player.muted() ? 0 : this.player.volume()
        if (this.options.onVolumechange) this.options.onVolumechange(volume)
      })
    },
    /**
     * 添加dom事件
     * 点击暂停 划入显示控制条等请参考cover组件
     */
    addDomEventListener () {
      if (this.userAgent.isPc) {
        if (this.userAgent.isIpad) {

        } else {
          // pc 鼠标 键盘 事件
          // 键盘敲击事件
          document.addEventListener('keydown', this.handleDocumentKeyDown)

          // 播放器上的敲击事件
          this.dom.videoBox.addEventListener('keydown', this.handlePlayerKeyDown)
        }

        document.addEventListener('mousemove', this.handleDocumentMouseMove)
      } else if (this.userAgent.isMobi) {

      }
    },
    /**
     * 删除dom事件
     */
    removeDomEventListener () {
      if (this.userAgent.isPc) {
        if (this.userAgent.isIpad) {

        } else {
          // pc 鼠标 键盘 事件
          // 键盘敲击事件
          document.removeEventListener('keydown', this.handleDocumentKeyDown)

          // 播放器上的敲击事件
          this.dom.videoBox.removeEventListener('keydown', this.handlePlayerKeyDown)
        }

        document.removeEventListener('mousemove', this.handleDocumentMouseMove)
      } else if (this.userAgent.isMobi) {

      }
    },
    handleDocumentKeyDown (e) {
      // 当元素是可输入内容时，不执行操作。
      if (['input', 'textarea'].includes(e.target.nodeName.toLocaleLowerCase())) return

      let keyCode = e.keyCode
      let isPrevent = false

      this.showControlBar()

      let escapeEscape = [27]
      let playToggle = [13, 32]
      let start = [36]
      let end = [35]
      let fastForward = [39, 221]
      let backwards = [37, 219]

      if (escapeEscape.indexOf(keyCode) !== -1) {
        // 退出全屏
        this.exitFullscreen('keydowm')
        this.$refs.pageFullscreenButton.exitFullscreen()
        isPrevent = true
      } else if (playToggle.indexOf(keyCode) !== -1) {
        // 播放切换
        this.changePlayState()
        isPrevent = true
      } else if (start.indexOf(keyCode) !== -1) {
        // 最开始
        this.changeCurrentTime({ ratio: 0, position: 'keydown' })
        isPrevent = true
      } else if (end.indexOf(keyCode) !== -1) {
        // 最后
        this.changeCurrentTime({ ratio: 1, position: 'keydown' })
        isPrevent = true
      } else if (fastForward.indexOf(keyCode) !== -1) {
        // 快进
        // if (this.options.onForward) this.options.onForward()
        this.changeCurrentTime({ number: 5, position: 'keydown' })
        isPrevent = true
      } else if (backwards.indexOf(keyCode) !== -1) {
        // 后退
        // if (this.options.onBackward) this.options.onBackward()
        this.changeCurrentTime({ number: -5, position: 'keydown' })
        isPrevent = true
      }

      if (isPrevent) {
        e.preventDefault()
      }
    },
    handlePlayerKeyDown (e) {
      let increaseVolume = [38, 107]
      let reduceVolume = [40, 109]

      let keyCode = e.keyCode
      let isPrevent = false

      this.showControlBar()

      if (increaseVolume.indexOf(keyCode) !== -1) {
        // 音量增加
        const newVolume = this.player.volume() + 0.1
        this.changeVolume({ volume: newVolume })
        if (this.options.onChangeVolume) this.options.onChangeVolume(newVolume)
        isPrevent = true
      } else if (reduceVolume.indexOf(keyCode) !== -1) {
        // 音量减少
        const newVolume = this.player.volume() - 0.1
        this.changeVolume({ volume: newVolume })
        if (this.options.onChangeVolume) this.options.onChangeVolume(newVolume)
        isPrevent = true
      }

      if (isPrevent) {
        e.preventDefault()
      }
    },
    handleDocumentMouseMove: closure(function () {
      return advancedDebounce({
        lead: function () {
          this.$set(this.state, 'hasNoAction', false)
          this.$set(this.state, 'noActionNumber', 0)
          this.$set(this.state, 'noActionStartTime', new Date().getTime())
        },
        process: function () {
          this.$set(this.state, 'hasNoAction', false)
          this.$set(this.state, 'noActionNumber', 0)
          this.$set(this.state, 'noActionStartTime', new Date().getTime())
        },
        trail: function () {},
        maxWait: 3000,
        time: 3000
      })
    }),
    /**
     * 预加载
     */
    preload () {
      this.startJump({ time: 0, position: 'preload' })

      if (this.player.hlsjs) {
        this.player.hlsjs.startLoad(-1)
      }
    },
    /**
     * 播放
     * @param {String} position 用户表示在何处调用
     */
    play (position) {
      if (position) {
        debuglog.log(`%cplay: ${position}`, 'color: red;')
      } else {
        throw new Error(`play: position is a string!`)
      };

      // 已经处于播放状态
      if (!this.dom.video.paused) return

      // 播放按钮适用于广告播放，广告播放有两种情况，播放器内部播放广告 和 使用新的 video 播放广告，只有使用新的 video 播放广告时，才会触发下面的
      if (this.state.mandatoryAdvDisplayState) {
        // 点击大的播放按钮之后，8秒内没播成功，跳过广告
        if (position === 'cover-play-button') this.$refs.mandatoryAdvertisement.handleBigPlayClick()

        // 有广告挡在上面的话，先播放广告
        if (this.state.coverAndProhibitPlay) {
          return this.$refs.mandatoryAdvertisement.play(position)
        }
      }

      // 有东西在阻止播放
      if (this.state.coverAndProhibitPlay) return
      // 等待插件加载
      // for (let key in this.state.preInitialLoadOtherPlugins) {
      //   if (!this.state.preInitialLoadOtherPlugins[key].end) return;
      // }

      const compatible = () => {
        if (this.dom.video.paused) {
          this.$set(this.state, 'playState', false)
          // this.$set(this.state, 'playSuccessState', false);
        } else {
          this.$set(this.state, 'playState', true)
          this.$set(this.state, 'playSuccessState', true)
        }
      }

      const videoplay = this.dom.video.play()

      if (videoplay && videoplay.then) {
        // this.$set(this.state, 'playState', true);
        // this.$emit('update:playSuccessState', true);
        let isWhether = true

        videoplay
          .then(() => {
            isWhether = false
            this.$set(this.state, 'playState', true)
            this.$set(this.state, 'playSuccessState', true)
          })
          .catch((error) => {
            isWhether = false
            this.$set(this.state, 'playState', false)
            // this.$set(this.state, 'playSuccessState', false);
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
     * 暂停
     * @param {String} position 用户表示在何处调用
     */
    pause (position) {
      if (position) {
        debuglog.log(`%cpause: ${position}`, 'color: green;')
      } else {
        throw new Error(`pause: position is a string!`)
      };

      this.player.pause()
      this.$set(this.state, 'playState', false)
    },
    /**
     * 播放器的播放暂停 不传值就toggle切换
     * @param {Boolean} state 指定为播放 or 暂停
     */
    changePlayState (state) {
      if (isBoolean(state)) {
        if (state) {
          this.play('changePlayState')
        } else {
          this.pause('changePlayState')
        }
      } else {
        if (this.state.playState) {
          this.pause('changePlayState')
        } else {
          this.play('changePlayState')
        }
      }
    },
    // 全屏
    requestFullscreen () {
      this.dom.videoBox.classList.add('vjs-fullscreen')
      this.$set(this.state, 'fullscreenState', true)

      if (this.options.requestFullscreen) {
        this.options.requestFullscreen()
      } else {
        this.player.requestFullscreen()
        if (this.userAgent.isAndroid && window.screen.orientation && window.screen.orientation.lock) window.screen.orientation.lock('landscape')
      }

      if (this.options.onRequestFullscreen) this.options.onRequestFullscreen()
    },
    // 退出全屏
    exitFullscreen (position) {
      if (!this.state.fullscreenState) return

      this.dom.videoBox.classList.remove('vjs-fullscreen')
      this.$set(this.state, 'fullscreenState', false)

      if (this.options.exitFullscreen) {
        exitFullscreen(this.options.exitFullscreen())
      } else {
        // 如果是 exitFullscreen 是由 esc 触发的 fullscreenChange 触发的，那么我们的 video 就已经退出了全屏，这时不需要在执行一次退出全屏操作了
        if (position !== 'fullscreenChange') {
          this.player.exitFullscreen()
        }
      }

      if (this.options.onExitFullscreen) this.options.onExitFullscreen()

      function exitFullscreen (element) {
        if (document.exitFullScreen) {
          document.exitFullScreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (element.msExitFullscreen) {
          element.msExitFullscreen()
        }
      }
    },
    // 判断播放器当前是否处于全屏状态
    getIsFullScreen () {
      // this.player.isFullscreen() 更新会稍晚一步，所以我们直接检测有没有 全屏 DOM
      // var isFullScreen = isFunction(this.options.isFullscreen) ? this.options.isFullscreen() : this.player.isFullscreen()
      var isFullScreen = isFunction(this.options.isFullscreen) ? this.options.isFullscreen() : document[fullscreenApi['fullscreenElement']]

      return isFullScreen
    },
    // 播放器全屏 or 不全屏之间的切换
    toggleFullscreenState () {
      if (this.getIsFullScreen()) {
        this.exitFullscreen('toggleFullscreenState')
      } else {
        this.requestFullscreen()
      }
    },
    /**
     * 监听esc函数
     */
    handlerFullscreenChange () {
      // esc 会直接关闭全屏状态，这时我们需要手动触发一下 exitFullscreen，改变 store 的状态，和执行回调
      if (!this.getIsFullScreen()) {
        this.exitFullscreen('fullscreenChange')
      }
    },
    // 显示控制栏
    showControlBar: closure(function () {
      return advancedDebounce({
        lead: function () {
          this.$set(this.state, 'controlBarDisplayState', true)
        },
        process: function () {
          this.$set(this.state, 'controlBarDisplayState', true)
        },
        trail: function () {
          this.hideControlBar()
        },
        maxWait: 300,
        time: this.state.hideControlBarTime
      })
    }),
    // 隐藏控制栏
    hideControlBar () {
      this.$set(this.state, 'controlBarDisplayState', false)
    },
    // toggle控制栏
    toggleControlBar () {
      if (this.state.controlBarDisplayState) {
        this.hideControlBar()
      } else {
        this.showControlBar()
      }
    },
    /**
     * 改变播放器时间
     * @param {Number} ratio 输入一个比例 0-1，用来和duration相乘
     * @param {Number} time 输入一个时间，直接用来改变
     * @param {Number} number 输入一个数字，从当前时间来进行改变
     * @param {Boolean} hasChangeVideo 是否改变currentTime，如果选择不改变(拖动)，那么之后需要调用changetimeUpdateState解除状态
     */
    changeCurrentTime ({ ratio, time, number, hasChangeVideo = true, position }) {
      if (!isNumber(ratio) && !isNumber(time) && !isNumber(number)) throw new Error('ratio or time or num is not a number!')

      clearTimeout(this.timerState.changeCurrentTime)

      let currentTime = this.state.currentTime

      if (isNumber(time)) {
        currentTime = time
      } else if (isNumber(ratio)) {
        currentTime = ratio * this.state.duration
      } else if (isNumber(number)) {
        currentTime = this.state.currentTime + parseInt(number)
      }

      debuglog.log('001', position, currentTime)
      // 页面初始化时，duration为0，这时也允许修改currentTime
      if (this.state.duration !== 0) {
        if (currentTime < this.state.startTime) currentTime = this.state.startTime
        else if (currentTime > this.state.duration) currentTime = this.state.duration
        else if (isNaN(currentTime)) currentTime = this.player.currentTime()
      }

      this.changetimeUpdateState(true)
      this.$set(this.state, 'currentTime', currentTime)

      // 可选择只改变播放进度条 不改变播放时间，但是之后一定要把 timeUpdateState 设置为false，让时间可正常同步
      if (hasChangeVideo) {
        debuglog.log('002', currentTime)
        this.player.currentTime(currentTime)

        this.timerState.changeCurrentTime = setTimeout(() => {
          this.changetimeUpdateState(false)
        }, 50)
      }
    },
    /**
     * 是否允许 timeupdate 更新播放时间
     * 拖动进度条时，需要延迟更新播放事件，所以需要用到此状态
     * @param {Boolean} state 状态
     */
    changetimeUpdateState (state) {
      this.$set(this.state, 'timeUpdateState', state)
    },
    /**
     * 改变音量 二选一进行传递
     * @param {Number} volume 音量
     * @param {Boolean, String} muted 是否静音 'toggle'切换
     */
    changeVolume ({ volume, muted }) {
      if (isNumber(volume)) {
        if (volume < 0) volume = 0
        else if (volume > 1) volume = 1
        else if (isNaN(volume)) volume = this.player.volume()

        this.player.volume(volume)
      } else if (isBoolean(muted) || isString(muted)) {
        // 当音量值为0时，点击静音按钮
        if (!!muted && this.state.volume <= 0.03) return this.changeVolume({ volume: 1 })

        // 布尔值时，直接切换
        if (isBoolean(muted)) this.player.muted(muted)

        // toggle时，反向切换
        if (muted === 'toggle') this.player.muted(!this.player.muted())
      } else {
        throw new Error('volume and muted is not defind!')
      }
    },
    /**
     * 控制播放器倍速
     * @param {Number} speed n倍速
     */
    changeSpeed (speed) {
      if (speed < 0.5 || speed > 5) speed = 1

      this.player.playbackRate(speed)
      this.dom.video.playbackRate = speed
    },
    /**
     * 判断是否需要跳转时间，片头片尾，历史纪录等
     */
    startJump ({ time, position }) {
      debuglog.log('entry startJump', position)

      // 缓存未读取成功
      if (!this.state.getCachingState) return

      // 需要初始化成功，读取完缓存
      // if (!this.initSuccessful) return;

      // 不能被遮挡
      // if (this.coverState) return;

      // 当前属于正片
      if (this.state.videoType !== 'normal') return

      // 需要加载到元数据
      if (!this.state.hasLoadloadedmetadata) return

      let prologue = parseInt(this.options.prologue)
      let epilogue = parseInt(this.options.epilogue)

      /**
       * 判断是否要跳转到历史纪录的时间
       * 只有存在总时间时，才可进行跳转
       * 和跳转集数分开
       */
      if (this.state.startPrompt) {
        debuglog.log('startPrompt')
        this.$set(this.state, 'startPrompt', false)

        this.options.first && this.options.oneMounted && this.options.oneMounted()
        this.options.mounted && this.options.mounted()
        let historicalInfo = this.options.history
        let startJumpTime

        // 从搜索页选集进入
        if (
          historicalInfo && // 存在本地缓存
          historicalInfo.part_id &&
          historicalInfo.part && // 缓存存在集数
          this.options.part_id !== historicalInfo.part_id // 当前集数的id不等于历史记录的id
        ) {
          var prompt = Vue.extend({
            props: {
              part: {
                type: String,
                required: true
              },
              time: {
                type: String,
                required: true
              },
              changePart: {
                type: Function,
                required: true
              }
            },
            template: `
              <div>
                历史记录，您已观看至第{{part}}集
                <span style="color: #ff6e0b; cursor: pointer;" @click="changePart">{{time}}, 跳转播放</span>
              </div>
            `
          })

          this.addPendingPromptList({
            component: prompt,
            props: {
              part: String(historicalInfo.part),
              time: String(playTimeformat(historicalInfo.sec)),
              changePart: () => {
                this.changePart({
                  id: this.options.id,
                  // eslint-disable-next-line
                  part_id: historicalInfo.part_id,
                })
              }
            },
            time: 10
          })
        }

        // 当前集数等于历史集数
        if (
          historicalInfo && // 存在本地缓存
          historicalInfo.part_id &&
          historicalInfo.part && // 缓存存在集数
          this.options.part_id === historicalInfo.part_id && // 当前集数等于历史观看集数
          historicalInfo.sec > 2 // 历史秒数要大于两秒，不然当作跳过片头处理
        ) {
          startJumpTime = historicalInfo.sec

          this.addPendingPromptList({
            text: `您上次观看至第${parseInt(historicalInfo.part)}集<span style="color: #ff6e0b">${playTimeformat(historicalInfo.sec)}</span>处，为您自动续播...`,
            time: 5
          })
        } else if (this.state.jumpOpEd && prologue) {
          startJumpTime = prologue

          if (this.options.customControl.live) {
            // 放映厅需要跳转到指定秒数，但是不需要片头提示
          } else {
            this.addPendingPromptList({
              text: '已为您跳过片头',
              time: 5
            })
          }
        }

        // 从头开始播放时，默认需要跳转到0.1秒，防止出现画面卡住的情况
        startJumpTime = startJumpTime || 0.1

        debuglog.log('000', startJumpTime)

        this.changeCurrentTime({ time: startJumpTime, position: 'startJump' })
      }

      // 只有点播需要跳过片尾
      if (this.videoStreamType !== 'onDemand') return

      // 要能获取到总时间
      if (this.state.duration === 0) return

      // 跳过片尾提示
      const endTime = epilogue > 0 ? epilogue : this.state.duration + epilogue

      if (time < endTime - 10) {
        if (!this.state.endPrompt) this.$set(this.state, 'endPrompt', true)
      } else if (time > endTime - 10) {
        if (this.state.jumpOpEd && epilogue && this.state.duration !== 0) {
          debuglog.log('endPrompt')

          // 弹出提示
          if (this.state.endPrompt) {
            this.$set(this.state, 'endPrompt', false)

            if (this.options.customControl.live) {
              //
            } else {
              if (this.state.isNextPart && this.state.nextPart) {
                this.$vjsPrompt.add({
                  text: '即将为您跳过片尾播放下一集',
                  time: 10
                })
              } else {
                this.$vjsPrompt.add({
                  text: '即将为您跳过片尾',
                  time: 10
                })
              }
            }
          }

          // 播放到ed部分，判断下是否存在下一集，如果存在下一集，则跳转到下一集，不存在则调到最后
          if (!this.state.loadNextPart && time > endTime) {
            if (this.state.isNextPart && this.state.nextPart) {
              this.nextPart(false)
            } else {
              this.changeCurrentTime({ time: this.state.duration, position: 'ed' })
              this.pause('end')
              this.ended()
            }
          }
        } else if (this.state.isNextPart && this.state.nextPart) {
          // 播放结束时
          debuglog.log('endPrompt')

          // 弹出提示
          if (this.state.endPrompt) {
            this.$set(this.state, 'endPrompt', false)

            if (this.options.customControl.live) {
              //
            } else {
              this.$vjsPrompt.add({
                text: '即将为您自动播放下一集',
                time: 10
              })
            }
          }

          if (!this.state.loadNextPart && time > this.state.duration - 1) {
            this.nextPart(false)
          }
        }
      }
    },
    /**
     * 计算正常影视观看时长
     * @param {Number} currentTime 当前播放的秒数
     */
    calculateWatchTime (currentTime) {
      if (this.state.videoType !== 'normal') return

      let diff = currentTime - this.state.lastWatchCurrentTime

      // 差值必须在合理范围内
      if (diff > 0 && diff < 2) {
        this.$set(this.state, 'watchTime', this.state.watchTime + diff)
      }
      this.$set(this.state, 'lastWatchCurrentTime', currentTime)
    },
    /**
     * 计算广告观看时长
     * @param {Number} currentTime 当前播放的秒数
     */
    calculateWatchAdTime (currentTime) {
      if (this.state.videoType !== 'advertising') return

      let diff = currentTime - this.state.lastWatchAdCurrentTime

      // 差值必须在合理范围内
      if (diff > 0 && diff < 2) {
        this.$set(this.state, 'watchAdTime', this.state.watchAdTime + diff)
      }
      this.$set(this.state, 'lastWatchAdCurrentTime', currentTime)
    },
    /**
     * 拆分字符串的PlayVideo
     */
    splitPlayVideo: function (str) {
      let startIndex = str.indexOf('(')
      let endIndex = str.lastIndexOf(')')
      str = str.substring(startIndex + 1, endIndex)
      let id = str.match(/\d+/g)

      return {
        id: id[0],
        'part_id': id[1]
      }
    },
    /**
     * 改变是否切换到下一集的状态
     */
    changeNextPartState (status) {
      this.$set(this.state, 'nextPart', !!status)
    },
    /**
     * 下一集，调用此函数时将切换到下一集
     * @param {Boolean} isExist 如果传入true，那么返回下一集是否存在
     */
    nextPart (isExist, isMust) {
      if (isExist && isBoolean(this.options.hasNextPart)) return this.options.hasNextPart
      if (isExist && isFunction(this.options.hasNextPart)) return this.options.hasNextPart()
      if (!isExist && isFunction(this.options.nextPart)) {
        // 两集内没有操作 并且 无操作时长大于 120 分钟，弹出提示信息，而不进行下一集
        if (
          this.options.customControl.isOpenNoActionNotification &&
          !isMust &&
          this.state.noActionNumber >= 1 &&
          this.state.noActionStartTime !== 0 &&
          new Date().getTime() - this.state.noActionStartTime > 7200000
        ) {
          this.pause('nextPart')
          this.$refs.noActionNotification.show()
        } else {
          this.$set(this.state, 'loadNextPart', true)
          return this.options.nextPart()
        }
      }

      return false
    },
    /**
     * 跳转到指定集数
     * 通过id等信息寻找页面上的按钮，进行跳转
     */
    // eslint-disable-next-line
    changePart ({id, part_id}) {
      if (this.options.setKeepHistory) this.options.setKeepHistory({ keepHistory: true })
      // eslint-disable-next-line
      if (isFunction(this.options.changePart)) return this.options.changePart({ id, part_id });
    },
    /**
     * 下一条线路，调用此函数时将切换到吓一跳线路
     * @param {Boolean} isExist 如果传入true，那么返回下一集是否存在
     */
    nextLine (isExist) {
      if (isExist && isBoolean(this.options.hasNextLine)) return this.options.hasNextLine
      if (isExist && isFunction(this.options.hasNextLine)) return this.options.hasNextLine()
      if (!isExist && isFunction(this.options.nextLine)) return this.options.nextLine()

      return false
    },
    /**
     * 显示video元素
     */
    showVideo () {
      this.dom.video.classList.remove('vjs-display-none')
    },
    /**
     * 隐藏video元素
     */
    hideVideo () {
      this.dom.video.classList.add('vjs-display-none')
    },
    /**
     * 显示video元素
     */
    showDefaultControl () {
      this.dom.video.controls = true
    },
    /**
     * 隐藏video元素
     */
    hideDefaultControl () {
      this.dom.video.controls = false
    },
    /**
     * 显示自定义控件
     */
    showControl () {
      this.dom.videoBox.classList.remove('hideControl')
    },
    /**
     * 隐藏自定义控件
     */
    hideControl () {
      this.dom.videoBox.classList.add('hideControl')
    },
    /**
     * 获取浏览器窗口hidden属性
     */
    getHiddenProp () {
      let prefixes = ['webkit', 'moz', 'ms', 'o']

      // if 'hidden' is natively supported just return it
      if ('hidden' in document) return 'hidden'

      // otherwise loop over all the known prefixes until we find one
      for (let i = 0; i < prefixes.length; i++) {
        if (prefixes[i] + 'Hidden' in document) { return prefixes[i] + 'Hidden' }
      }

      // otherwise it's not supported
      return null
    },
    /**
     * 获取当前窗口是否被隐藏
     */
    getVisibilityState () {
      let prefixes = ['webkit', 'moz', 'ms', 'o']
      let name = ''

      if ('visibilityState' in document) {
        name = 'visibilityState'
      } else {
        for (let i = 0; i < prefixes.length; i++) {
          if (prefixes[i] + 'VisibilityState' in document) {
            name = prefixes[i] + 'VisibilityState'
            break
          }
        }
      }

      // 如果获取不到信息，那么默认为显示状态
      if (!name) return true
      return document[name] === 'visible'
    },
    /**
     * 通过窗口大小获取播放器缩放比例
     */
    getScale () {
      this.$set(this.style, 'playerStyleScale', Number((this.style.documentWidth / this.style.defaultPlayerWidth).toFixed(2)))
    },
    /**
     * 更新 preInitialLoadOtherPlugins 属性
     */
    updatePreInitialLoadOtherPlugins (info, objName) {
      debuglog.log('updateInitState', info)

      if (!isObject(info)) throw new Error('updatePreInitialLoadOtherPlugins: info is not a Object!')

      // 跳过其他选项，如 关注公众号之后不需要贴片广告 这种情况
      if (info.skipOtherOptions) {
        for (let key in this.state.preInitialLoadOtherPlugins) {
          this.$set(this.state.preInitialLoadOtherPlugins[key], 'start', true)
          this.$set(this.state.preInitialLoadOtherPlugins[key], 'end', true)
        }
      } else {
        for (let key in info) {
          this.$set(this.state.preInitialLoadOtherPlugins[objName], key, info[key])
        }
      }
    },
    /**
     * 没有下一集或者不自动播放下一集，并且播放结束
     */
    ended () {
      console.log('ended')
    },
    /**
     * 获取当前时间戳
     */
    getNow () {
      return new Date().getTime()
    },
    /**
     * 设置当前时间戳
     */
    setNow () {
      clearInterval(this.timerState.setNowTimer)
      this.timerState.setNowTimer = setInterval(() => {
        this.$set(this, 'now', this.getNow())
      }, 1000)
    },
    /**
     * 改变音量icon显示状态
     */
    changeVolumeIconState (status) {
      this.$set(this.state, 'volumeIconState', status)
    },
    /**
     * 设置 windowDisplayState 状态
     */
    setWindowDisplayState () {
      this.state.windowDisplayState = this.getVisibilityState()
    },
    /**
     * 添加到 待提示列表
     */
    addPendingPromptList (prompt) {
      if (this.initSuccessful && this.otherDisplayState && !this.coverState) {
        this.$vjsPrompt.add(prompt)
      } else {
        this.state.pendingPromptList.push(prompt)
      }
    },
    /**
     * 消费 待提示列表 中的数据
     */
    consumptionPendingPromptList () {
      this.state.pendingPromptList.forEach((currentPrompt) => {
        this.$vjsPrompt.add(currentPrompt)
      })

      this.$set(this.state, 'pendingPromptList', [])
    }
  }
}
</script>

<style>
  .vjs-display-none {
    display: none !important;
  }

  .vjs-player-box.vjs-page-fullscreen, .vjs-player-box.vjs-qrCode-page-fullscreen, .vjs-player-box.vjs-jinri-page-fullscreen {
    position: fixed !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    z-index: 1000 !important;
    width: 100% !important;
    height: 100% !important;
    padding-bottom: 0 !important;
    box-shadow: none;
  }

  video::-webkit-media-controls-fullscreen-button {
    display: inline-block !important;
  }

  /* .video-js 为了覆盖video默认样式 */
  /* ie 浏览器，样式优先级有问题 .video-js 不能去除 */
  .video-js.vjs-custom-player {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    outline: none;
    min-width: 100%;
    min-height: 215px;
    font-size: 12px;
    color: #fff;
    background: #000;
    font-family: PingFangSC-Regular,Helvetica Neue,Helvetica,Roboto,Microsoft Yahei,Arial,sans-serif;
    overflow: hidden;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .vjs-custom-player > * {
    display: none !important;
  }

  .vjs-custom-player .vjs-iconfont {
    font-size: 18px;
  }

  .vjs-custom-player.vjs-display-control, .vjs-custom-player.vjs-play-error {
    cursor: default;
  }

  .vjs-custom-player > video {
    display: block !important;
  }

  .vjs-custom-player > video.vjs-display-none {
    display: none !important;
  }

  .vjs-custom-player.vjs-fullscreen {
    position: fixed;
    overflow: hidden;
    z-index: 1000;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0
  }

  .vjs-player-box:not(.vjs-page-fullscreen) .vjs-custom-player.vjs-control-bar-bottom:not(.vjs-fullscreen) #video_html5_api {
    padding-bottom: 54px; /* controlBar 高度 */
  }

  #vjs-component-box {
    display: block !important;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .vjs-player-box:not(.vjs-page-fullscreen) .vjs-custom-player.vjs-control-bar-bottom:not(.vjs-fullscreen) #vjs-component-box {
    height: calc(100% - 54px); /* controlBar 高度 */
  }

  #vjs-component-box * {
    outline:none;
  }

  .vjs-custom-player .vjs-disabled {
    opacity: .5;
    cursor: default;
    pointer-events: none;
  }

  .vjs-custom-player.hideControl #vjs-component-box {
    display: none !important;
  }
</style>
