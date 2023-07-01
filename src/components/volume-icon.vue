<template>
  <div id="vjs-volume-icon" class="vjs-iconfont" v-text="`${(volume * 100).toFixed(0)}%`"></div>
</template>

<script>
export default {
  name: 'volume-icon',

  props: {
    volume: {
      type: Number,
      required: true
    }
  }
}
</script>

<style>
#vjs-volume-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  text-align: center;
  line-height: 1.5em;
  font-size: 16px;
  transform: translate(-50%, -50%);
}

#vjs-volume-icon::before {
  content: '\e87a';
  display: block;
  font-size: 34px;
  margin-bottom: 5px;
}
</style>
