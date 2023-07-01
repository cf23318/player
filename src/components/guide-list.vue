通过 z-index 的方式，越往后的越先显示

<template>
  <div v-if="visible" class="vjs-guide-list">
    <img v-if="visibleBarrageColorGuide" class="vjs-guide-list__photo" src="~assets/img/video_barrage_color_guide.png" @click="hideBarrageColorGuide" />

    <img v-if="visiblePictureInPictureGuide" class="vjs-guide-list__photo" src="~assets/img/video_picture_in_picture_guide2.png" @click="hidePictureInPictureGuide" />

    <img v-if="visibleBarrageGuide" class="vjs-guide-list__photo" src="~assets/img/video_barrage_guide.png" @click="hideBarrageGuide" />
  </div>
</template>

<script>
import videoLocal from '@/config/video-local'

export default {
  name: 'guide-list',

  props: {
    options: {
      type: Object,
      required: true
    },
    otherDisplayState: {
      type: Boolean,
      required: true
    },
    userAgent: {
      type: Object,
      required: true
    },
    fullscreenState: {
      type: Boolean,
      required: true
    },
    pageFullscreenState: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      isVisibleBarrageColorGuide: false,
      isVisiblePictureInPictureGuide: false,
      isVisibleBarrageGuide: false
    }
  },

  computed: {
    visible () {
      return false
      // return this.visibleBarrageColorGuide || this.visiblePictureInPictureGuide || this.visibleBarrageGuide
    },

    visibleBarrageColorGuide () {
      return this.options.customControl.isBarrage && this.otherDisplayState && this.isVisibleBarrageColorGuide && (this.fullscreenState || this.pageFullscreenState)
    },

    visiblePictureInPictureGuide () {
      return this.options.customControl.isPictureInPicture && this.otherDisplayState && this.isVisiblePictureInPictureGuide
    },

    visibleBarrageGuide () {
      return this.options.customControl.isBarrage && this.otherDisplayState && this.isVisibleBarrageGuide
    }
  },

  mounted () {
    // this.checkVisibleBarrageColorGuide()
    // this.checkVisiblePictureInPictureGuide()
    // this.checkVisibleBarrageGuide()
  },

  methods: {
    checkVisibleBarrageColorGuide () {
      if (!this.options.customControl.isBarrage) return

      videoLocal
        .getItem('lastWatchedBarrageColorGuide')
        .then((data) => {
          if (!data) {
            this.$set(this, 'isVisibleBarrageColorGuide', true)
          }
        })
        .catch(() => {})
    },

    hideBarrageColorGuide () {
      this.$set(this, 'isVisibleBarrageColorGuide', false)
      videoLocal.setItem('lastWatchedBarrageColorGuide', new Date().getTime())
    },

    checkVisiblePictureInPictureGuide () {
      videoLocal
        .getItem('lastWatchedPictureInPictureGuide')
        .then((data) => {
          if (!data) {
            this.$set(this, 'isVisiblePictureInPictureGuide', true)
          }
        })
        .catch(() => {})
    },

    hidePictureInPictureGuide () {
      this.$set(this, 'isVisiblePictureInPictureGuide', false)
      videoLocal.setItem('lastWatchedPictureInPictureGuide', new Date().getTime())
    },

    checkVisibleBarrageGuide () {
      if (!this.options.customControl.isBarrage) return

      videoLocal
        .getItem('lastWatchedBarrageGuide2')
        .then((data) => {
          if (!data) {
            this.$set(this, 'isVisibleBarrageGuide', true)
          }
        })
        .catch(() => {})
    },

    hideBarrageGuide () {
      this.$set(this, 'isVisibleBarrageGuide', false)
      videoLocal.setItem('lastWatchedBarrageGuide2', new Date().getTime())
    }
  }
}
</script>

<style lang="scss">
.vjs-guide-list {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 40;
  width: 100%;
  height: 100%;
  cursor: pointer;
  background: #000;

  .vjs-guide-list__photo {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
