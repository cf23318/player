import 'babel-polyfill'
import 'promise-polyfill/src/polyfill'
import Vue from 'vue'

import { isString, isRegExp, isArray, isNumber, defaultsDeep } from 'lodash'
import '@/config/jquery'
import '@/config/axios'
import '@/config/date'
import '@/config/animation'

import '@/utils/directives.js'

// eslint-disable-next-line
import videojs from 'expose-loader?videojs!../node_modules/video.js/dist/video.js'
import '../node_modules/video.js/dist/video-js.css'
// import '../node_modules/videojs-contrib-hls/dist/videojs-contrib-hls.js';
import Hlsjs from 'hls.js'
import '@streamroot/videojs-hlsjs-plugin'
import UAParser from 'ua-parser-js'
import './assets/css/global.css'
import './assets/css/video.css'
import { userAgent, playTimeformat, getVideoType, deepMerge, hasUseMainPlayFn } from '@/utils/utils.js'
import App from './App'

import videoBackdarkImg from './assets/img/video_backdark.jpg'

Vue.config.productionTip = false
// Vue.config.devtools = true;

// Hlsjs 所需
if (videojs.Html5Hlsjs) {
  videojs.Html5Hlsjs.addHook('beforeinitialize', function (videojsPlayer, hlsjs) {
    videojsPlayer.hlsjs = hlsjs

    hlsjs.on(Hlsjs.Events.ERROR, function (event, data) {
      if (data.details === Hlsjs.ErrorDetails.INTERNAL_EXCEPTION) {
        console.error('exception in ' + data.event + ',stack trace:' + JSON.stringify(data.err.stack))
      }

      // if (data.fatal) {
      //   switch (data.type) {
      //     case Hlsjs.ErrorTypes.NETWORK_ERROR:
      //       // try to recover network error
      //       console.log('fatal network error encountered, try to recover')
      //       hlsjs.startLoad()
      //       break
      //     case Hlsjs.ErrorTypes.MEDIA_ERROR:
      //       console.log('fatal media error encountered, try to recover')
      //       hlsjs.recoverMediaError()
      //       break
      //     default:
      //       // cannot recover
      //       hlsjs.destroy()
      //       break
      //   }
      // }
    })
  })
}

const exportObject = {
  initPlayer: () => {},
  destroy: () => {},
  addBarrage: () => {},
  play: () => {},
  pause: () => {},
  changePlayState: () => {},
  changeNextPartState: () => {},
  exportGetVisibleBarrageColor: () => {},
  exportSetVisibleBarrageColor: () => {},
  exportSetBarrageColor: () => {},
  exportSetBarrageContent: () => {},
  exportChangeVolume: () => {},
  player: null
}
let vjsPlayer = null
let vjsVue = null
let vjsReset = null

// 通过 video.js 组件的方式插入我们自己设计的控件
var Component = videojs.getComponent('Component')
var vueComponent = videojs.extend(Component, {
  constructor: function (player, { exportObject, options }) {
    Component.apply(this, arguments)
    this.init({ player, exportObject, options })
  },

  createEl: function () {
    return videojs.dom.createEl('div', {
      className: 'vjs-component-box'
    })
  },

  init: function ({ player, exportObject, options }) {
    var div = document.createElement('div')
    div.id = div.className = 'vjs-componentBox'
    player.el().appendChild(div)

    /* eslint-disable no-new */
    vjsVue = new Vue({
      el: '#vjs-componentBox',
      data () {
        return {
          options
        }
      },
      mounted () {
        // 为解决 this问题
        vjsReset = ({ options }) => {
          this.$set(this, 'options', options)
          return App.methods.exportReset.call(this.$children[0])
        }
        exportObject.addBarrage = (...args) => {
          return App.methods.exportAddBarrage.call(this.$children[0], ...args)
        }
        exportObject.play = (position) => {
          return App.methods.exportPlay.call(this.$children[0], position)
        }
        exportObject.pause = (position) => {
          return App.methods.exportPause.call(this.$children[0], position)
        }
        exportObject.changePlayState = (status) => {
          return App.methods.exportChangePlayState.call(this.$children[0], status)
        }
        exportObject.changeNextPartState = (status) => {
          return App.methods.exportChangeNextPartState.call(this.$children[0], status)
        }
        exportObject.exportGetVisibleBarrageColor = (status) => {
          return App.methods.exportGetVisibleBarrageColor.call(this.$children[0], status)
        }
        exportObject.exportSetVisibleBarrageColor = (status) => {
          return App.methods.exportSetVisibleBarrageColor.call(this.$children[0], status)
        }
        exportObject.exportSetBarrageColor = (info) => {
          return App.methods.exportSetBarrageColor.call(this.$children[0], info)
        }
        exportObject.exportSetBarrageContent = (info) => {
          return App.methods.exportSetBarrageContent.call(this.$children[0], info)
        }
        exportObject.exportChangeVolume = (...args) => {
          return App.methods.exportChangeVolume.call(this.$children[0], ...args)
        }
      },
      render (h) {
        return h(App, {
          props: {
            options: this.options,
            videojs,
            player: vjsPlayer,
            dom: {
              videoBox: vjsPlayer.el(),
              video: vjsPlayer.el().children[0]
            }
          }
        })
      }
    })
  }
})

// Register the component with Video.js, so it can be used in players.
videojs.registerComponent('vueComponent', vueComponent)

// 销毁播放器
export const destroy = exportObject.destroy = () => {
  if (vjsPlayer) {
    // 销毁内容时，需要先销毁掉自定义播放器
    vjsPlayer.dispose()
    // 销毁vue实例
    if (vjsVue) vjsVue.$destroy()

    // exportObject.initPlayer = () => {};
    // exportObject.destroy = () => {};
    exportObject.addBarrage = () => {}
    exportObject.play = () => {}
    exportObject.pause = () => {}
    exportObject.changePlayState = () => {}
    exportObject.changeNextPartState = () => {}
    exportObject.exportGetVisibleBarrageColor = () => {}
    exportObject.exportSetVisibleBarrageColor = () => {}
    exportObject.exportSetBarrageColor = () => {}
    exportObject.exportSetBarrageContent = () => {}
    exportObject.exportChangeVolume = () => {}
    exportObject.player = null

    vjsPlayer = null
    vjsVue = null
    vjsReset = null
  }
}

// 检验当前userAgent
function testUserAgent (array, cb) {
  array.forEach(function (currUserAgent) {
    var userAgentInfo = window.navigator.userAgent

    if (isString(currUserAgent)) {
      if (userAgentInfo.indexOf(currUserAgent) !== -1) {
        cb && cb()
      }
    } else if (isRegExp(currUserAgent)) {
      if (currUserAgent.test(userAgentInfo)) {
        cb && cb()
      }
    }
  })
}

// 合并默认 options 到 options
function mergeOptions (options) {
  // 合并默认选项
  defaultsDeep(options, {
    // 保留类，不应被改写
    first: true, // @param {Boolean} 不应被改写 用来判断是否是第一次进入页面
    keepHistory: false, // @param {Boolean} 不应被改写 是否保留 options 的历史纪录字段。

    // ajax参数类
    // 'SBID': undefined, // @param {String} ajax 需要的字段
    // 'token': undefined, // @param {String} ajax 需要的字段

    // 选择播放器
    playerForm: 'pc', // @param {String} 采取哪种格式的播放器 'pc' 'mobi'
    playerType: undefined, // @param {String} 指定播放器类型，不指定时，自动识别。 'extVjs' 'vjs' 'default'
    nativePlayer: [ // @param {Array} 是否使用原生播放器
      // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
    ],
    defaultVjsPlayer: [ // @param {Array} 是否使用video.js默认播放器
      // 'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36',
    ],
    hasUseLocalSetting: true, // @param {Boolean} 是否使用本地设置，比如音量，弹幕开关等
    hasUseShortVideoSetting: false, // @param {Boolean} 是否使用短视频的本地设置，和正常影视分开

    // 自定义控件
    customControl: { // 自定义控件
      live: false, // 是否显示为直播的样式，现用于放映厅模式
      /**
       * 定义controlbar的样式
       * @param {String} [controlBar = 'default']
       * default 可以隐藏控制栏
       * bottom 未全屏时不可隐藏控制栏，并且控制栏在播放器下方
       */
      controlBar: 'default',
      isScreenshot: false, // @param {Boolean} 是否展示 Screenshot 组件
      isPageFullscreen: false, // @param {Boolean} 是否展示 PageFullscreen 组件
      isBarrage: false, // @param {Boolean} 是否展示 barrage 相关组件
      isBarrageInputInNormalWindow: false, // @param {Boolean} 在非全屏模式 上是否展示 barrage 输入框
      isBarrageInputInFullscreen: false, // @param {Boolean} 在全屏模式包括网页全屏 上是否展示 barrage 输入框
      isBarrageDisabledFeatures: false, // @param {Boolean} 是否禁用 barrage 组件功能，如点赞 举报等
      isPictureInPicture: false, // @param {Boolean} 是否展示 画中画 相关组件
      isOpenNoActionNotification: false, // @param {Boolean} 是否开启 两集内无操作 后的检测提示
      isMandatoryAdvertisementHiddenPause: false // @param {Boolean} 页面为隐藏状态时，是否暂停广告
    },

    playerBox: '', // @param {String} 播放器的盒子id名 - '#mtg-videoplay-player'
    playUrl: '', // @param {String} 播放链接地址 - 'http://bny.inkingpool.com/west/tv/4929/4929-2/play.m3u8?md5=abXMno2rsCNs4qNTeD4u2Q&expires=1540902272&token=4929'
    playType: '', // @param {String} 播放类型 - 'm3u8' 'mp4'
    defaultVolume: 1, // @param {Number} 默认音量，会覆盖从本地读取等音量，一般用于 hasUseLocalSetting 为 false 的情况
    autoplay: true, // @param {Boolean} 是否自动播放
    // 'seo': '', // @param {String} 后台关键字 'series'
    id: '', // @param {String|Number} 影视id '301806544865001'
    part_id: '', // @param {String|Number} 影视id '101806544865002'
    playGenus: undefined, // @param {Number} 10344 正片 10345 花絮 10346 MV 10340 预告
    title: '', // @param {String} 标题，在 header 中展示
    part: undefined, // @param {Number} 2 当前集数，用来处理历史记录
    minPart: 1, // @param {Number} 1 最小集数，用来和part比对判断是否是最小集数
    prologue: 0, // @param {Number} 10 跳过片头多少秒
    epilogue: 0, // @param {Number} -10 跳过片尾多少秒
    timeFormat: undefined, // @param {String} 左下角 视频当前时长所采用的格式 hh:mm:ss
    logo: '', // @param {String} logo
    defaultLogo: '', // @param {String} logo 出错时的备用 logo
    previewPicPath: '', // @param {String} 进图条上的预览图
    country: { // 国家
      code: '', // @param {String} 国家二字码 'AU'
      name: '' // @param {String} 国家名称 澳洲
    },
    history: { // 历史纪录
      sec: 0, // @param {Number} 历史播放的秒数
      part_id: '', // @param {String|Number} 历史记录影视id '101806544865002'
      part: undefined // @param {Number} 2 历史集数，用来处理历史记录
    },
    // 'url': { // 指定url可使用ajax请求
    //   // 'getBarrage': '', // @param {String} 获取弹幕接口
    //   // 'error': '', // @param {String} 错误上报接口
    //   // 'watchHistory': '', // @param {String} 观看历史接口
    //   // 'shareDomainName': '', // @param {String}
    //   // 'shareParam': '', // @param {String}
    //   // 'share': '', // @param {String}
    //   // 'wxSubscribe': '', // @param {String} 关注接口
    // },
    errorOptions: { // 错误提示出现规则
      timeoutTime: 15, // @param {Number} 卡顿提示用户切换线路
      firstTimeoutRequestTime: 15, // @param {Number} 第一次卡顿向后台发送请求
      timeoutRequestTime: 15, // @param {Number} 持续性卡顿向后台发送请求
      isRepeat: true, // @param {Boolean} 持续性卡顿中是否需要重复发送
      errorTime: 60, // @param {Number} 展示错误页面所需要的卡顿秒数
      disableTime: 600 // @param {Number} 禁用时长，当卡顿秒数大于此数时，不会向后台发送请求
    },
    // 'sharing': { // 微信分享
    //   'time': -1, // @param {Number} 在多少秒需要分享
    //   'parm': '', // @param {String} 分享的参数
    //   'timeout': 0 // @param {Number} 分享参数即将超时的时长
    // },
    wxSubscribe: { // 微信关注公众号
      time: -1, // @param {Number} 在多少秒需要关注
      timeout: 0, // @param {Number} 关注二维码即将超时的时长
      code: undefined, // @param {Number|String} 关注需要填写的码
      qrCode: '', // @param {String} 关注需要的二维码
      defaultQrCode: '', // @param {String} 关注的默认二维码
      pcExample: '', // @param {String} pc端提示的图片
      mobiExample: '', // @param {String} mobi端提示的图片
      name: '', // @param {String} 提示的公众号名称
      id: '' // @param {String} 提示的公众号id
    },
    jinri: {
      time: -1, // @param {Number} 在多少秒需要下载 app
      url: '',
      password: '',
      activeNumber: 3,
      pcPic: {
        bg: '',
        top: '',
        appPic: '',
        bottom: ''
      },
      mobiPic: {
        bg: '',
        top: '',
        appPic: '',
        button: '',
        bottom: ''
      }
    },
    advertising: { // 广告
      pause: [ // @param {Array} 暂停广告
        // {
        //   'title': '测试播放广告',
        //   'url': 'http://www.baidu.com',
        //   'weights': 0.1, // 概率
        //   'photo': 'https://www.baidu.com/img/superlogo_c4d7df0a003d3db9b65e9ef0fe6da1ec.png?where=super'
        // },
      ],
      pauseDisplay: undefined, // @param {Function} 暂停广告展示时的回调函数
      pauseClick: undefined, // @param {Function} 暂停广告被点击时的回调函数
      closeMandatory: false, // @param {Boolean} 是否允许关闭视频广告
      recordHistoryMandatoryAd: false, // @param {Boolean} 刷新页面时不需要看到相同观看广告
      disableMandatory: false, // @param {Boolean} 是否禁止播放映前广告
      mandatory: { // @param {Array} 贴片广告
        // '0': [
        //   {
        //     'seconds': 5,
        //     'photo': './static/video/1.mp4',
        //     'url': 'http://www.baidu.com',
        //   },
        // ],
        // '30': [
        //   {
        //     'seconds': 5,
        //     'photo': './static/video/1.mp4',
        //     'url': 'http://www.baidu.com',
        //   },
        // ],
      },
      trigger: undefined, // @param {Function} 用户触发广告之后的回掉函数， 不 return 或者 return false 可覆盖 window.open
      mandatoryEnd: undefined, // @param {Function} 每个贴片广告播放结束时的回调函数
      mandatoryClick: undefined, // @param {Function} 贴片广告被点击时的回调函数
      corner: [ // @param {Array} 角落广告
        // {
        //   'title': '测试播放广告',
        //   'url': 'http://www.baidu.com',
        //   'weights': 0.1, // 概率
        //   'photo': 'https://www.baidu.com/img/superlogo_c4d7df0a003d3db9b65e9ef0fe6da1ec.png?where=super'
        //   'dir': 'leftbottom'
        // },
      ],
      cornerDisplay: undefined, // @param {Function} 角落广告展示时的回调函数
      cornerClick: undefined // @param {Function} 角落广告点击时的回调函数
    },
    collect: { // 收藏
      displayState: false, // @param {Boolean} 是否显示收藏按钮
      isCollect: false // @param {Boolean} 当前是否存是收藏状态
    },
    liveOtherVideo: [ // @param {Array} 华人切换清晰度选项
      // {
      //   'tvid': 301806544865001,
      //   'other_video': [
      //     {
      //       '_id': 0,
      //       'rate': [
      //         {
      //           '_id': 221842135816030,
      //           'title': '高清1080P',
      //           'detail_title': '女排世锦赛六强赛_1080P'
      //         },
      //         {
      //           '_id': 101806544865002,
      //           'title': '超清720P',
      //           'detail_title': '女排世锦赛六强赛_720P'
      //         },
      //         {
      //           '_id': 221842135914182,
      //           'title': '清晰540P',
      //           'detail_title': '女排世锦赛六强赛_540P'
      //         }
      //       ]
      //     }
      //   ],
      //   'title': '腾讯直播',
      //   'seo': 'sportvs'
      // }
    ],
    qualityList: [
      // { _id: '111', title: '1080P', ... },
      // { _id: '222', title: '720P', ... },
      // { _id: '333', title: '540P', ... },
    ],
    nbaInfo: {
      // leftTeam: '中国',
      // rightTeam: '美国',
      // rate: '让球0 主胜2.05 平3.10 客胜3.15',
      leftTeam: '',
      rightTeam: '',
      rate: '',
      url: '',
      intervals: 5000,
      displayTime: 3000,
      bettingTitle: '',
      bettingButton: ''
    },
    limit: { // 限制用户观看五分钟
      android: '', // @param {String} 安卓下载页
      ios: '', // @param {String} ios下载页
      ipad: '' // @param {String} ipad下载页
    },
    expansion: { // 扩展选项，目前用来扩展"选集按钮"，客户端使用
      click: undefined, // @param {Function} click事件
      mouseenter: undefined, // @param {Function} mouseenter事件
      mouseleave: undefined// @param {Function} mouseleave事件
    },
    barrage: { // 用来配置一些用户 barrage 的参数
      colorList: undefined, // @param {Function} 弹幕可以选择的所有颜色列表
      startBarrageList: [] // @param {Array[String]} 在所有弹幕前显示的弹幕 []
    },

    // 函数类
    // 生命周期
    initLocal: undefined, // @param {Function} 读取了本地信息并组装到 state 中，可以在此使用 export 导出到函数读取 state 上到值
    created: undefined, // @param {Function} 创建 (会执行多次
    oneMounted: undefined, // @param {Function} mounted (只有first的时候会调用
    mounted: undefined, // @param {Function} 挂在并允许观看视频
    destroy: undefined, // @param {Function} 卸载

    // 会更改默认行为
    setKeepHistory: undefined, // @param {Function} 是否保存 history
    requestFullscreen: undefined, // @param {Function} 覆盖全屏函数
    exitFullscreen: undefined, // @param {Function} 覆盖退出全屏函数 @return {Dom} 在此 dom 上调用退出全屏函数方法，内部实现兼容，无需外部兼容
    isFullscreen: undefined, // @param {Function} 判断当前全屏状态 @return {Boolean} 是否全屏
    hasNextPart: undefined, // @param {Function} 判断是否存在下一集 @return {Boolean} 是否存在下一集
    nextPart: undefined, // @param {Function} 点击了下一集按钮
    hasNextLine: undefined, // @param {Function} 判断是否存在下一条线路  @return {Boolean} 是否存在下一条线路
    nextLine: undefined, // @param {Function} 下一条线路
    changePart: undefined, // @param {Function} 改变当前集数
    toggleCollect: undefined, // @param {Function} 切换收藏，配合 collect 参数一起使用。 @param {Function} cb 需要传会最新的 collect 的值。

    // 不会更改默认行为
    play: undefined, // @param {Function} 播放器 play 之后第回掉函数
    pause: undefined, // @param {Function} 播放器 pause 之后第回掉函数
    onChangeCurrentTime: undefined, // @param {Function} 当前播放时间改变
    changeQuality: undefined, // @param {Function} 改变清晰度选项
    changeControlBarDisplayState: undefined, // @param {Function} 更改控制栏显示状态
    downloadApp: undefined, // @param {Function} “下载app”按钮的回调事件
    clickBarrageInputSwitch: undefined, // @param {Function} 点击 “发弹幕” 按钮的回掉函数 @return {Boolean} 判断是否要打开，或者关闭
    sendBarrage: undefined, // @param {Function} 发送弹幕列表
    getBarrage: undefined, // @param {Function} 获取弹幕列表 @param {Number} barrageSeg 片段
    watchHistory: undefined, // @param {Function} 发送历史纪录
    wxSubscribeFn: undefined, // @param {Function} 获取关注历史公众号状态
    jinriSubscribeFn: undefined, // @param {Function} 获取jinri解锁状态
    error: undefined, // @param {Function} 错误
    onRequestFullscreen: undefined, // @param {Function} 全屏之后的回掉函数
    onExitFullscreen: undefined, // @param {Function} 退出全屏之后的回掉函数
    onPageRequestFullscreen: undefined, // @param {Function} 网页全屏之后的回掉函数
    onPageExitFullscreen: undefined, // @param {Function} 网页退出全屏之后的回掉函数
    onVolumechange: undefined, // @param {Function} 更改音量之后的回掉函数
    onNextPartStateChange: undefined, // @param {Function} 更改自动播放下一集选项时触发
    onEnterPictureInPicture: undefined, // @param {Function} 进入画中画的回掉函数
    onLeavePictureInPicture: undefined, // @param {Function} 退出画中画的回掉函数
    onBarrageLike: undefined, // @param {Function} 弹幕点赞 @return {Boolean} 判断是否要让点赞数 +1，未登录情况不需要 +1
    onBarrageReport: undefined, // @param {Function} 弹幕举报
    onClickBarrageReportButton: undefined, // @param {Function} 点击举报按钮时，需要检查下是否登录 @return {Boolean} 如果登录了，return true
    onChangeVisibleBarrageColor: undefined, // @param {Function} 弹幕颜色，单色和彩色的切换
    onChangeBarrageColor: undefined, // @param {Function} 更改当前想发送弹幕的颜色
    onChangeBarrageContent: undefined, // @param {Function} 更改弹幕内容
    onForward: undefined, // @param {Function} 快进，包含按钮和键盘
    onBackward: undefined, // @param {Function} 快退，包含按钮和键盘
    onChangePlaybackRate: undefined, // @param {Function} 播放速率变更
    onChangeVolume: undefined, // @param {Function} 音量变更
    onScreenshot: undefined, // @param {Function} 截屏
    onClickBarragePopup: undefined, // @param {Function} 点击展示弹幕颜色框
    onChangeSettingNextPart: undefined, // @param {Function} 设置里是否切换到下一集的开关
    onChangeSettingJumpOpEd: undefined, // @param {Function} 设置里是否切跳过 op 和 ed 的开关
    onChangeSettingSwitchLight: undefined, // @param {Function} 设置里是否切换到黑暗模式的开关
    onNoActionNotificationNextPart: undefined, // @param {Function} 无操作提示，点击下一集
    onNoActionNotificationClose: undefined, // @param {Function} 无操作提示，关闭页面
    onJinriWapOpenUrl: undefined, // @param {Function} 手机版，点击复制口令，打开新页面
    onJinriPcShow: undefined // @param {Function} pc版
  })
}

// 通过 options 设置 userAgent
function setUserAgent ({ playerForm }) {
  userAgent.change({
    isPc: playerForm === 'pc',
    isMobi: playerForm === 'mobi'
  })
}

/**
 * 添加播放函数
 * 注意 options 可能会在vue中被修改
 */
export const initPlayer = exportObject.initPlayer = (options) => {
  // 必须存在的字段
  const mustExist = {
    playerBox: isString,
    playerForm: function (form) {
      return ['pc', 'mobi'].includes(form)
    },
    playUrl: isString,
    playType: function (form) {
      return ['m3u8', 'mp4', 'm3u8:live'].includes(form)
    }
  }

  for (const key in mustExist) {
    if (!mustExist[key](options[key])) {
      throw new Error(`${key} 字段必填，并且需要符合规范`, mustExist[key])
    }
  }

  // 如果存在时，格式必须正确
  const mustCorrect = {
    id: isNumber,
    part_id: isNumber
  }

  for (const key in mustCorrect) {
    if (options[key] && !mustCorrect[key](options[key])) {
      throw new Error(`${key} 字段格式必须正确，并且需要符合规范`, mustCorrect[key])
    }
  }

  mergeOptions(options)
  setUserAgent(options)

  const { playUrl } = options

  // 判断使用何种播放器
  // ['extVjs', 'vjs', 'default']
  let playerType = ''
  const appointPlayerType = ['extVjs', 'vjs', 'default'].includes(options.playerType) ? options.playerType : undefined

  // 判断是否写死播放器
  if (appointPlayerType) {
    playerType = appointPlayerType
  } else {
    // 后台控制

    // 判断是否需要播放器
    if (isArray(options.defaultVjsPlayer)) {
      testUserAgent(options.defaultVjsPlayer, () => {
        playerType = 'vjs'
      })
    }

    // 判断是否需要原生播放器
    if (isArray(options.nativePlayer)) {
      testUserAgent(options.nativePlayer, () => {
        playerType = 'default'
      })
    }
  }

  // 没有指定播放器时，自行判断
  if (!playerType) {
    const parser = new UAParser()
    parser.setUA(userAgent.userAgentInfo)
    const result = parser.getResult()

    if (result.device.type === 'smarttv') {
      playerType = 'vjs'
    }
  }

  if (!playerType) {
    // 判断类型，调用指定播放器
    if (
      (userAgent.isAndroid && (!userAgent.version || (userAgent.version && parseFloat(userAgent.version) <= 4.4))) ||
      (userAgent.isIos && parseFloat(userAgent.version) < 6) ||
      userAgent.isWechat ||
      /smart/i.test(userAgent.userAgentInfo)
    ) {
      playerType = 'vjs'
    } else if (
      userAgent.isIos && parseFloat(userAgent.version) < 9
    ) {
      playerType = 'default'
    } else if (
      userAgent.isPc ||
      userAgent.isAndroid ||
      userAgent.isIos
    ) {
      playerType = 'extVjs'
    } else {
      // 无法识别型号，调用原生播放器
      playerType = 'default'
    }
  }

  // 判断加载方式
  if (!vjsPlayer) {
    // 当前播放器不存在时，加载新的播放器

    var content = `
      <video
        tabindex="1"
        playsinline="isiPhoneShowPlaysinline"
        webkit-playsinline="isiPhoneShowPlaysinline"
        x-webkit-airplay="allow"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        id="video"
        class="video-js">
      </video>
    `

    document.querySelector(options.playerBox).innerHTML = content

    if (playerType === 'extVjs') {
      const videojsOptions = {
        controls: false,
        autoplay: false,
        preload: hasUseMainPlayFn() ? 'auto' : 'none',
        crossorigin: 'Anonymous',
        loadingSpinner: false,
        poster: videoBackdarkImg,
        sources: [{
          src: playUrl,
          type: getVideoType(playUrl)
        }],
        // videojs-contrib-hls.js 设置缓冲时间
        // hls: {
        //   GOAL_BUFFER_LENGTH: 300
        // },
        html5: {
          hlsjsConfig: {
            // Put your hls.js config here
            // hls.js 设置预缓冲时间
            maxBufferLength: 300
          }
        }
      }

      // Android Chrome 大于68时，需要特殊处理(偶发性无法播放m3u8，需使用overrideNative)
      if (
        userAgent.browserParser.os.name === 'Android' &&
        userAgent.browserParser.browser.name === 'Chrome' &&
        parseInt(userAgent.browserParser.browser.version) >= 68
      ) {
        deepMerge(videojsOptions, {
          html5: {
            nativeAudioTracks: false,
            nativeVideoTracks: false,
            hls: {
              overrideNative: true
            }
          }
        })
      }

      exportObject.player = vjsPlayer = videojs('video', videojsOptions, function () {
        this.addChild('vueComponent', { exportObject, options })
      })
    } else if (playerType === 'vjs') {
      // 在safari中强制使用hls
      if (!videojs.options.hls) videojs.options.hls = {}
      videojs.options.hls.overrideNative = true
      videojs.options.html5.nativeAudioTracks = false
      videojs.options.html5.nativeVideoTracks = false

      exportObject.player = vjsPlayer = videojs('video', {
        controls: true,
        usingNativeControls: true,
        autoplay: true,
        preload: 'auto',
        loadingSpinner: false,
        poster: videoBackdarkImg,
        sources: [{
          src: playUrl,
          type: 'video/mp4'
          // type: 'application/x-mpegURL'
        }]
      }, function () {
        vjsPlayer.el().style.cssText = `
          position: absolute;
          left: 0;
          top: 0;
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
        `

        // 是否使用原生浏览器
        if (
          // 非chrome的smart
          !(/smart/i.test(userAgent.userAgentInfo) && /chrome/i.test(userAgent.userAgentInfo)) &&
          // 非ios6以下的
          !(userAgent.isIos && parseFloat(userAgent.version) < 6)
        ) {
          vjsPlayer.usingNativeControls(true)
          vjsPlayer.el().children[0].controls = 'controls'
        } else {
          // 播放器自定义改动
          (function () {
            // 增加一个进度条
            window.vjs$('.vjs-control-bar').prepend(`
              <div id="vjs-default-progress-bar">
                <div id="vjs-default-progress-bar__preview-time">
                  <div class="vjs-default-progress-bar__preview-time-text"></div>
                </div>

                <div id="vjs-default-progress-bar__box">
                  <div id="vjs-default-progress-bar__total"></div>
                  <div id="vjs-default-progress-bar__buffer"></div>
                  <div id="vjs-default-progress-bar__mobi"></div>
                  <div id="vjs-default-progress-bar__spot"></div>
                </div>
              </div>
            `)

            var $progressBar = window.vjs$('#vjs-default-progress-bar')
            var $timeBox = window.vjs$('#vjs-default-progress-bar__preview-time')
            var $timeText = window.vjs$('.vjs-default-progress-bar__preview-time-text')
            var $buffer = window.vjs$('#vjs-default-progress-bar__buffer')
            var $mobi = window.vjs$('#vjs-default-progress-bar__mobi')
            var $spot = window.vjs$('#vjs-default-progress-bar__spot')

            vjsPlayer.on('progress', function () {
              var proportion = vjsPlayer.buffered().end(vjsPlayer.buffered().length - 1) / vjsPlayer.duration()

              $buffer.css('width', proportion * 100 + '%')
            })

            vjsPlayer.on('timeupdate', function () {
              var proportion = vjsPlayer.currentTime() / vjsPlayer.duration()
              $mobi.css('width', proportion * 100 + '%')
              $spot.css('left', proportion * 100 + '%')
            })

            $progressBar.on('click', function (ev) {
              var proportion = ev.offsetX / this.getBoundingClientRect().width
              vjsPlayer.currentTime(parseInt(proportion * vjsPlayer.duration()))
            })

            $progressBar.on('mousemove', function (ev) {
              var proportion = ev.offsetX / this.getBoundingClientRect().width

              $timeBox.css('left', proportion * 100 + '%')
              $timeText.text(playTimeformat(parseInt(proportion * vjsPlayer.duration())))
            })
          }())

          // 重置顺序
          window.vjs$('.vjs-fullscreen-control').insertBefore('.vjs-remaining-time')

          // 增加两个按钮
          window.vjs$('<div class="vjs-iconfont vjs-control-time" title="后退5秒" tabindex="2" onclick="vjsChangeVolume(-5)">&#xe62f;</div>').insertBefore('.vjs-volume-panel')
          window.vjs$('<div class="vjs-iconfont vjs-control-time" title="前进5秒" tabindex="2" onclick="vjsChangeVolume(5)">&#xe62e;</div>').insertBefore('.vjs-volume-panel')

          window.vjsChangeVolume = function (num) {
            let currentTime = vjsPlayer.currentTime() + parseInt(num)
            const duration = vjsPlayer.duration()

            if (currentTime < 0) currentTime = 0
            else if (currentTime > duration) currentTime = duration

            vjsPlayer.currentTime(currentTime)
          }
        }

        vjsPlayer.el().children[0].style.cssText = `
          display: block;
          width: 100% !important;
          height: 100% !important;
        `

        let videoFormat = {}
        setVideoFormat()

        function setVideoFormat () {
          videoFormat = {
            'application/x-mpegURL': false,
            'video/mp4': false
          }
        }

        vjsReset = function () {
          window.vjsChangeVolume = null
          setVideoFormat()
        }

        // 视频格式错误时，自动切换格式。
        vjsPlayer.on('error', () => {
          let errorOnOff = true

          for (const key in videoFormat) {
            if (!videoFormat[key]) {
              errorOnOff = false
              console.warn('正在更改视频格式，当前使用格式 : ' + key)

              videoFormat[key] = true

              vjsPlayer.src({
                src: vjsPlayer.src(),
                type: key
              })
              vjsPlayer.load()

              return
            }
          }

          if (errorOnOff) alert('视频出现错误，请刷新重试！')
        })
      })
    } else if (playerType === 'default') {
      var videoBox = document.getElementById('video')
      videoBox.src = playUrl
      videoBox.controls = 'controls'
      videoBox.poster = videoBackdarkImg
      videoBox.style.cssText = 'display: block; position: absolute; left: 0; top: 0; width: 100%; height: 100%;'
    }
  } else {
    let type = null

    if (playerType === 'extVjs') {
      type = getVideoType(playUrl)
    } else if (playerType === 'vjs') {
      type = 'video/mp4'
    } else if (playerType === 'default') {
      type = getVideoType(playUrl)
    }

    // 更新播放地址
    vjsPlayer.src({
      src: playUrl,
      type: type
    })
    vjsPlayer.load()
    // vjsPlayer.reset();
    vjsPlayer.ready(function () {
      if (vjsReset) vjsReset({ options })
    })
  }
}

export default exportObject
