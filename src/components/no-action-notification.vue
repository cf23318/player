<template>
  <div class="vjs-no-action-notification" v-if="visible">
    <div class="vjs-no-action-notification__layout">
      <div class="vjs-no-action-notification__button-layout">
        <div class="vjs-no-action-notification__next" @click="nextPart"><i class="vjs-iconfont vjs-no-action-notification__play-icon" />播放下一集</div>
        <div class="vjs-no-action-notification__cancel" @click="close($event)">取消</div>
      </div>

      <div class="vjs-no-action-notification__propmt">检测到您长时间未有操作，请确认是否播放下一集</div>
    </div>
  </div>
</template>

<script>
import { deepMerge } from 'utils'

export default {
  name: 'no-action-notification',

  props: {
    options: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      visible: false
    }
  },

  methods: {
    reset () {
      deepMerge(this.$data, this.$options.data())
    },
    show () {
      this.$set(this, 'visible', true)
    },
    nextPart () {
      if (this.options.onNoActionNotificationNextPart) this.options.onNoActionNotificationNextPart()
      this.$set(this, 'visible', false)
      this.$emit('nextPart')
    },
    // 关闭窗口
    close (ev) {
      ev.stopPropagation()
      ev.preventDefault()
      if (this.options.onNoActionNotificationClose) this.options.onNoActionNotificationClose()
      this.$set(this, 'visible', false)
    }
  }
}
</script>

<style lang="scss">
.vjs-no-action-notification {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 61;
  width: 100%;
  height: 100%;
  background: #000;

  .vjs-no-action-notification__layout {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-220px, -62px);
  }

  .vjs-no-action-notification__button-layout {
    display: flex;
    justify-content: space-between;
    width: 400px;
    margin: 0 auto;

    .vjs-no-action-notification__next {
      width: 180px;
      height: 54px;
      line-height: 54px;
      border-radius: 27px;
      background: #5CB9FF;
      text-align: center;
      color: #fff;
      font-size: 18px;
      cursor: pointer;

      .vjs-no-action-notification__play-icon::before {
        content: '\e634';
        font-size: 18px;
        margin-right: 5px;
      }
    }

    .vjs-no-action-notification__cancel {
      width: 180px;
      height: 54px;
      line-height: 54px;
      border: 1px solid #979797;
      border-radius: 27px;
      text-align: center;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
    }
  }

  .vjs-no-action-notification__propmt {
    line-height: 28px;
    margin-top: 40px;
    font-size: 22px;
    white-space: nowrap;
  }
}
</style>
