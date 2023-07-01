<template>
  <div class="vjs-mosaic" v-if="formatSize" :style="{left: `${formatSize.left}%`, right: `${formatSize.right}%`, width: `${formatSize.width}%`, paddingBottom: `${formatSize.height}%`}"></div>
</template>

<script>
export default {
  name: 'mosaic',

  props: {
    size: {
      type: String
    }
  },

  computed: {
    formatSize () {
      if (!this.size) return

      const size = this.size.split(',')

      return {
        left: size[0],
        right: size[1],
        width: size[2],
        height: size[3]
      }
    }
  }
}
</script>

<style>
.vjs-mosaic {
  position: absolute;
  background: #bfbfbf;
  filter: blur(3px);
}
</style>
