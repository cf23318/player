<template>
  <div id="vjs-next-part" class="vjs-control-bar__element vjs-iconfont" :class="{'disabled': !disabled}" title="下一集" @click="$emit('on-click', $event)">&#xe607;</div>
</template>

<script>
export default {
  name: 'next-part',

  props: {
    disabled: {
      type: Boolean,
      required: true,
      default: false
    }
  }
}
</script>

<style>
#vjs-next-part {
  font-size: 14px;
}

#vjs-next-part.disabled {
  cursor: not-allowed;
  color: rgba(166, 166, 166, .5);
}

#vjs-next-part:not(.disabled):hover {
  color: #1f93ea;
}

@media screen and (max-width: 500px) {
  #vjs-next-part {
    display: none !important;
  }
}

.vjs-live #vjs-next-part {
  display: none !important;
}
</style>
