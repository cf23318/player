<template>
  <div id="vjs-collection" @click="handleClick">
    <div id="vjs-not-collected" v-if="!isCollect">
      <i class="vjs-iconfont vjs-collected__icon"></i>
      收藏该剧
    </div>

    <div id="vjs-collected" v-if="isCollect">
      <i class="vjs-iconfont vjs-collected__icon"></i>
      收藏成功
    </div>
  </div>
</template>

<script>
export default {
  name: 'collection',

  props: {
    defaultCollect: {
      type: [Boolean, Number],
      required: true
    },
    toggleCollect: {
      type: Function,
      required: false,
      default: () => {}
    }
  },

  data () {
    return {
      isCollect: false
    }
  },

  created () {
    this.$set(this, 'isCollect', !!this.defaultCollect)
  },

  methods: {
    handleClick () {
      if (this.toggleCollect) {
        this.toggleCollect((isCollect) => {
          this.$set(this, 'isCollect', !!isCollect)
        })
      }
    }
  }
}
</script>

<style>
#vjs-collection {
  display: none;
  position: absolute;
  right: 20px;
  top: 4%;
  z-index: 10;
  width: 108px;
  height: 36px;
  line-height: 32px;
  font-size: 14px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.vjs-mobi #vjs-collection {
  display: none !important;
}

.vjs-fullscreen.vjs-pc #vjs-collection {
  right: 30px;
  top: 60px;
}

.vjs-paused #vjs-collection {
  display: block;
}

#vjs-collection #vjs-not-collected, #vjs-collection #vjs-collected {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .3);
  border-radius: 20px;
}

#vjs-collection #vjs-not-collected:hover, #vjs-collection #vjs-collected:hover {
  background: linear-gradient(90deg,rgba(255,133,11,1),rgba(255,89,84,1));
}

#vjs-collection #vjs-not-collected .vjs-collected__icon::before, #vjs-collection #vjs-collected .vjs-collected__icon::before {
  font-size: 18px;
}

#vjs-collection #vjs-not-collected .vjs-collected__icon::before {
  content: '\e621';
}

#vjs-collection #vjs-collected .vjs-collected__icon::before {
  content: '\e623';
}
</style>
