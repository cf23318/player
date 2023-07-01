<template>
  <div id="vjs-barrage" :class="{ 'pure-color': !visibleBarrageColor }" v-if="visible" :style="[{visibility: otherDisplayState ? 'initial' : 'hidden'}]">
    <div ref="barrageList" class="vjs-barrage__list"></div>

    <div ref="reportButton" class="vjs-iconfont vjs-barrage__report-button" @click="showReportPopup"><div class="vjs-barrage__report-icon"/>举报</div>

    <div class="vjs-barrage__report-popup" v-show="visibleReportPopup">
      <div class="vjs-barrage__report-popup-title">
        举报
        <div class="vjs-iconfont vjs-barrage__report-close" @click="closeReportPopup" />
      </div>

      <div class="vjs-barrage__report-popup-content">
        <div class="vjs-barrage__report-popup-content__title">举报内容</div>
        <div class="vjs-barrage__report-popup-content__report-content" v-text="currentSelectBarrageInfo && currentSelectBarrageInfo.text"></div>
        <div class="vjs-barrage__report-popup-content__title">您为什么要举报此信息？</div>
        <div class="vjs-barrage__report-popup-content__radio-layout">
          <label class="vjs-barrage__report-popup-content__label">
            <input type="radio" name="barrageReportType" value="1" :checked="reportValue === 1" @click="handleRadioSelect({value: 1, option: '剧透信息'})">
            <span class="vjs-barrage__report-popup-content__label-text">剧透信息</span>
          </label>
          <label class="vjs-barrage__report-popup-content__label">
            <input type="radio" name="barrageReportType" value="2" :checked="reportValue === 2" @click="handleRadioSelect({value: 2, option: '广告欺诈'})">
            <span class="vjs-barrage__report-popup-content__label-text">广告欺诈</span>
          </label>
          <label class="vjs-barrage__report-popup-content__label">
            <input type="radio" name="barrageReportType" value="3" :checked="reportValue === 3" @click="handleRadioSelect({value: 3, option: '色情淫秽'})">
            <span class="vjs-barrage__report-popup-content__label-text">色情淫秽</span>
          </label>
        </div>
        <div class="vjs-barrage__report-popup-content__radio-layout">
          <label class="vjs-barrage__report-popup-content__label">
            <input type="radio" name="barrageReportType" value="4" :checked="reportValue === 4" @click="handleRadioSelect({value: 4, option: '骚扰谩骂'})">
            <span class="vjs-barrage__report-popup-content__label-text">骚扰谩骂</span>
          </label>
          <label class="vjs-barrage__report-popup-content__label">
            <input type="radio" name="barrageReportType" value="5" :checked="reportValue === 5" @click="handleRadioSelect({value: 5, option: '暴力血腥'})">
            <span class="vjs-barrage__report-popup-content__label-text">暴力血腥</span>
          </label>
          <label class="vjs-barrage__report-popup-content__label">
            <input type="radio" name="barrageReportType" value="6" :checked="reportValue === 6" @click="handleRadioSelect({value: 6, option: '无效刷屏'})">
            <span class="vjs-barrage__report-popup-content__label-text">无效刷屏</span>
          </label>
          <label class="vjs-barrage__report-popup-content__label">
            <input type="radio" name="barrageReportType" value="7" :checked="reportValue === 7" @click="handleRadioSelect({value: 7, option: '其他'})">
            <span class="vjs-barrage__report-popup-content__label-text">其他</span>
          </label>
        </div>
      </div>

      <div class="vjs-barrage__report-popup-bottom">
        <button class="vjs-barrage__report-popup-button" @click="closeReportPopup">取消</button>
        <button class="vjs-barrage__report-popup-bottom-blue" @click="submitReportContent">提交</button>
      </div>
    </div>
  </div>
</template>

<script>
import { isBoolean, isObject, isArray, isInteger, cloneDeep } from 'lodash'
import { debuglog, deepMerge } from 'utils'

export default {
  name: 'barrage',

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    initSuccessful: {
      type: Boolean,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    onOff: {
      type: Boolean
    },
    options: {
      type: Object,
      required: true
    },
    playState: {
      type: Boolean,
      required: true
    },
    userAgent: {
      type: Object,
      required: true
    },
    otherDisplayState: {
      type: Boolean,
      required: true
    },
    visibleBarrageColor: {
      type: Boolean,
      required: true
    },
    startPrompt: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      // 弹幕列表
      barrageList: {},
      // 弹幕端，用来去重，防止重复拉取接口数据
      barrageSeg: {},
      // 最后一次循环发送弹幕的时间
      lastBarrageTime: -1,
      // 用来判断行数，防止拥挤
      rows: {},
      // 当前显示的弹幕数量
      currentBarrageNumber: 0,
      // 上一次观看的秒数，用来判断是否是快进
      lastWatchTime: 0,
      // 弹幕默认参数
      defaultBarageAttr: {
        // speed: 8000, // 速度
        // loop: false, // 是否循环播放
        scaleSmall: 0.5, // 字体最小倍数
        scaleBig: 3, // 字体最大倍数
        scale: 1, // 默认缩放比
        // opacity: '0.9', // 默认透明度
        // topBottomDanmuTime: 6000, // 顶端和低端弹幕持续时间
        // positionOptimize: false, // 是否位置优化，位置优化是指像AB站那样弹幕主要漂浮于区域上半部分
        maxCountInScreen: 40, // 屏幕上的最大的显示弹幕数目,弹幕数量过多时,优先加载最新的。
        maxCountPerSec: 10, // 每秒钟最多的弹幕数目,弹幕数量过多时,优先加载最新的。
        lineHeight: 40, // 行高
        paddingTop: 30, // 弹幕距离顶部的初始值
        paddingBottom: 70 // 弹幕最多
      },
      // 弹幕元素(div)默认属性
      defaultBarageElemAttr: {
        text: '', // 文字
        time: null, // 时间 s
        color: 'FFFFFF', // 默认颜色
        scale: 1, // 默认缩放比
        isSend: false // 是否加入过弹幕列表
      },
      // barrage z-index
      barrageZIndex: 1,
      // 隐藏举报按钮的定时器
      hideReportButtonTimer: null,
      // 是否显示举报弹窗
      visibleReportPopup: false,
      reportValue: 1,
      reportOption: '剧透信息',
      // 右击弹幕选中的内容
      rightClickSelectBarrageInfo: null,
      // 点击举报按钮时，把右击选中的内容负值给这个
      currentSelectBarrageInfo: null,
      // 是否显示初始弹幕
      isVisibleStartBarrage: false
    }
  },

  computed: {
    isOpenBarrage () {
      return window.performance && this.onOff && this.userAgent.isPc && this.initSuccessful && this.visible
    }
  },

  watch: {
    // initSuccessful (newVal) {
    //   if (newVal) {
    //     this.addFalseBarrage();
    //   }
    // },
    otherDisplayState (newVal) {
      if (!this.visible) return

      if (newVal) {
        this.empty()
      }
    },
    playState: {
      handler (newVal) {
        if (!this.visible) return

        if (newVal) {
          this.play()
        } else {
          this.pause()
        }
      },
      immediate: true
    },
    isOpenBarrage (newVal) {
      if (!this.visible) return

      if (newVal) {
        debuglog.log('barrage play')
        this.play()
        this.barrageLoop()
      } else {
        debuglog.log('barrage pause')
        this.pause()
        this.empty()
      }
    },
    currentTime (newVal) {
      if (!this.visible) return
      if (!this.isOpenBarrage) return

      // 快进快退清除内容
      var diff = newVal - this.lastWatchTime

      if (diff < -1 || diff > 2) {
        this.empty()
      }
      this.lastWatchTime = newVal

      // 当前弹幕段数
      let currentSegment = parseInt(this.currentTime / 600)

      // 获取当前段弹幕
      if (this.currentTime > 1 && !isBoolean(this.barrageSeg[currentSegment])) {
        this.getBarrage(currentSegment)
      }

      // 获取下一段弹幕
      if (!isBoolean(this.barrageSeg[currentSegment + 1]) && (currentSegment + 1) * 600 > this.currentTime > (currentSegment + 1) * 600 - 10) {
        this.getBarrage(currentSegment + 1)
      }
    },

    startPrompt (newVal) {
      if (!newVal) {
        this.$set(this, 'isVisibleStartBarrage', true)
      }
    }
  },

  mounted () {
    if (!this.visible) return

    this.addReportButtonEvent()
    this.getBarrage(0)

    // this.addFalseBarrage()
    // this.addFalseBarrage2()
  },

  methods: {
    addFalseBarrage () {
      // 发送虚假弹幕
      let arr = []
      for (let i = 0; i < 100; i++) {
        arr.push({
          _id: i,
          text: `${i}-${Array.from({ length: Math.random() * 50 + 1 }).map(() => parseInt(Math.random() * 9)).join('')}`,
          time: parseInt(i / 2)
          // like: '0'
        })
      }
      this.add(arr)
    },
    addFalseBarrage2 () {
      // 发送虚假弹幕
      const arr = []
      const data = { 'list': [{ '_id': '5c8b376df3ea1b9ed270c6cc', 'msg': 'send2', 'col': '#ffffff', 'sec': 1, 'fon': 12 }, { '_id': '5c8b3769f3ea1b9ed270c6c5', 'msg': 'send1', 'fon': 12, 'sec': 0, 'col': '#ffffff' }, { '_id': '5c8b3761f3ea1b9ed270c68e', 'msg': 'send', 'col': '#ffffff', 'sec': 0, 'fon': 12 }], 'count': 3 }
      data.list.map((info) => {
        arr.push({
          text: info.msg,
          time: info.sec
        })
      })
      this.add(arr)
    },
    reset () {
      if (!this.visible) return

      this.empty()
      this.$set(this, 'barrageList', {})
      this.$set(this, 'barrageSeg', {})
      this.$set(this, 'lastBarrageTime', -1)
      this.$set(this, 'lastWatchTime', 0)

      this.getBarrage(0)
    },
    addReportButtonEvent () {
      this.$refs.reportButton.addEventListener('mouseenter', () => {
        clearTimeout(this.hideReportButtonTimer)
      })

      this.$refs.reportButton.addEventListener('mouseleave', () => {
        clearTimeout(this.hideReportButtonTimer)

        this.$refs.reportButton.style.display = 'none'
      })
    },
    isEligibility (barrage) {
      return isObject(barrage) && barrage.text && isInteger(barrage.time)
    },
    add (barrage) {
      if (isArray(barrage)) {
        // 批量增加 获取后台
        barrage.forEach((barrage) => {
          if (this.isEligibility(barrage)) {
            if (!isArray(this.barrageList[barrage.time])) this.barrageList[barrage.time] = []

            this.barrageList[barrage.time].push(deepMerge({}, this.defaultBarageElemAttr, barrage))
          }
        })
      } else if (isObject(barrage)) {
        // 单个增加 用户输入
        if (this.isEligibility(barrage)) {
          if (!isArray(this.barrageList[barrage.time])) this.barrageList[barrage.time] = []

          this.barrageList[barrage.time].push(deepMerge({}, this.defaultBarageElemAttr, barrage))
        }
      }
    },
    empty () {
      this.$refs.barrageList.innerHTML = ''
      this.$TWEEN.removeAll()
      this.rows = {}
      this.currentBarrageNumber = 0
    },
    play () {
      if (window.performance) this.$TWEEN.play()
    },
    pause () {
      if (window.performance) this.$TWEEN.pause()
    },
    now () {
      return new Date().getTime()
    },
    /**
     * 防止重复添加弹幕
     */
    isRepeat (currentBarrageList) {
      if (this.playState === false) return false

      if (isArray(currentBarrageList) && currentBarrageList.length) {
        if (currentBarrageList[0].isSend === false || currentBarrageList[0].startTime !== this.lastBarrageTime) {
          currentBarrageList[0].isSend = true
          currentBarrageList[0].startTime = this.lastBarrageTime = this.now()
          return true
        }
      }

      return false
    },
    /**
     * 使用不同的速度
     */
    speed () {
      return 15000

      // if (multiple < 0.3) {
      //   return 10000;
      // } else if (multiple < 0.4) {
      //   return 9700;
      // } else if (multiple < 0.5) {
      //   return 9350;
      // } else {
      //   return 9000;
      // }
    },
    /**
     * 检测行数
     */
    checkRow () {
      let row = 0

      while (this.rows[row]) {
        row++
      }

      let height = row * this.defaultBarageAttr.lineHeight
      return height > this.$refs.barrageList.parentNode.parentNode.getBoundingClientRect().height - this.defaultBarageAttr.lineHeight - this.defaultBarageAttr.paddingTop - this.defaultBarageAttr.paddingBottom ? null : row
    },
    /**
     * 处理颜色
     */
    handleColor (color = '') {
      color = color.replace(/#/g, '')

      if (/^[a-zA-Z0-9]{3,3}$/.test(color)) {
        return `color: #${color};`
      } else if (/^[a-zA-Z0-9]{6,6}$/.test(color)) {
        return `color: #${color};`
      } else if (/^[a-zA-Z0-9]{6,6},[a-zA-Z0-9]{6,6}$/.test(color)) {
        const gradient = color.split(',')

        return `
          background-image: linear-gradient(to right, #${gradient[0]} 0px, #${gradient[1]} 100%);
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          text-shadow: none;`
      }

      return `color: #FFFFFF;`
    },
    /**
     * 循环读取弹幕 添加弹幕
     */
    barrageLoop () {
      if (!this.isOpenBarrage) return

      let currentBarrageList = this.barrageList[parseInt(this.currentTime)] || []

      // logo状态必须为隐藏 && 判断是否重复添加
      if (this.otherDisplayState && (this.isRepeat(currentBarrageList) || this.isVisibleStartBarrage)) {
        let boxStyle = this.$refs.barrageList.getBoundingClientRect()
        const startingPoint = parseInt(boxStyle.width + 100)

        if (this.isVisibleStartBarrage && isArray(this.options.barrage.startBarrageList)) {
          currentBarrageList = cloneDeep(currentBarrageList)
          const startBarrageList = this.options.barrage.startBarrageList.map((info) => ({ text: info.text, color: info.color, disabled: true }))
          currentBarrageList.unshift(...startBarrageList)

          this.$set(this, 'isVisibleStartBarrage', false)
        }

        currentBarrageList.forEach((currentBarrage, i) => {
          if (i > this.defaultBarageAttr.maxCountPerSec) return
          if (this.currentBarrageNumber > this.defaultBarageAttr.maxCountInScreen) return

          let currentRow = this.checkRow()
          // 所有位置已经被占满
          if (currentRow === null) return

          if (this.options.customControl.isBarrageDisabledFeatures) currentBarrage.disabled = true

          let boxDom = document.createElement('div')
          boxDom.className = 'vjs-barrage__item'
          if (currentBarrage.disabled) boxDom.className = 'vjs-barrage__item vjs-barrage__item-disabled'
          boxDom.style.cssText = `transform: translate3d(${startingPoint}px, 0, 0);`
          if (currentBarrage._id) boxDom.dataset.id = currentBarrage._id

          let textDom = document.createElement('span')
          textDom.className = 'vjs-barrage__item-text'
          textDom.style.cssText = this.handleColor(currentBarrage.color)
          textDom.innerText = currentBarrage.text

          let likeIcon = document.createElement('span')
          likeIcon.className = 'vjs-barrage__item-like-icon'

          let likeNum = document.createElement('span')
          likeNum.className = 'vjs-barrage__item-like-num'
          const hasLikeContent = !isNaN(currentBarrage.like) && Number(currentBarrage.like) !== 0
          likeNum.innerText = hasLikeContent ? currentBarrage.like : ''
          if (hasLikeContent) likeNum.classList.add('vjs-barrage__item-like-num-width')

          boxDom.appendChild(textDom)
          if (!currentBarrage.disabled) {
            boxDom.appendChild(likeIcon)
            boxDom.appendChild(likeNum)
          }

          this.$refs.barrageList.appendChild(boxDom)
          let divStyle = boxDom.getBoundingClientRect()

          let onlyOff = true
          this.rows[currentRow] = true
          this.currentBarrageNumber += 1

          const speed = this.speed(divStyle.width / boxStyle.width)
          const terminalPoint = -(divStyle.width < 800 ? 800 : divStyle.width)
          // position 会随着 tween 进行改变
          let position = { left: startingPoint }
          const tweenAnimation = new this.$TWEEN.Tween(position)
            .to({ left: terminalPoint }, speed)
            .onUpdate(() => {
              // 判断是否占据新弹幕的位置 row
              if (onlyOff && position.left + divStyle.width + 30 < boxStyle.width) {
                onlyOff = false
                this.rows[currentRow] = false
              }

              boxDom.style.transform = `translate3d(${parseInt(position.left)}px, ${currentRow * this.defaultBarageAttr.lineHeight + this.defaultBarageAttr.paddingTop}px, 0)`
            })
            .onComplete(() => {
              boxDom.parentNode.removeChild(boxDom)
              boxDom = null
              position = null
              divStyle = null
              this.currentBarrageNumber -= 1
            })
            .start(this.$TWEEN.currTweenTime)

          boxDom.addEventListener('click', () => {
            if (this.addLike(currentBarrage)) {
              boxDom.classList.add('liking')
              likeNum.innerText = !isNaN(likeNum.innerText) && Number(likeNum.innerText) ? parseInt(likeNum.innerText) + 1 : 1
              likeNum.classList.add('vjs-barrage__item-like-num-width')
            }
          })

          boxDom.addEventListener('mouseenter', () => {
            const zIndex = this.barrageZIndex + 1
            boxDom.style.zIndex = zIndex
            this.barrageZIndex = zIndex

            tweenAnimation.stop()
          })

          boxDom.addEventListener('mouseleave', () => {
            // 剩余路程所需时间
            const timeRemaining = (position.left - terminalPoint) / (startingPoint - terminalPoint) * speed

            tweenAnimation.to({ left: terminalPoint }, timeRemaining).start(this.$TWEEN.currTweenTime)
          })

          boxDom.addEventListener('contextmenu', (ev) => {
            ev.stopPropagation()
            ev.preventDefault()

            let boxStyle = this.$refs.barrageList.parentNode.parentNode.getBoundingClientRect()
            let left = ev.clientX
            let maxLeft = boxStyle.width - 80
            let top = ev.clientY
            let maxTop = boxStyle.height - 30

            if (left < 0) left = 0
            if (left > maxLeft) left = maxLeft

            if (top < 0) top = 0
            if (top > maxTop) top = maxTop

            this.$refs.reportButton.style.left = `${left}px`
            this.$refs.reportButton.style.top = `${top}px`
            this.$refs.reportButton.style.display = 'block'

            this.$set(this, 'rightClickSelectBarrageInfo', currentBarrage)

            this.hideReportButtonTimer = setTimeout(() => {
              this.$refs.reportButton.style.display = 'none'
            }, 2000)
          })
        })
      }

      setTimeout(this.barrageLoop, 500)
    },
    /**
     * 通过ajax发送弹幕内容
     */
    addBarrage (barrage) {
      if (isArray(barrage)) {
        this.add(barrage)
      } else if (isObject(barrage)) {
        const { text, time, color } = barrage

        if (!text) throw new Error(`barrage text 值不存在！`)

        this.add({
          text,
          time: time || Math.ceil(this.currentTime),
          color
        })
      }
    },
    /**
     * 通过ajax获取弹幕内容
     */
    getBarrage (seg) {
      if (isBoolean(this.barrageSeg[seg])) return

      this.barrageSeg[seg] = true

      if (this.options.getBarrage) {
        this.options.getBarrage({ seg, page: 1, pagesize: 3000 })
      }
    },
    /**
     * 评论点赞
     */
    addLike (currentBarrage) {
      if (this.options.onBarrageLike) {
        return this.options.onBarrageLike({ barrageInfo: currentBarrage })
      }
    },
    showReportPopup () {
      if (this.options.onClickBarrageReportButton) {
        if (this.options.onClickBarrageReportButton()) {
          this.$set(this, 'currentSelectBarrageInfo', this.rightClickSelectBarrageInfo)
          this.$set(this, 'visibleReportPopup', true)
        }
      }
    },
    closeReportPopup () {
      this.$set(this, 'visibleReportPopup', false)
    },
    handleRadioSelect ({ value, option }) {
      this.$set(this, 'reportValue', value)
      this.$set(this, 'reportOption', option)
    },
    submitReportContent () {
      this.closeReportPopup()

      if (this.options.onBarrageReport) {
        this.options.onBarrageReport({
          option: this.reportOption,
          barrageInfo: this.currentSelectBarrageInfo
        })
      }
    }
  }
}
</script>

<style lang="scss">
#vjs-barrage {
  position: absolute;
  left: 0;
  top: 0;
  // z-index: 5;
  width: 100%;
  height: 100%;
  user-select: none;
  pointer-events: none;

  &.pure-color {
    .vjs-barrage__item-text {
      color: #fff !important;
      background: none !important;
      -webkit-text-fill-color: initial !important;
      background-clip: initial !important;
      text-shadow: 0 0 2px rgba(0,0,0,.8), 0 1px 0 rgba(0,0,0,.8), 0 0 2px rgba(0,0,0,.8), 0 0 1px rgba(0,0,0,.8) !important;
    }
  }

  .vjs-barrage__list {
    position: absolute;
    left: 0;
    top: 8px;
    z-index: 5;
    width: 100%;
    height: 0;
    pointer-events: auto;
  }

  .vjs-barrage__item {
    position: absolute;
    left: 0;
    top: 0;
    height: 40px;
    line-height: 40px;
    padding: 0 10px 0 10px;
    border-radius: 20px;
    font-size: 23px;
    cursor: pointer;
    white-space: nowrap;
    text-shadow: 0 0 2px rgba(0,0,0,.8), 0 1px 0 rgba(0,0,0,.8), 0 0 2px rgba(0,0,0,.8), 0 0 1px rgba(0,0,0,.8);
    color: #fff;

    &:not(.vjs-barrage__item-disabled) {
      &:hover {
        background: rgba(0,0,0,0.7) !important;

        .vjs-barrage__item-text {
          color: #fff !important;
          -webkit-text-fill-color: inherit !important;
        }
      }
    }

    &.vjs-barrage__item-disabled {
      cursor: initial;
    }

    &.liking {
      .vjs-barrage__item-like-icon {
        background-position: right center;
        -webkit-transition: background-position 0.71s steps(19);
        transition: background-position 0.71s steps(19);
      }
    }

    &.liked {
      .vjs-barrage__item-like-icon {
        background-position: right center;
      }
    }

    .vjs-barrage__item-text {
      padding: 0 10px;
    }

    .vjs-barrage__item-like-icon {
      position: relative;
      top: -2px;
      display: inline-block;
      vertical-align: top;
      width: 40px;
      height: 40px;
      background: url(~assets/img/video_like_frame.png) no-repeat;
      background-size: auto 40px;
      background-position: left center;
    }

    .vjs-barrage__item-like-num {
      &.vjs-barrage__item-like-num-width {
        padding-right: 10px;
      }
    }
  }

  .vjs-barrage__report-button {
    display: none;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 99999;
    width: 80px;
    height: 30px;
    line-height: 26px;
    border-radius: 15px;
    background: rgba(0,0,0,0.8);
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    pointer-events: auto;

    &:hover {
      color: #28b7f8;
    }

    .vjs-barrage__report-icon {
      display: inline-block;

      &::before {
        content: '\e65b';
        position: relative;
        top: 2px;
        width: 18px;
        height: 18px;
        margin-right: 3px;
        font-size: 18px;
      }
    }
  }

  .vjs-barrage__report-popup {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 408px;
    z-index: 99999;
    // height: 328px;
    border-radius: 4px;
    margin-left: -204px;
    margin-top: -157px;
    background: #FFFFFF;
    pointer-events: auto;
    color: #333;

    .vjs-barrage__report-popup-title {
      height: 55px;
      line-height: 55px;
      padding: 0 24px;
      border-bottom: 1px solid #f4f4f4;
      font-weight: 500;
      font-size: 16px;
    }

    .vjs-barrage__report-close {
      position: absolute;
      right: 0;
      top: 0;
      width: 26px;
      height: 26px;
      line-height: 26px;
      border-radius: 13px;
      margin: 7px;
      text-align: center;
      color: #979797;
      cursor: pointer;
      font-size: 14px;

      &::before {
        content: '\e61d';
      }

      &:hover {
        background: #1f93ea;
        color: #fff;
      }
    }
  }

  .vjs-barrage__report-popup-content {
    padding: 0 20px 20px;

    .vjs-barrage__report-popup-content__title {
      height: 20px;
      line-height: 20px;
      margin: 10px 0;
      font-size: 14px;
    }

    .vjs-barrage__report-popup-content__report-content {
      height: 40px;
      line-height: 40px;
      padding: 0 10px;
      font-size: 14px;
      color: #999999;
      background: #F8F8F8;
      margin-bottom: 16px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .vjs-barrage__report-popup-content__radio-layout {
      height: 30px;
      line-height: 30px;
    }

    .vjs-barrage__report-popup-content__label {
      margin-right: 16px;

      .vjs-barrage__report-popup-content__label-text {
        margin-left: 5px;
      }
    }
  }

  .vjs-barrage__report-popup-bottom {
    display: flex;
    justify-content: flex-end;
    height: 53px;
    padding: 10px 16px;
    border-top: 1px solid #f4f4f4;

    .vjs-barrage__report-popup-button {
      display: inline-block;
      height: 32px;
      line-height: 1.5;
      padding: 0 15px;
      border-radius: 4px;
      background-color: #fff;
      border: 1px solid #d9d9d9;
      transition: all .3s cubic-bezier(.645,.045,.355,1);
      box-shadow: 0 2px 0 rgba(0,0,0,.015);
      font-weight: 400;
      white-space: nowrap;
      text-align: center;
      cursor: pointer;
      user-select: none;
      touch-action: manipulation;
      font-size: 14px;
      color: rgba(0,0,0,.65);

      &:hover {
        color: #40a9ff;
        background-color: #fff;
        border-color: #40a9ff;
      }
    }

    .vjs-barrage__report-popup-bottom-blue {
      display: inline-block;
      height: 32px;
      line-height: 1.5;
      padding: 0 15px;
      border-radius: 4px;
      background-color: #1890ff;
      border: 1px solid #d9d9d9;
      margin-left: 8px;
      transition: all .3s cubic-bezier(.645,.045,.355,1);
      box-shadow: 0 2px 0 rgba(0,0,0,.045);
      font-weight: 400;
      white-space: nowrap;
      text-align: center;
      cursor: pointer;
      user-select: none;
      touch-action: manipulation;
      font-size: 14px;
      color: #fff;
      border-color: #1890ff;
      text-shadow: 0 -1px 0 rgba(0,0,0,.12);

      &:hover {
        color: #fff;
        background-color: #40a9ff;
        border-color: #40a9ff;
      }
    }
  }
}

// 放映厅的直播类型 需要使用，华人的直播类型不需要
// .vjs-live #vjs-barrage {
//   display: none !important;
// }

.vjs-mobi #vjs-barrage {
  display: none !important;
}
</style>
