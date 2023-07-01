<template>
  <div class="vjs-speed-button" :class="{'vjs-disabled': disabled}" title="n倍速">
    <div class="vjs-speed-button__layout" ref="native">
      <div class="vjs-iconfont vjs-speed-button__text" @click="handleClick">倍速</div>

      <div class="vjs-speed-button__control" v-show="display">
        <ul class="vjs-speed-button__control-list">
          <li
            v-for="speed in speedList"
            :key="speed"
            class="vjs-speed-button__control-item"
            v-text="`${speed}X`"
            :title="`${speed}X`"
            :class="{'selection': speed === playbackRate}"
            @click="handleSpeed(speed)"
          ></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'speed-button',

  props: {
    options: {
      type: Object,
      required: true
    },
    playbackRate: {
      type: Number,
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
      display: false,
      speedList: [5, 3, 2, 1.5, 1.25, 1, 0.75, 0.5]
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
    handleSpeed (speed) {
      this.$emit('update:playbackRate', speed)
      if (this.options.onChangePlaybackRate) this.options.onChangePlaybackRate(speed)
    }
  }
}
</script>

<style lang="scss">
.vjs-speed-button {
  position: relative;
  min-width: 68px;
  height: 54px;
  font-size: 16px;

  .vjs-speed-button__layout {
    width: 100%;
    height: 39px;
    line-height: 24px;
    margin-top: 15px;

    &:hover {
      .vjs-speed-button__text {
        color: #ff920b;
      }
    }
  }

  .vjs-iconfont.vjs-speed-button__text {
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

  .vjs-speed-button__control {
    position: absolute;
    left: 50%;
    bottom: 38px;
    z-index: 60;
    padding-bottom: 8px;
    line-height: 30px;
    transform: translate(-50%, 0);
    text-align: center;
  }

  .vjs-speed-button__control-list {
    padding: 10px 30px;
    background: rgba(0, 0, 0, .8);
    border-radius: 5px;
    margin: 0;
    overflow: hidden;
  }

  .vjs-speed-button__control-item {
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

@media screen and (max-width: 500px) {
  .vjs-speed-button {
    display: none;
  }
}

.vjs-live .vjs-speed-button,
.mod_player .vjs-speed-button {
  display: none;
}
</style>
