<template>
  <a
    target="_blank"
    id="vjs-gambling-fixed-advertising"
    v-if="playSuccessState && nbaInfo.rate && userAgent.isPc"
    :class="{reduce: reduceState}"
    :style="[fullscreenState ? {transform: `scale(${playerStyleScale})`} : '']"
    :href="nbaInfo.url"
    v-hover="handleHover">
    <div id="vjs-gambling-fixed-advertising__bg"></div>

    <div id="vjs-gambling-fixed-advertising__text-box">
      <img id="vjs-gambling-fixed-advertising__betting-title" :src="nbaInfo.bettingTitle">
      <div class="vjs-gambling-fixed-advertising__text">
        <span class="vjs-gambling-fixed-advertising__text-team" v-text="nbaInfo.leftTeam"></span>
        &nbsp;VS&nbsp;
        <span class="vjs-gambling-fixed-advertising__text-team" v-text="nbaInfo.rightTeam"></span>
      </div>
      <div class="vjs-gambling-fixed-advertising__text" style="color: #888;" v-text="nbaInfo.rate"></div>
    </div>

    <div id="vjs-gambling-fixed-advertising__btn">
      <img id="vjs-gambling-fixed-advertising__betting-btn" :src="nbaInfo.bettingButton">
    </div>
  </a>
</template>

<script>
export default {
  name: 'gambling-fixed-advertising',

  props: {
    nbaInfo: {
      type: Object,
      default () {
        return {
          // leftTeam: '中国',
          // rightTeam: '美国',
          // rate: '让球0 主胜2.05 平3.10 客胜3.15',
          // url: 'http://www.baidu.com',
          // intervals: 600000,
          // displayTime: 30000,
          // bettingTitle: '/tpl_pc/assets/imgs/fifa/video_betting-title.png?v=201806141911',
          // bettingButton: '/tpl_pc/assets/imgs/fifa/video_betting-btn.png?v=201806141911',
        }
      }
    },
    userAgent: {
      type: Object,
      required: true
    },
    playSuccessState: {
      type: Boolean,
      required: true
    },
    fullscreenState: {
      type: Boolean,
      required: true
    },
    playerStyleScale: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      // 当前是否处于缩小状态
      reduceState: true,
      // 循环自动显示的定时器
      autoEnlargeTimer: null,
      // 当前是否是自动展开，自动展开时不允许缩小
      isAuto: false,
      // 定时缩小 定时器
      reduceTimer: null
    }
  },

  watch: {
    // 初始化完成时展示
    playSuccessState: {
      handler (newVal) {
        if (newVal) {
          this.autoExpansion()
        }
      },
      immediate: true
    }
  },

  mounted () {
    // 定时器自动展开
    if (this.nbaInfo.rate && this.userAgent.isPc) {
      this.autoEnlargeTimer = setInterval(() => {
        this.autoExpansion()
      }, this.nbaInfo.intervals)
    }
  },

  beforeDestroy () {
    clearInterval(this.autoEnlargeTimer)
    clearTimeout(this.reduceTimer)
  },

  methods: {
    /**
     * 缩小
     */
    reduce () {
      if (!this.isAuto) this.$set(this, 'reduceState', true)
    },
    /**
     * 放大
     */
    enlarge () {
      this.$set(this, 'reduceState', false)
    },
    /**
     * 展开
     */
    autoExpansion () {
      this.$set(this, 'isAuto', true)
      this.enlarge()

      clearTimeout(this.reduceTimer)
      this.reduceTimer = setTimeout(() => {
        this.$set(this, 'isAuto', false)
        this.reduce()
      }, this.nbaInfo.displayTime)
    },
    /**
     * 处理触摸
     */
    handleHover () {
      return {
        over: this.enlarge,
        out: this.reduce
      }
    }
  }
}
</script>

<style>
  #vjs-gambling-fixed-advertising {
    position: absolute;
    top: 3%;
    right: 2%;
    z-index: 10;
    display: flex;
    /* display: none; */
    justify-content: space-between;
    width: auto;
    height: 130px;
    transform-origin: top right;
    transform: scale(0.4545);
  }

  .vjs-fullscreen #vjs-gambling-fixed-advertising {
    display: flex;
  }

  #vjs-gambling-fixed-advertising #vjs-gambling-fixed-advertising__bg {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.35);
    opacity: 0.95;
    transition: all 0.5s;
  }

  #vjs-gambling-fixed-advertising.reduce #vjs-gambling-fixed-advertising__bg {
    opacity: 0;
  }

  #vjs-gambling-fixed-advertising #vjs-gambling-fixed-advertising__text-box {
    position: relative;
    z-index: 10;
    width: 100%;
    line-height: 1.6;
    padding: 0 28px;
    font-size: 19px;
    text-align: center;
    color: #333;
    transition: all 0.5s;
  }

  #vjs-gambling-fixed-advertising.reduce #vjs-gambling-fixed-advertising__text-box {
    opacity: 0;
  }

  #vjs-gambling-fixed-advertising .vjs-gambling-fixed-advertising__text {
    display: flex;
    justify-content: center;
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #vjs-gambling-fixed-advertising .vjs-gambling-fixed-advertising__text .vjs-gambling-fixed-advertising__text-team {
    display: inline-block;
    max-width: 120;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #vjs-gambling-fixed-advertising #vjs-gambling-fixed-advertising__betting-title {
    display: block;
    height: 32px;
    margin: 14px auto 11px;
  }

  #vjs-gambling-fixed-advertising #vjs-gambling-fixed-advertising__btn {
    flex-shrink: 0;
    position: relative;
    z-index: 11;
    margin: 4px 6px 6px 0;
    width: 86px;
    height: 120px;
    background: linear-gradient(to bottom, rgb(252, 49, 49), rgba(205, 0, 0));
    border-radius: 23px;
  }

  #vjs-gambling-fixed-advertising #vjs-gambling-fixed-advertising__betting-btn {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
