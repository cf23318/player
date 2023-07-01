<template>
  <div
    v-if="visible"
    v-show="display"
    id="vjs-barrage-input"
    :class="{'vjs-disabled': disabled}"
    title="点击发送弹幕"
    tabindex="3"
  >
    <div :class="['vjs-barrage-input__layout', {'visible': visibleInput}]">
      <div class="vjs-iconfont vjs-barrage-input__icon" @click="switchVisible" />

      <div v-show="!visibleInput" class="vjs-barrage-input__switch" @click="switchVisible">发弹幕</div>

      <form v-show="visibleInput" class="vjs-barrage-input__input-layout" @submit="handleSubmit">
        <input ref="input" type="text" class="vjs-barrage-input__input" :value="content" placeholder="据说发弹幕可以变帅变美哦！" maxlength="30" @input="eventSetContent" />

        <button type="submit" class="vjs-barrage-input__button">发送</button>

        <i class="vjs-iconfont vjs-barrage-input__color-barrage" @click="toggleBarragePopup" />
      </form>

      <div class="vjs-barrage-style-popup" v-show="visibleBarrageColorPopup" @mouseleave="hideBarrageColorPopup">
        <div class="vjs-barrage-style-popup__title">弹幕样式</div>

        <div class="vjs-barrage-style-popup__small-title" v-if="options.barrage.colorList && options.barrage.colorList.length">弹幕颜色</div>
        <div class="vjs-barrage-style-popup__color-list" v-if="options.barrage.colorList && options.barrage.colorList.length">
          <div
            v-for="info in options.barrage.colorList"
            :key="info.tid"
            class="vjs-barrage-style-popup__color-item vjs-iconfont"
            :class="{selected: selectedColor === info.color}"
            :style="{ color: `#${info.color}`, borderColor: `#${info.color}` }"
            @click="selectColor(info, true)"
            v-text="info.name"
          />
        </div>

        <div class="vjs-barrage-style-popup__small-title">弹幕设置</div>
        <div class="vjs-barrage-style-popup__setting-list">
          <div class="vjs-barrage-style-popup__setting-item vjs-iconfont" :class="{selected: visibleBarrageColor}" @click="setVisibleBarrageColorState(true, true)">正常显示</div>
          <div class="vjs-barrage-style-popup__setting-item vjs-iconfont" :class="{selected: !visibleBarrageColor}" @click="setVisibleBarrageColorState(false, true)">单色显示</div>
        </div>

        <div class="vjs-barrage-style-popup__warn-popup" v-show="visibleWarn">
          <div class="vjs-barrage-style-popup__warn-popup__title" v-text="warnMessage" />
          <div class="vjs-barrage-style-popup__warn-popup__close" @click="hideWarn">关闭</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'barrage-input',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    visibleBarrageColor: {
      type: Boolean,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true,
      default: false
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
      visibleInput: false,
      content: '',
      selectedColor: '',
      visibleBarrageColorPopup: false,
      visibleWarn: false,
      warnMessage: ''
    }
  },

  computed: {
    display () {
      if (this.fullscreenState || this.pageFullscreenState) {
        return this.options.customControl.isBarrageInputInFullscreen
      }

      return this.options.customControl.isBarrageInputInNormalWindow
    }
  },

  watch: {
    visibleInput (newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.input.focus()
        })
      }
    },

    'options.barrage.colorList': {
      handler (newVal) {
        if (newVal && newVal.length) {
          this.$set(this, 'selectedColor', newVal[0].color)
        }
      },
      immediate: true
    }
  },

  methods: {
    eventSetContent (ev) {
      this.setContent(ev.target.value, true)
    },

    setContent (newVal, hasCurrent) {
      this.$set(this, 'content', newVal)

      if (hasCurrent && this.options.onChangeBarrageContent) this.options.onChangeBarrageContent(newVal)
    },

    switchVisible () {
      if (this.options.clickBarrageInputSwitch) {
        if (this.options.clickBarrageInputSwitch(!this.visibleInput)) {
          this.$set(this, 'visibleInput', !this.visibleInput)
        }
      } else {
        this.$set(this, 'visibleInput', !this.visibleInput)
      }
    },

    toggleBarragePopup () {
      const newState = !this.visibleBarrageColorPopup
      this.$set(this, 'visibleBarrageColorPopup', newState)
      if (this.options.onClickBarragePopup) this.options.onClickBarragePopup(newState)
    },

    hideBarrageColorPopup () {
      this.$set(this, 'visibleBarrageColorPopup', false)
    },

    selectColor (info, hasCurrent) {
      const { color, canUse, hint } = info

      if (canUse) {
        this.$set(this, 'selectedColor', color)
        if (this.options.onChangeBarrageColor && hasCurrent) this.options.onChangeBarrageColor(info)
      } else {
        this.$set(this, 'visibleWarn', true)
        this.$set(this, 'warnMessage', hint)
      }
    },

    setVisibleBarrageColorState (state, hasCurrent) {
      this.$emit('update:visibleBarrageColor', state)

      if (this.options.onChangeVisibleBarrageColor && hasCurrent) this.options.onChangeVisibleBarrageColor(state)
    },

    hideWarn () {
      this.$set(this, 'visibleWarn', false)
    },

    handleSubmit (ev) {
      ev.preventDefault()

      const content = this.content.trim()

      if (!content) return

      this.setContent('', true)
      this.$emit('addBarrage', { text: content, color: this.selectedColor })

      if (this.options.sendBarrage) {
        this.options.sendBarrage({
          sec: this.currentTime,
          content: content,
          // font: 12,
          color: this.selectedColor
        })
      }
    }
  }
}
</script>

<style lang="scss">
#vjs-barrage-input {
  height: 100%;
  line-height: 30px;
  padding: 0 10px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;

  .vjs-barrage-input__layout {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    width: 66px;
    height: 30px;
    border-radius: 16px;
    margin-top: 11px;
    // background: #333333;
    background: #292929;
    // overflow: hidden;
    transition: width .3s;

    &.visible {
      width: 220px;
    }
  }

  .vjs-barrage-input__icon {
    margin-left: 6px;
    line-height: 25px;

    &::before {
      content: '\e648';
      width: 18px;
      height: 18px;
      font-size: 12px;
    }
  }

  .vjs-barrage-input__switch {
    padding-left: 4px;
    font-size: 12px;
  }

  .vjs-barrage-input__input-layout {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    width: 220px;
    height: 30px;
    padding-right: 1px;
  }

  .vjs-barrage-input__input {
    width: 100%;
    height: 100%;
    padding: 0 6px 0 6px;
    border: 0;
    background: transparent;
    color: #fff;
    font-size: 12px;
  }

  .vjs-barrage-input__button {
    flex-shrink: 0;
    position: relative;
    top: 1px;
    width: 52px;
    height: 28px;
    line-height: 28px;
    border-radius: 0 16px 16px 0;
    border: 0;
    margin-left: 30px;
    background: linear-gradient(90deg,rgba(255,133,11,1) 0%,rgba(255,89,84,1) 100%);
    text-align: center;
    cursor: pointer;
  }

  .vjs-barrage-input__color-barrage {
    position: absolute;
    right: 56px;
    top: 0;
    display: block;
    width: 24px;
    height: 24px;
    font-size: 24px;
    cursor: pointer;
    transition: color 0.2s;
    color: #CCCCCC;

    &::before {
      content: '\e65e';
    }

    &:hover {
      color: #5CB9FF;
    }
  }

  .vjs-barrage-style-popup {
    position: absolute;
    z-index: 99999;
    left: 0;
    bottom: 30px;
    width: 363px;
    padding: 30px 30px 40px;
    background: rgba(0,0,0,0.85);
    border-radius: 4px 4px 0px 0px;
    color: #fff;
    user-select: none;

    .vjs-barrage-style-popup__title {
      height: 21px;
      line-height: 21px;
      font-size: 15px;
      text-align: center;
    }

    .vjs-barrage-style-popup__small-title {
      height: 18px;
      line-height: 18px;
      margin-top: 23px;
      font-size: 13px;
    }

    .vjs-barrage-style-popup__color-list {
      display: flex;
      flex-wrap: wrap;
      width: calc(100% + 26px);
      margin-top: 10px;
    }

    .vjs-barrage-style-popup__color-item {
      position: relative;
      width: 56px;
      height: 28px;
      line-height: 27px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,1);
      margin-right: 26px;
      margin-top: 15px;
      font-size: 13px;
      text-align: center;
      cursor: pointer;

      &:nth-child(-n+4) {
        margin-top: 0px;
      }
    }

    .vjs-barrage-style-popup__setting-list {
      display: flex;
      margin-top: 10px;
    }

    .vjs-barrage-style-popup__setting-item {
      position: relative;
      width: 82px;
      height: 28px;
      line-height: 27px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,1);
      margin-right: 21px;
      font-size: 13px;
      text-align: center;
      cursor: pointer;
    }

    .vjs-barrage-style-popup__color-item,
    .vjs-barrage-style-popup__setting-item {
      &.selected {
        &::before {
          content: '\e604';
          position: absolute;
          right: -1px;
          bottom: -1px;
          width: 16px;
          height: 16px;
          line-height: 15px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.85);
          background: #5CB9FF;
          color: #fff;
          font-size: 10px;
        }
      }
    }

    .vjs-barrage-style-popup__warn-popup {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 188px;
      height: 110px;
      background:rgba(255,255,255,1);
      border-radius: 9px;
      margin-top: -55px;
      margin-left: -94px;
      user-select: none;
    }

    .vjs-barrage-style-popup__warn-popup__title {
      margin-top: 30px;
      font-size: 12px;
      color: #000;
      text-align: center;
    }

    .vjs-barrage-style-popup__warn-popup__close {
      width: 74px;
      height: 26px;
      line-height: 25px;
      border-radius: 13px;
      background: #1F93EA;
      margin: 10px auto 0;
      text-align: center;
      color: #fff;
      cursor: pointer;
    }
  }

}

.vjs-mobi #vjs-barrage-input {
  display: none;
}

// 在全屏状态下，弹幕宽度需要变宽
.vjs-fullscreen,
.vjs-page-fullscreen {
  #vjs-barrage-input {
    .vjs-barrage-input__layout {
      &.visible {
        width: 466px;
      }
    }

    .vjs-barrage-input__input-layout {
      width: 466px;
    }
  }
}
</style>
