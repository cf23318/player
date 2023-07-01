<template>
  <div v-if="visible" id="vjs-picture-in-picture" :class="{ 'vjs-picture-in-picture__display': otherDisplayState && visibleControlBar && display }" @click="handleClick">
    <i class="vjs-iconfont vjs-picture-in-picture__icon"></i>
    {{ hasPicInPic ? '画中画使用中' : '画中画' }}
  </div>
</template>

<script>
export default {
  name: 'picture-in-picture',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    otherDisplayState: {
      type: Boolean,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    dom: {
      type: Object,
      required: true
    },
    visibleControlBar: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      display: false,
      chromeVisible: false,
      safariVisible: false,
      hasPicInPic: false
    }
  },

  mounted () {
    if (!this.visible) return

    const video = this.dom.video
    let display = false
    let chromeVisible = document.pictureInPictureEnabled
    let safariVisible = video.webkitSupportsPresentationMode && typeof video.webkitSetPresentationMode === 'function'

    // 标准
    if (chromeVisible) display = true
    // mac safari
    if (safariVisible) display = true

    this.$set(this, 'display', display)
    this.$set(this, 'chromeVisible', chromeVisible)
    this.$set(this, 'safariVisible', safariVisible)

    if (chromeVisible) {
      // 进入画中画模式时候执行
      video.addEventListener('enterpictureinpicture', (...args) => {
        this.$set(this, 'hasPicInPic', true)
        if (this.options.onEnterPictureInPicture) this.options.onEnterPictureInPicture(...args)
      })
      // 退出画中画模式时候执行
      video.addEventListener('leavepictureinpicture', (...args) => {
        this.$set(this, 'hasPicInPic', false)
        if (this.options.onLeavePictureInPicture) this.options.onLeavePictureInPicture(...args)
      })
    }
  },

  methods: {
    handleClick () {
      const video = this.dom.video

      if (this.chromeVisible) {
        if (this.hasPicInPic) {
          document.exitPictureInPicture && document.exitPictureInPicture()
        } else {
          video.requestPictureInPicture && video.requestPictureInPicture()
        }
      } else if (this.safariVisible) {
        // mac safari 不需要传递 onEnterPictureInPicture 回掉函数，因为 safari 无法监听 onLeavePictureInPicture 退出事件
        video.webkitSetPresentationMode(video.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture')
      }
    }
  }
}
</script>

<style>
#vjs-picture-in-picture {
  display: none;
  position: absolute;
  right: 20px;
  top: 4%;
  z-index: 10;
  min-width: 108px;
  height: 36px;
  line-height: 32px;
  padding: 0 14px;
  background: rgba(0, 0, 0, .3);
  border-radius: 20px;
  font-size: 14px;
  color: #fff;
  text-align: center;
  cursor: pointer;
}

#vjs-picture-in-picture:hover {
  background: linear-gradient(90deg,rgba(255,133,11,1),rgba(255,89,84,1));
}

.vjs-mobi #vjs-picture-in-picture {
  display: none !important;
}

.vjs-fullscreen.vjs-pc #vjs-picture-in-picture {
  right: 30px;
  top: 60px;
}

.vjs-playing #vjs-picture-in-picture.vjs-picture-in-picture__display {
  display: block;
}

#vjs-picture-in-picture .vjs-picture-in-picture__icon {
  margin-right: 3px;
}

#vjs-picture-in-picture .vjs-picture-in-picture__icon::before {
  font-size: 12px;
  content: '\e659';
}
</style>
