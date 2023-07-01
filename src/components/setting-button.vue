<template>
  <div class="vjs-setting-button" title="设置" tabindex="4">
    <div class="vjs-setting-button__layout" ref="native">
      <i class="vjs-iconfont vjs-setting-button__icon" v-clickAndKeydown="handleClick">&#xe626;</i>

      <div class="vjs-setting-button__control" v-show="display">
        <ul class="vjs-setting-button__control-list">
          <li class="vjs-iconfont vjs-setting-button__control-item vjs-autoplay-button" :class="{'selected': nextPart}" tabindex="5" v-clickAndKeydown="handleNextPart">自动连播</li>
          <li class="vjs-iconfont vjs-setting-button__control-item vjs-jump-prologue-and-epilogue-button" :class="{'selected': jumpOpEd}" tabindex="6" v-clickAndKeydown="handleJumpOpEd">自动跳过片头片尾</li>
          <li class="vjs-iconfont vjs-setting-button__control-item vjs-switch-light" :class="{'selected': switchLight}" tabindex="7" v-clickAndKeydown="handleSwitchLight">开/关 灯</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'setting-button',

  props: {
    options: {
      type: Object,
      required: true
    },
    userAgent: {
      type: Object,
      required: true
    },
    nextPart: {
      type: Boolean,
      required: true
    },
    jumpOpEd: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      display: false,
      switchLight: false
    }
  },

  mounted () {
    if (document.body.classList.contains('dark_theme')) {
      this.$set(this, 'switchLight', true)
    } else {
      this.$set(this, 'switchLight', false)
    }

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
      this.$set(this, 'display', false)
    },
    handleClick () {
      // 手机采取点击开关
      if (this.display) {
        this.$set(this, 'display', false)
      } else {
        this.$set(this, 'display', true)
      }
    },
    handleNextPart () {
      const newState = !this.nextPart
      this.$emit('update:nextPart', newState)
      if (this.options.onChangeSettingNextPart) this.options.onChangeSettingNextPart(newState)
    },
    handleJumpOpEd () {
      const newState = !this.jumpOpEd
      this.$emit('update:jumpOpEd', newState)
      if (this.options.onChangeSettingJumpOpEd) this.options.onChangeSettingJumpOpEd(newState)
    },
    handleSwitchLight () {
      if (this.switchLight) {
        document.body.classList.remove('dark_theme')
      } else {
        document.body.classList.add('dark_theme')
      }

      const newState = !this.switchLight
      this.$set(this, 'switchLight', newState)
      if (this.options.onChangeSettingSwitchLight) this.options.onChangeSettingSwitchLight(newState)
    }
  }
}
</script>

<style lang="scss">
.vjs-setting-button {
  position: relative;
  width: 50px;
  height: 100%;

  .vjs-setting-button__layout {
    position: relative;
    width: 100%;
    height: 39px;
    line-height: 24px;
    margin-top: 15px;
    cursor: pointer;

    &:hover {
      .vjs-iconfont.vjs-setting-button__icon {
        color: #1f93ea;
        animation: flutter .1s linear;
      }
    }
  }

  .vjs-iconfont.vjs-setting-button__icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 0 13px;
    font-size: 23px;
    cursor: pointer;
    text-align: center;
  }

  .vjs-setting-button__control {
    position: absolute;
    right: -30px;
    bottom: 37px;
    z-index: 60;
    padding-bottom: 10px;
  }

  .vjs-setting-button__control-list {
    width: 150px;
    padding: 10px 10px;
    background-color: rgba(0,0,0,.8);
    border-radius: 4px;
    margin: 0;
    list-style: none;
    text-align: left;
    line-height: 20px;
    font-weight: 0;
  }

  .vjs-iconfont.vjs-setting-button__control-item {
    cursor: pointer;
    font-size: 12px;

    &:before {
      content: '\e628';
    }

    &:hover {
      color: #ff920b;
    }

    &.selected {
      color: #ff920b;

      &:before {
        content: '\e627';
      }
    }
  }
}

.vjs-live .vjs-setting-button {
  display: none;
}

@media screen and (max-width: 500px) {
  .vjs-setting-button {
    display: none;
  }
}

@keyframes flutter {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(60deg);
  }
}
</style>
