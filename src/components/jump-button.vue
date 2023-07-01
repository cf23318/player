<template>
  <div
    class="vjs-jump-button vjs-control-bar__element vjs-iconfont"
    :class="{'vjs-disabled': disabled}"
    :title="`${number > 0 ? '前进' : '后退'}${Math.abs(number)}秒`"
    v-html="number > 0 ? '&#xe62e;' : '&#xe62f;'"
    tabindex="2"
    v-clickAndKeydown="handleClick"></div>
</template>

<script>
export default {
  name: 'jump-button',

  props: {
    options: {
      type: Object,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  methods: {
    handleClick () {
      if (this.number < 0) {
        if (this.options.onBackward) this.options.onBackward()
      } else {
        if (this.options.onForward) this.options.onForward()
      }

      this.$emit('on-click', { number: this.number })
    }
  }
}
</script>

<style>
.vjs-jump-button {
}

.vjs-pc .vjs-jump-button:hover {
  color: #1f93ea;
}

.vjs-mobi .vjs-jump-button {
  display: none !important;
}

@media screen and (max-width: 500px) {
  .vjs-jump-button {
    display: none;
  }
}

.vjs-live .vjs-jump-button {
  display: none !important;
}

.mod_player .vjs-jump-button {
  display: none !important;
}
</style>
