<template>
  <div
    id="vjs-time-display"
    class="vjs-control-bar__element"
    title="当前播放时间/总时间"
  >
    <span v-text="formatCurrentTime"></span>
    /
    <span v-text="formatDuration"></span>
  </div>
</template>

<script>
import { playTimeformat } from 'utils'

export default {
  name: 'time-display',

  props: {
    videoType: {
      type: String,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    timeFormat: {
      type: String,
      required: false,
      default: ''
    }
  },

  computed: {
    formatCurrentTime () {
      return playTimeformat(this.videoType === 'normal' ? this.currentTime : 0, this.timeFormat)
    },
    formatDuration () {
      return playTimeformat(this.videoType === 'normal' ? this.duration : 0, this.timeFormat)
    }
  }
}
</script>

<style lang="scss">
#vjs-time-display {
  flex-shrink: 0;
  display: flex;
  width: auto;
  margin: 0 10px;
  cursor: default;
}

.vjs-live #vjs-time-display {
  display: none !important;
}
</style>
