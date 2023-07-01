<template>
  <div
    class="vjs-corner-advertisement"
    :class="currentAdvertising.dir | getDirClass"
    v-show="displayAdvertising"
    @click="handleAdClick(currentAdvertising)">
    <img class="vjs-corner-advertisement__photo" :src="currentAdvertising.photo">

    <div class="vjs-corner-advertisement__close" @click="close($event)" title="关闭广告">
      <i class="vjs-iconfont">&#xe61d;</i>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import { advancedDebounce, closure, deepMerge } from 'utils'

export default {
  name: 'corner-advertisement',

  props: {
    initSuccessful: {
      type: Boolean,
      required: true
    },
    playSuccessState: {
      type: Boolean,
      required: true
    },
    userAgent: {
      type: Object,
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
    duration: {
      type: Number,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      formatAdvertising: [],
      currentAdvertising: {},
      display: false,
      maximum: 1,
      checkInfo: [],
      minTime: 60
    }
  },

  computed: {
    displayAdvertising () {
      return this.userAgent.isPc && this.initSuccessful && this.playSuccessState && this.advertising.corner.length && this.display
    }
  },

  watch: {
    currentTime (currentTime) {
      if (this.userAgent.isPc && currentTime && this.duration > this.minTime) {
        this.checkCurrentTime()
      }
    },

    duration: {
      handler (newVal) {
        this.$nextTick(this.setCheckInfo)
      },
      immediate: true
    }
  },

  filters: {
    getDirClass (dir) {
      switch (dir) {
        case 'lefttop':
          return 'vjs-corner-advertisement-left-top'
        case 'leftbottom':
          return 'vjs-corner-advertisement-left-bottom'
        case 'rightbottom':
          return 'vjs-corner-advertisement-right-bottom'
        default:
          return 'vjs-corner-advertisement-left-bottom'
      }
    }
  },

  created () {
    this.init()
  },

  methods: {
    reset () {
      deepMerge(this.$data, this.$options.data())

      this.$nextTick(() => {
        this.init()
      })
    },
    init () {
      /**
       * 初始化生成广告列表
       */
      let startNum = 0

      this.formatAdvertising = this.advertising.corner.map((advertising) => {
        advertising = cloneDeep(advertising)
        const weights = parseFloat(advertising.weights)
        const endNum = startNum + weights

        advertising.probabilityNumber = {
          start: startNum,
          end: endNum
        }

        startNum = endNum

        return advertising
      })

      this.maximum = startNum
    },
    setCheckInfo () {
      if (this.duration > this.minTime) {
        const checkInfo = []

        // 30m
        if (this.duration > 1800) {
          checkInfo.push({ start: parseInt(this.duration * 0.2), end: parseInt(this.duration * 0.3), visible: false })
          checkInfo.push({ start: parseInt(this.duration * 0.5), end: parseInt(this.duration * 0.6), visible: false })
          checkInfo.push({ start: parseInt(this.duration * 0.8), end: parseInt(this.duration * 0.9), visible: false })
        } else {
          checkInfo.push({ start: parseInt(this.duration * 0.2), end: parseInt(this.duration * 0.3), visible: false })
          checkInfo.push({ start: parseInt(this.duration * 0.8), end: parseInt(this.duration * 0.9), visible: false })
        }

        this.$set(this, 'checkInfo', checkInfo)
      }
    },
    checkCurrentTime: closure(function () {
      return advancedDebounce({
        lead: function () {},
        process: function () {
          this.checkInfo.forEach((currentCheckInfo, index) => {
            if (!this.display && currentCheckInfo.visible === false && currentCheckInfo.start < this.currentTime && currentCheckInfo.end > this.currentTime) {
              const newCheckInfo = cloneDeep(this.checkInfo)

              this.switchAdvertising()
              this.$set(this, 'display', true)
              newCheckInfo[index].visible = true
              this.$set(this, 'checkInfo', newCheckInfo)
            }
          })
        },
        trail: function () {},
        maxWait: 300,
        time: 300
      })
    }),
    // 随机生成图片
    switchAdvertising () {
      this.currentAdvertising = this.check(Math.random() * this.maximum) || {}

      if (this.advertising.cornerDisplay) this.advertising.cornerDisplay(this.currentAdvertising)
    },
    // 判断是哪个图片
    check (num) {
      return this.formatAdvertising.find((advertising) => {
        let { start, end } = advertising.probabilityNumber
        return num >= start && num < end
      })
    },
    // 关闭窗口
    close (ev) {
      ev.stopPropagation()
      ev.preventDefault()
      this.display = false
    },
    /**
     * 点击广告的回掉函数
     */
    handleAdClick (advertisingInfo) {
      if (this.advertising.cornerClick) this.advertising.cornerClick(advertisingInfo)

      if (this.advertising.trigger) {
        if (!this.advertising.trigger(advertisingInfo)) {
          return
        }
      }

      // 如果不使用 advertising.trigger 的话，默认用页面打开 url
      if (advertisingInfo.url) {
        window.open(advertisingInfo.url)
      }
    }
  }
}
</script>

<style lang="scss">
.vjs-corner-advertisement {
  position: absolute;
  left: 20px;
  top: 26px;
  z-index: 10;
  width: 20.71%;
  padding-bottom: 6.90%;
  margin-top: 20px;
  text-align: center;
  cursor: pointer;

  &.vjs-corner-advertisement-left-top {
    left: 20px;
    top: 20px;
  }

  &.vjs-corner-advertisement-left-bottom {
    left: 20px;
    top: initial;
    bottom: 70px;
  }

  &.vjs-corner-advertisement-right-bottom {
    left: initial;
    right: 20px;
    top: initial;
    bottom: 70px;
  }

  .vjs-corner-advertisement__photo {
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  .vjs-corner-advertisement__close {
    position: absolute;
    right: 0;
    top: -26px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 22px;
    border: 1px solid #fff;
    border-radius: 11px;
    background: rgba(0, 0, 0, .3);
    overflow: hidden;
    cursor: pointer;
    color: #fff;

    .vjs-iconfont {
      font-size: 14px;
    }
  }
}
</style>
