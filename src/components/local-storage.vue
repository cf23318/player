<template>
  <div id="vjs-local-storage"></div>
</template>

<script>
import videoOptions from '@/config/video-options'

import { cloneDeep, isArray, pick } from 'lodash'
import { advancedDebounce, closure, deepMerge } from 'utils'

export default {
  name: 'local-storage',

  props: {
    options: {
      type: Object,
      required: true
    },
    localStorageSettingName: {
      type: String,
      required: true
    },
    userAgent: {
      type: Object,
      required: true
    },
    state: {
      type: Object,
      required: true
    },
    currentTime: {
      type: Number
    },
    watchTime: {
      type: Number
    },
    duration: {
      type: Number
    }
  },

  data () {
    return {
      lastSendValidsec: 0,
      saveTimeInterval: 60,
      // 一观看就记录
      lastSaveTime: -59,
      requestParam: {}
    }
  },

  watch: {
    currentTime (newVal) {
      // 当观看时长相比于上次 大于或小于多少秒，保存一次历史纪录
      if (
        newVal < this.lastSaveTime - this.saveTimeInterval ||
        newVal > this.lastSaveTime + this.saveTimeInterval
      ) {
        this.$set(this, 'lastSaveTime', newVal)
        this.saveDebounce(['all'])
      }
    },
    // 当修改需要缓存的参数时，自动保存
    'state.volume' () {
      this.saveDebounce(['setting'])
    },
    'state.muted' () {
      this.saveDebounce(['setting'])
    },
    'state.nextPart' () {
      this.saveDebounce(['setting'])
    },
    'state.jumpOpEd' () {
      this.saveDebounce(['setting'])
    },
    'state.barrage' () {
      this.saveDebounce(['setting'])
    },
    'state.barrageColor' () {
      this.saveDebounce(['setting'])
    }
  },

  methods: {
    reset () {
      deepMerge(this.$data, this.$options.data())
    },
    saveDebounce: closure(function () {
      return advancedDebounce({
        lead: function () {
        },
        process: function () {
        },
        trail: function () {
          this.saveInfo(arguments)
        },
        maxWait: 1000,
        time: 1000
      })
    }),
    saveInfo (typeList) {
      if (isArray(typeList)) {
        typeList.forEach((type) => {
          switch (type) {
            case 'all':
              this.setAll()
              break
            case 'setting':
              this.setSetting()
              break
            case 'time':
              this.setTime()
              break
          }
        })
      } else {
        this.setAll()
      }
    },
    setAll () {
      this.setSetting()
      this.setTime()
    },
    setSetting () {
      // 通过参数控制，不使用本地功能
      if (!this.options.hasUseLocalSetting) return

      let setting = pick(cloneDeep(this.state), [
        'volume', 'muted',
        'nextPart', 'jumpOpEd', 'barrage', 'barrageColor'
      ])
      videoOptions.setItem(this.localStorageSettingName, deepMerge(setting, {
        cachedVersion: this.state.currVersion
      }))
    },
    setTime () {
      let currentTime = parseInt(this.currentTime)
      let duration = this.duration
      let validsec = parseInt(this.watchTime - this.lastSendValidsec)

      if (this.options.watchHistory) {
        this.options.watchHistory({
          currentTime,
          validsec: Math.max(0, validsec),
          duration,
          platform: this.userAgent.isPc ? 'pc' : 'wap' // 平台
        })
      }
      this.$set(this, 'lastSendValidsec', this.watchTime)
    }
  }
}
</script>

<style>
#vjs-local-storage {
  display: none !important;
}
</style>
