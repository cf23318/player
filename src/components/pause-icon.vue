<template>
  <div
    id="vjs-pause-icon"
    class="vjs-iconfont"
    title="播放"
    @click="handleClick($event)"
  ></div>
</template>

<script>
export default {
  name: 'pause-icon',

  methods: {
    handleClick (ev) {
      this.$emit('play', 'pause icon')

      ev.stopPropagation()
    }
  }
}
</script>

<style>
#vjs-pause-icon {
  display: none;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10;
  width: 100px;
  height: 100px;
  line-height: 100px;
  transform: translate(-50%, -50%);
  text-align: center;
  cursor: pointer;
}

#vjs-pause-icon::before {
  content: '\e634';
  font-size: 34px;
}

.vjs-paused #vjs-pause-icon {
  display: block;
}
</style>
