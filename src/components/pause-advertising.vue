<template>
  <div
    class="vjs-pause-advertising"
    v-show="displayAdvertising"
    @click="handleAdClick(currentAdvertising)">
    <img class="vjs-pause-advertising__photo" :src="currentAdvertising.photo">

    <div class="vjs-pause-advertising__close" @click="close($event)" title="关闭广告">
      <i class="vjs-iconfont">&#xe61d;</i>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  name: 'pause-advertising',

  props: {
    initSuccessful: {
      type: Boolean,
      required: true
    },
    playState: {
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
    }
  },

  data () {
    return {
      formatAdvertising: [],
      currentAdvertising: {},
      display: false,
      maximum: 1
    }
  },

  computed: {
    displayAdvertising () {
      return this.userAgent.isPc && this.initSuccessful && this.playSuccessState && this.advertising.pause.length && this.display
    }
  },

  watch: {
    playState (newVal) {
      if (!newVal && this.userAgent.isPc) {
        this.switchAdvertising()
      }

      this.display = !newVal
    }
  },

  created () {
    /**
     * 初始化生成广告列表
     */
    let startNum = 0

    this.formatAdvertising = this.advertising.pause.map((advertising) => {
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

  mounted () {
    // this.switchAdvertising()
  },

  methods: {
    // 随机生成图片
    switchAdvertising () {
      this.currentAdvertising = this.check(Math.random() * this.maximum) || {}

      if (this.advertising.pauseDisplay) this.advertising.pauseDisplay(this.currentAdvertising)
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
      if (this.advertising.pauseClick) this.advertising.pauseClick(advertisingInfo)

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
.vjs-pause-advertising {
  display: none;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10;
  width: auto;
  height: 56%;
  transform: translate(-50%, -50%);
  text-align: center;
  cursor: pointer;

  .vjs-pause-advertising__photo {
    display: block;
    height: 100%;
  }

  .vjs-pause-advertising__close {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: rgba(0, 0, 0, .5);
    overflow: hidden;
    cursor: pointer;
    color: #fff;

    .vjs-iconfont {
      font-size: 14px;
    }
  }
}

.vjs-paused .vjs-pause-advertising {
  display: block;
}
</style>
