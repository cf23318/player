<template>
  <div class="vjs-progress-bar" :class="{'vjs-disabled': disabled}" ref="progressBar">
    <div class="vjs-progress-bar__preview" :class="{hasPreviewPic: hasVisiblePreviewPic}" ref="previewTimeBox" v-show="visiblePreview" :style="{'transform': `translate3d(calc(${previewLeft}px - 50%), 0, 0)`}">
      <div class="vjs-progress-bar__preview-pic" :style="{backgroundImage: `url(${previewPic})`, backgroundPosition: previewPosition}"></div>
      <div class="vjs-progress-bar__preview-text" v-text="previewFormatTime"></div>
    </div>

    <div class="vjs-progress-bar__box" ref="box" @mousemove="handleMove($event)" @mouseout="handleOut" @mouseup="handleClick($event)" @touchend="handleClick($event)">
      <div class="vjs-progress-bar__total"></div>
      <div class="vjs-progress-bar__buffer" :style="{'width': `${parseInt(bufferProgressRatioCopy * 100)}%`}"></div>
      <div class="vjs-progress-bar__mobi" :style="{'width': `${videoRatioCopy * 100}%`}"></div>
      <div class="vjs-progress-bar__spot" v-drag="spotDrag" :style="{'left': `${videoRatioCopy * 100}%`}"></div>
    </div>
  </div>
</template>

<script>
import { getCoordinate, playTimeformat } from 'utils'

export default {
  name: 'progress-bar',

  props: {
    videoType: {
      type: String,
      required: true
    },
    videoRatio: {
      type: Number,
      required: true
    },
    bufferProgressRatio: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true,
      default: false
    },
    options: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      offsetLeft: 0,
      offsetRatio: 0,
      // lastOffsetRatio: null,
      // lastSetOffsetRatioTime: 0,
      previewLeft: 0,
      previewFormatTime: 0,
      previewPic: '',
      previewPosition: '',
      visiblePreview: false
    }
  },

  computed: {
    videoRatioCopy () {
      return this.videoType === 'normal' ? this.videoRatio : 0
    },
    bufferProgressRatioCopy () {
      return this.videoType === 'normal' ? this.bufferProgressRatio : 0
    },
    hasVisiblePreviewPic () {
      return this.options.previewPicPath && this.duration !== 0
    }
  },

  methods: {
    playTimeformat,
    setOffsetLeft (e) {
      let boxAttr = this.$refs.box.getBoundingClientRect()
      let offsetLeft = getCoordinate(e).x - boxAttr.left

      if (offsetLeft < 0) offsetLeft = 0
      else if (offsetLeft > boxAttr) offsetLeft = boxAttr

      this.$set(this, 'offsetLeft', offsetLeft)
      this.$emit('showControlBar')
      return offsetLeft
    },
    setOffsetRatio (offsetLeft) {
      let offsetRatio = offsetLeft / this.$refs.box.getBoundingClientRect().width

      // let diff = offsetRatio - this.lastOffsetRatio;
      // console.log(offsetRatio, this.lastOffsetRatio, diff);

      // // 差别不大才允许修改
      // if (diff > -0.1 && diff < 0.1 || this.lastOffsetRatio === null) {
      //   this.$set(this, 'offsetRatio', offsetRatio);
      //   this.$set(this, 'lastOffsetRatio', offsetRatio);
      // } else {
      //   offsetRatio = this.offsetRatio;
      // }

      this.$set(this, 'offsetRatio', offsetRatio)

      return offsetRatio
    },
    setPreviewLeft (e) {
      const boxAttr = this.$refs.box.getBoundingClientRect()
      let previewOffset = getCoordinate(e).x - boxAttr.left
      let previewBoxWidthHalf = 0
      if (this.hasVisiblePreviewPic) {
        previewBoxWidthHalf = 200 / 2
      } else {
        previewBoxWidthHalf = this.$refs.previewTimeBox.getBoundingClientRect().width / 2
      }

      if (previewOffset < 0) previewOffset = 0
      else if (previewOffset > boxAttr.width) previewOffset = boxAttr.width

      let previewLeft = previewOffset
      if (previewLeft - previewBoxWidthHalf < 0) previewLeft = previewBoxWidthHalf
      if (previewLeft + previewBoxWidthHalf > boxAttr.width) previewLeft = boxAttr.width - previewBoxWidthHalf

      this.$set(this, 'previewLeft', previewLeft)
      this.$emit('showControlBar')
      return previewOffset
    },
    setPreviewTime (previewOffset) {
      const previewRatio = previewOffset / this.$refs.box.getBoundingClientRect().width
      const previewTime = Math.floor(previewRatio * this.duration)
      const previewFormatTime = playTimeformat(previewTime)

      this.$set(this, 'previewFormatTime', previewFormatTime)

      return previewTime
    },
    handleMove (ev) {
      const previewTime = this.setPreviewTime(this.setPreviewLeft(ev))
      this.handlePreviewPic(previewTime)

      this.$nextTick(() => {
        this.$set(this, 'visiblePreview', true)
      })
    },
    handleOut () {
      this.$set(this, 'visiblePreview', false)
    },
    handleClick (ev) {
      this.setOffsetRatio(this.setOffsetLeft(ev))
      this.$emit('changeCurrentTime', { ratio: this.offsetRatio })
    },
    spotDrag () {
      return {
        down: (ev) => {
          ev.stopPropagation()
        },
        move: (ev) => {
          this.setOffsetRatio(this.setOffsetLeft(ev))
          this.$emit('changeCurrentTime', { ratio: this.offsetRatio, hasChangeVideo: false })
          this.$emit('showControlBar')
          ev.stopPropagation()
        },
        up: (ev) => {
          this.$emit('changeCurrentTime', { ratio: this.offsetRatio })
          ev.stopPropagation()
        }
      }
    },
    handlePreviewPic (previewTime) {
      if (!this.hasVisiblePreviewPic) return

      let calculateTime = previewTime + 9
      const capacityWidth = 10
      const capacityHeight = 10
      const capacity = capacityWidth * capacityHeight // 10 * 10 的大图
      const segmentation = 10 // 10s 一段
      const picWidth = 200 // 每张预览图宽度
      const picHeight = 113 // 每张预览图高度

      this.$set(this, 'previewPic', `${this.options.previewPicPath}${Math.floor(calculateTime / segmentation / capacity) + 1}.jpg`)
      this.$set(this, 'previewPosition', `-${Math.floor(calculateTime / segmentation % capacity % capacityWidth) * picWidth}px -${Math.floor(calculateTime / segmentation % capacity / capacityWidth) * picHeight}px`)
    }
  }
}
</script>

<style lang="scss">
  .vjs-progress-bar {
    position: absolute;
    left: 0;
    bottom: 54px;
    z-index: 50;
    width: 100%;
    height: 10px;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    cursor: pointer;

    &:hover {
      .vjs-progress-bar__spot {
        opacity: 1;
      }
    }

    .vjs-progress-bar__preview {
      &.hasPreviewPic {
        position: absolute;
        top: -115px;
        z-index: 51;
        width: 200px;
        height: 113px;
        font-size: 12px;
        text-align: center;

        .vjs-progress-bar__preview-pic {
          width: 200px;
          height: 113px;
          background-repeat: no-repeat;
          background-size: 1000%;
        }

        .vjs-progress-bar__preview-text {
          position: absolute;
          left: 0;
          bottom: 0;
          display: block;
          width: 100%;
          height: 24px;
          line-height: 24px;
          background: linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 100%);
          text-align: center;
          color: #fff;
        }
      }

      &:not(.hasPreviewPic) {
        position: absolute;
        top: -20px;
        z-index: 51;
        height: 18px;
        font-size: 12px;
        line-height: 18px;
        text-align: center;

        .vjs-progress-bar__preview-text {
          padding: 0 3px;
          display: inline-block;
          background: #000;
        }
      }

    }

    .vjs-progress-bar__box {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 5px;
      cursor: pointer;
      transition: height .2s;
      box-sizing: content-box;

      &:hover {
        height: 10px;
      }
    }

    .vjs-progress-bar__total {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 51;
      width: 100%;
      height: inherit;
      background: rgba(166, 166, 166, .5);
    }

    .vjs-progress-bar__buffer {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 51;
      height: inherit;
      background: rgba(166, 166, 166, .8);
    }

    .vjs-progress-bar__mobi {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 52;
      height: inherit;
      background: #ff920b;
    }

    .vjs-progress-bar__spot {
      opacity: 0;
      position: absolute;
      top: 0;
      z-index: 52;
      width: 10px;
      height: 10px;
      margin: 0 0 0 -5px;
      background: #fff;
      box-shadow: 0 0 5px 2px rgba(255, 146, 11, 1);
      border-radius: 50%;
    }
  }

.vjs-live {
  .vjs-progress-bar {
    display: none !important;
  }
}

.vjs-ipad {
  .vjs-progress-bar {
    .vjs-progress-bar__preview {
      display: none !important;
    }

    .vjs-progress-bar__box {
      height: 24px !important;
    }

    .vjs-progress-bar__spot {
      width: 24px;
      height: 24px;
      opacity: 1;
    }
  }
}

/* 进度条 移动端 */

.vjs-mobi {
  .vjs-progress-bar {
    position: relative;
    top: 17px;

    .vjs-progress-bar__preview {
      display: none;
    }

    .vjs-progress-bar__box {
      left: 15px;
      right: 15px;
      top: 3px;
      width: auto;
      height: 2px;
      padding: 5px 0;
    }

    .vjs-progress-bar__total,
    .vjs-progress-bar__buffer,
    .vjs-progress-bar__mobi {
      top: 5px;
    }

    .vjs-progress-bar__spot {
      opacity: 1;
      position: relative;
      top: 2px;
      background: rgba(255, 146, 11, 1);
      box-shadow: 0 0 0 0 transparent;
      margin-top: -6px;

      &::before {
        content: '';
        position: absolute;
        left: -4px;
        top: -4px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(255, 146, 11, 1);
        opacity: .4;
      }
    }
  }
}

@media screen and (max-width: 500px) {
  .vjs-mobi .vjs-progress-bar .vjs-progress-bar__box {
    right: 0;
  }
}
</style>
