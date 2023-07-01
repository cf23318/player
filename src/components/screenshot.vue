<template>
  <div
    v-show="visible && !displayState"
    id="vjs-screenshot"
    class="vjs-control-bar__element vjs-control-bar__button vjs-iconfont"
    :class="{'vjs-disabled': disabled}"
    title="截屏"
    tabindex="7"
    v-clickAndKeydown="handleClick"
  ></div>
</template>

<script>
export default {
  name: 'screenshot',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    options: {
      type: Object,
      required: true
    },
    dom: {
      type: Object,
      required: true
    },
    userAgent: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  computed: {
    displayState () {
      return this.userAgent.browserParser.browser.name === 'Microsoft Edge' || this.userAgent.browserParser.browser.name === 'Safari'
    }
  },

  methods: {
    handleClick () {
      var video = this.dom.video
      var canvas = document.createElement('canvas')
      var ctx = canvas.getContext('2d')

      var width = 1920
      var height = 1080

      if (this.options.onScreenshot) this.options.onScreenshot()

      video.setAttribute('crossOrigin', 'anonymous')
      canvas.width = width
      canvas.height = height
      ctx.drawImage(video, 0, 0, width, height)

      if (
        this.userAgent.browserParser.browser.name === 'Internet Explorer' ||
        this.userAgent.browserParser.browser.name === 'Microsoft Edge'
      ) {
        var blob = canvas.msToBlob()
        navigator.msSaveBlob(blob, 'share.jpg')
      } else {
        // edited from https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill
        var binStr = atob(canvas.toDataURL().split(',')[1])
        var len = binStr.length
        var arr = new Uint8Array(len)

        for (var i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i)
        }

        var a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([arr]))
        a.download = 'share.jpg'

        var evt = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
        a.dispatchEvent(evt)
      }
    }
  }
}
</script>

<style>
#vjs-screenshot::before {
  content: '\e646';
  font-size: 21px;
}

.vjs-mobi #vjs-screenshot {
  display: none;
}

.mod_player #vjs-screenshot {
  display: none;
}
</style>
