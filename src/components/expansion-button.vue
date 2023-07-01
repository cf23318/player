<template>
  <div
    id="vjs-expansion-button"
    class="vjs-control-bar__element vjs-control-bar__button"
    v-if="expansion.click"
    @click="handlerClick"
    @mouseenter="handlerMouseenter"
    @mouseleave="handlerMouseleave">
    选集
  </div>
</template>

<script>
// 目前仅在客户端使用

export default {
  name: 'expansion-button',

  props: {
    expansion: {
      type: Object,
      required: true
    }
  },

  methods: {
    handlerClick: function (ev) {
      this.expansion.click && this.expansion.click(ev)
    },
    handlerMouseenter: function (ev) {
      this.expansion.mouseenter && this.expansion.mouseenter(ev)
    },
    handlerMouseleave: function (ev) {
      this.expansion.mouseleave && this.expansion.mouseleave(ev)
    }
  }
}
</script>

<style>

</style>
