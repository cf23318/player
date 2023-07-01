<template>
  <div
    class="vjs-volume-button"
    :class="{'vjs-disabled': disabled, 'muted': muted || volume < 0.03}"
    title="调节音量"
  >
    <div class="vjs-control-bar__button vjs-volume-button__layout"
      @mouseenter="showControl"
      @mouseleave="hideControl"
      @click="handleVolumeBtnClick($event)"
    >
      <i class="vjs-iconfont vjs-volume-button__muted"></i>

      <div class="vjs-volume-button__control" v-show="displayControl" @click.stop="">
        <div class="vjs-volume-button__control-layout" v-drag="spotDrag">
          <div class="vjs-volume-button__strip" ref="strip">
            <div class="vjs-volume-button__spot" :style="{'top': `${100 - volumePercentage}%`}"></div>
            <div class="vjs-volume-button__bg" :style="{'height': `${volumePercentage}%`}"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCoordinate } from 'utils'

export default {
  name: 'volume-button',

  props: {
    options: {
      type: Object,
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
    disabled: {
      type: Boolean,
      required: true,
      default: false
    },
    userAgent: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      displayControl: false,
      volumeBtnNumOfClick: 0
    }
  },

  computed: {
    /**
     * 计算音量展示值
     */
    volumePercentage () {
      return parseInt((this.muted ? 0 : this.volume) * 100)
    }
  },

  methods: {
    handleVolumeBtnClick (ev) {
      ev.stopPropagation()

      if (this.userAgent.isIpad) {
        // ipad 点击第一次打开，第二次关闭
        if (this.displayControl) {
          this.hideControl()
        } else {
          this.$set(this, 'displayControl', true)
        }
      } else {
        // pc 点击第一次打开 第二次切换静音
        if (this.volumeBtnNumOfClick === 0) {
          this.$set(this, 'displayControl', true)
        } else {
          this.$emit('changeVolume', { muted: 'toggle' })
          if (this.options.onChangeVolume) this.options.onChangeVolume(0)
        }

        this.$set(this, 'volumeBtnNumOfClick', this.volumeBtnNumOfClick + 1)
      }
    },
    showControl () {
      this.$set(this, 'displayControl', true)
      this.$set(this, 'volumeBtnNumOfClick', 1)
    },
    hideControl () {
      this.$set(this, 'displayControl', false)
      this.$set(this, 'volumeBtnNumOfClick', 0)
    },
    handleStripClick (e, type) {
      const stripAttr = this.$refs.strip.getBoundingClientRect()
      const offsetTop = getCoordinate(e).y - stripAttr.top
      const volume = 1 - offsetTop / stripAttr.height

      this.$emit('changeVolume', { muted: false })
      this.$emit('changeVolume', { volume: volume })

      if (type === 'up') {
        if (this.options.onChangeVolume) this.options.onChangeVolume(volume)
      }
    },
    spotDrag () {
      return {
        move: (e) => {
          this.handleStripClick(e, 'move')
        },
        up: (e) => {
          this.handleStripClick(e, 'up')
        }
      }
    }
  }
}
</script>

<style lang="scss">
.vjs-volume-button {
  position: relative;

  &.muted {
    .vjs-iconfont.vjs-volume-button__muted {
      &::before {
        content: '\e614';
        position: relative;
        top: -2px;
        font-size: .95em;
      }
    }
  }

  .vjs-volume-button__layout {
    // width: 100%;
    height: 39px;
    line-height: 24px;
    margin-top: 15px;
  }

  .vjs-iconfont.vjs-volume-button__muted {
    display: inline-block;
    width: 100%;
    height: 100%;
    font-size: 22px;
    cursor: pointer;
    text-align: center;

    &:hover {
      color: #1f93ea;
    }

    &::before {
      content: '\e87a';
    }
  }

  .vjs-volume-button__control {
    position: absolute;
    z-index: 60;
    left: 5px;
    bottom: 38px;
    width: 40px;
    height: 124px;
    padding-bottom: 10px;

    .vjs-volume-button__control-layout {
      height: 100%;
      padding-top: 10px;
      background: rgba(0, 0, 0, .8);
      cursor: pointer;
    }

    .vjs-volume-button__strip {
      position: relative;
      width: 5px;
      height: 90px;
      border-radius: 5px;
      margin: 2px 0 0 18px;
      background: rgba(166, 166, 166, .5);
    }

    .vjs-volume-button__spot {
      position: absolute;
      z-index: 61;
      left: -2px;
      width: 9px;
      height: 9px;
      margin-top: -4.5px;
      background: #fff;
      border-radius: 50%;

      &:hover {
        box-shadow: 0 0 5px 2px rgba(255, 146, 11, 1);
      }
    }

    .vjs-volume-button__bg {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background: #ff920b;
      border-radius: 5px;
    }
  }
}

.vjs-mobi .vjs-volume-button,
.vjs-ipad .vjs-volume-button {
  display: none;
}
</style>
