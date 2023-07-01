<template>
  <div id="vjs-cover" ref="native"></div>
</template>

<script>
import { doubleClick, getCoordinate, debuglog } from 'utils'

export default {
  name: 'cover',

  props: {
    options: {
      type: Object,
      required: true
    },
    player: {
      type: Object,
      required: true
    },
    userAgent: {
      type: Object,
      required: true
    },
    state: {
      type: Object,
      required: true
    }
  },

  data () {
    return {}
  },

  mounted () {
    this.addDomEventListener()
  },

  methods: {
    addDomEventListener () {
      if (this.userAgent.isPc) {
        if (this.userAgent.isIpad) {
          this.touchEventListener()
        } else {
          this.mouseEventListener()
        }
      } else if (this.userAgent.isMobi) {
        this.touchEventListener()
      }
    },
    /**
     * pc 鼠标 键盘 事件
     */
    mouseEventListener () {
      // pc触摸显示控制条
      this.$refs.native.addEventListener('mousemove', () => {
        this.$emit('showControlBar')
      })

      // pc 单机切换播放状态 双击切换全屏状态
      this.$refs.native.addEventListener('click', doubleClick({
        singleClick: () => {
          this.$emit('changePlayState')
        },
        doubleClick: () => {
          this.$emit('toggleFullscreenState')
        },
        time: this.state.clickIntervalTime
      }))
    },
    /**
     * mobi 触屏 ipad 事件
     */
    touchEventListener () {
      // 解决双击冲突，并且解决类型问题
      let type = null

      // mobi 单机切换控制栏显示状态 双击切换播放状态
      this.$refs.native.addEventListener('touchend', doubleClick({
        singleClick: () => {
          if (!type) {
            this.$emit('toggleControlBar')
          }
        },
        doubleClick: () => {
          this.$emit('changePlayState')
        },
        time: this.state.clickIntervalTime
      }))

      let fn = {
        invalidEnd: null,
        slideAdjustVolume: null,
        slideAdjustProgress: null,
        slideAdjustProgressEnd: null
      }

      // 手指滑动时，执行特定函数
      {
        let initX
        let initY
        let oldX
        let oldY
        let offsetVideoX
        let determineTheDistance = 30

        this.$refs.native.addEventListener('touchstart', (e) => {
          let coordinate = getCoordinate(e)

          initX = oldX = coordinate.x
          initY = oldY = coordinate.y
          type = null
        })

        this.$refs.native.addEventListener('touchmove', (e) => {
          if (this.userAgent.isIpad) {
            if (type !== 'slideAdjustProgress') {

            } else {
              e.preventDefault()
            }
          } else {
            e.preventDefault()
          }

          let videoInfo = this.$refs.native.getBoundingClientRect()
          let coordinate = getCoordinate(e)

          let newX = coordinate.x
          let newY = coordinate.y
          offsetVideoX = newX - videoInfo.left

          let position = {
            initX: initX,
            initY: initY,
            oldX: oldX,
            oldY: oldY,
            newX: newX,
            newY: newY,
            videoLeft: videoInfo.left,
            videoTop: videoInfo.top
          }

          // 移动时判断滑动类型，确定滑动类型之后在进行滑动
          if (!type) {
            if (initY < 30) {
              type = 'invalid'
            }

            if (Math.abs(newX - initX) > determineTheDistance) {
              debuglog.log('左右滑动')

              initX = newX
              initY = newY

              type = 'slideAdjustProgress'
            } else if (Math.abs(newY - initY) > determineTheDistance) {
              debuglog.log('上下滑动')

              initX = newX
              initY = newY

              // 右侧滑动修改音量
              if (offsetVideoX > videoInfo.width / 2) {
                type = 'slideAdjustVolume'
              }
            }
          } else {
            switch (type) {
              case 'slideAdjustProgress':
                if (this.state.duration) {
                  fn.slideAdjustProgress && fn.slideAdjustProgress(e, position)
                }
                break
              case 'slideAdjustVolume':
                e.stopPropagation()

                if (offsetVideoX > videoInfo.width / 2) {
                  fn.slideAdjustVolume && fn.slideAdjustVolume(e, position)
                };
                break
            }
          }

          oldX = newX
          oldY = newY
        })

        this.$refs.native.addEventListener('touchend', (e) => {
          switch (type) {
            case 'slideAdjustVolume':
              fn.slideAdjustVolumeEnd && fn.slideAdjustVolumeEnd(e)
              break
            case 'slideAdjustProgress':
              if (this.state.duration) {
                fn.slideAdjustProgressEnd && fn.slideAdjustProgressEnd(e)
              }
              break
          }
        })
      }

      // 左右滑动更改进度
      {
        let time = 0

        fn.slideAdjustProgress = (e, position) => {
          time = this.player.currentTime() + parseInt((position.newX - position.initX - position.videoLeft) / 2)

          this.$emit('changeCurrentTime', { time, hasChangeVideo: false })
          this.$emit('showControlBar')
        }

        fn.slideAdjustProgressEnd = () => {
          this.$emit('changeCurrentTime', { time })
        }
      }

      // 上下滑动调节音量，ios不支持
      {
        let timer

        fn.slideAdjustVolume = (e, position) => {
          debuglog.log('上下滑动调节音量！')

          this.$emit('changeVolume', { volume: this.player.volume() - (position.newY - position.oldY) / 300 })
          this.$emit('changeVolumeIconState', true)

          clearTimeout(timer)
          timer = setTimeout(() => {
            this.$emit('changeVolumeIconState', false)
          }, 1000)
        }

        fn.slideAdjustVolumeEnd = (e) => {
          if (this.options.onChangeVolume) this.options.onChangeVolume(this.player.volume())

          e.stopPropagation()
        }
      }
    }
  }
}
</script>

<style>
  #vjs-cover {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
}
</style>
