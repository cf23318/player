<template>
  <div
    v-if="visible"
    id="vjs-barrage-button"
    :class="{'vjs-disabled': disabled, selected: value}"
    title="弹幕开关"
  >
    <div id="vjs-barrage-button__container" tabindex="3" v-clickAndKeydown="handleClick">
      <i class="point"></i>弹幕
    </div>
  </div>
</template>

<script>
export default {
  name: 'barrage-button',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    value: {
      type: Boolean,
      default: true,
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
      this.$emit('input', !this.value)
    }
  }
}
</script>

<style>
  #vjs-barrage-button {
    width: 75px;
    height: 100%;
    padding: 0 10px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
  }

  @media screen and (max-width: 500px) {
    #vjs-barrage-button {
      display: none;
    }
  }

  .vjs-live #vjs-barrage-button {
    display: none;
  }

  .vjs-mobi #vjs-barrage-button {
    display: none;
  }

  .mod_player #vjs-barrage-button{
    display: none;
  }

  #vjs-barrage-button.selected {
    color: #ff920b;
  }

  .vjs-custom-player:not(.vjs-ipad) #vjs-barrage-button:hover:not(.selected) {
    color: #fff;
  }

  #vjs-barrage-button #vjs-barrage-button__container {
    position: relative;
    width: 100%;
    height: 24px;
    line-height: 22px;
    padding: 0 10px 0 18px;
    border-radius: 15px;
    border: 1px solid #DFDFDF;
    margin-top: 15px;
  }

  #vjs-barrage-button.selected #vjs-barrage-button__container {
    border-color: #ff920b;
  }

  .vjs-custom-player:not(.vjs-ipad) #vjs-barrage-button:hover:not(.selected) #vjs-barrage-button__container {
    border-color: #ff920b;
    background: #ff920b;
  }

  #vjs-barrage-button .point {
    display: inline-block;
    position: absolute;
    top: 3px;
    left: 8px;
    width: 6px;
    height: 6px;
    background-color: rgba(255, 255, 255, .7);
    margin: 5px 4px 0 0;
    border-radius: 50%;
  }

  #vjs-barrage-button.selected .point {
    box-sizing: content-box;
    top: 0px;
    left: 5px;
    border: 3px #4b2c24 solid;
    background: #ff920b;
  }
</style>
