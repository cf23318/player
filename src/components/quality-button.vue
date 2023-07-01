<template>
  <div class="vjs-quality-button" title="画质" v-show="qualityList.length" :class="{'vjs-disabled': disabled}">
    <div ref="native" class="vjs-quality-button__layout">
      <div class="vjs-iconfont vjs-quality-button__text" @click="handleClick" v-text="quality"></div>

      <div class="vjs-quality-button__control" v-show="display">
        <ul class="vjs-quality-button__control-list">
          <li
            v-for="qualityInfo in qualityList"
            :key="qualityInfo._id"
            class="vjs-quality-button__control-item"
            v-text="qualityInfo.title"
            :title="qualityInfo.title"
            :data-info="qualityInfo._id"
            :class="{'selection': qualityInfo.selection}"
            @click="changeQuality(qualityInfo)"
          ></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'quality-button',

  props: {
    options: {
      type: Object,
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
      display: false
    }
  },

  mounted () {
    if (this.userAgent.isPc) {
      this.$refs.native.addEventListener('mouseenter', this.handleEntry)
      this.$refs.native.addEventListener('mouseleave', this.handleLeave)
    }
  },

  beforeDestroy () {
    if (this.userAgent.isPc) {
      this.$refs.native.removeEventListener('mouseenter', this.handleEntry)
      this.$refs.native.removeEventListener('mouseleave', this.handleLeave)
    }
  },

  computed: {
    qualityList () {
      var qualityList = []

      if (this.options.liveOtherVideo && this.options.liveOtherVideo.length) {
        this.options.liveOtherVideo.forEach((current1) => {
          if (current1.other_video) {
            current1.other_video.forEach((current2) => {
              if (current2.rate) {
                var isCurrent = false

                current2.rate.forEach((current3) => {
                  if (current3._id === this.options.part_id) {
                    isCurrent = true
                    current3.selection = true
                  }
                })

                if (isCurrent) {
                  qualityList = current2.rate
                }
              }
            })
          }
        })
      }

      if (this.options.qualityList && this.options.qualityList.length) {
        qualityList = this.options.qualityList
      }

      return qualityList
    },
    quality () {
      if (!this.qualityList.length) return ''

      var qualityInfo = this.qualityList.find((current) => {
        return current.selection
      })

      return qualityInfo.title
    }
  },

  methods: {
    handleEntry () {
      this.$set(this, 'display', true)
    },
    handleLeave () {
      if (this.userAgent.isPc) {
        this.$set(this, 'display', false)
      }
    },
    handleClick () {
      if (this.display) {
        this.$set(this, 'display', false)
      } else {
        this.$set(this, 'display', true)
      }
    },
    changeQuality (qualityInfo) {
      this.$set(this, 'display', false)
      // 切换画质目前只存在于huaren的live_play
      this.options.changeQuality && this.options.changeQuality(qualityInfo)
    }
  }
}
</script>

<style lang="scss">
.vjs-quality-button {
  position: relative;
  font-size: 16px;

  .vjs-quality-button__layout {
    width: 100%;
    height: 39px;
    line-height: 24px;
    margin-top: 15px;

    &:hover {
      .vjs-quality-button__text {
        color: #ff920b;
      }
    }
  }

  .vjs-iconfont.vjs-quality-button__text {
    padding: 0 10px 0 15px;
    border-radius: 15px;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;

    &::after {
      content: '\e622';
      display: inline-block;
      transform: rotateX(180deg);
    }
  }

  .vjs-quality-button__control {
    position: absolute;
    left: 50%;
    bottom: 38px;
    z-index: 60;
    padding-bottom: 8px;
    line-height: 30px;
    transform: translate(-50%, 0);
    text-align: center;
  }

  .vjs-quality-button__control-list {
    padding: 10px 30px;
    background: rgba(0, 0, 0, .8);
    border-radius: 5px;
    margin: 0;
    overflow: hidden;
  }

  .vjs-quality-button__control-item {
    display: block;
    list-style-type:none;
    white-space: nowrap;

    &:hover {
      color: #ff920b;
      cursor: pointer;
    }

    &.selection {
      color: #ff920b;
    }
  }
}

/* @media screen and (max-width: 500px) {
  .vjs-quality-button {
    display: none;
  }
} */

.mod_player .vjs-quality-button {
  display: none;
}
</style>
