import Vue from 'vue'
import { isElement } from 'lodash'

/**
 * 拖动事件 绑定的函数必须返回一个对象
 * @param {String} type 可指定绑定 mouse or touch
 * @param {Function} down 下按
 * @param {Function} move 移动
 * @param {Function} up 抬起
 */
Vue.directive('drag', {
  inserted: function (el, { value }) {
    if (!isElement(el) || el.length === 0) throw new Error('elem is not an element!')

    const { type, down, move, up } = value()
    const document = window.document.documentElement

    switch (type) {
      case 'mouse':
        mouse()
        break
      case 'touch':
        touch()
        break
      default:
        mouse()
        touch()
    }

    function mouse () {
      el.addEventListener('mousedown', downEvent)
    }

    function touch () {
      el.addEventListener('touchstart', downEvent)
    }

    function downEvent (e) {
      down && down(e)

      document.addEventListener('mousemove', moveEvent)
      document.addEventListener('mouseup', upEvent)
      document.addEventListener('touchmove', moveEvent)
      document.addEventListener('touchend', upEvent)
    }

    function moveEvent (e) {
      move && move(e)
    }

    function upEvent (e) {
      up && up(e)

      document.removeEventListener('mousemove', moveEvent)
      document.removeEventListener('mouseup', upEvent)
      document.removeEventListener('touchmove', moveEvent)
      document.removeEventListener('touchend', upEvent)
    }
  }
})

/**
 * 触摸事件绑定的函数必须返回一个对象
 * @param {Object} {over, out} 移入 移出
 */
Vue.directive('hover', {
  inserted: function (el, { value }) {
    if (!isElement(el) || el.length === 0) throw new Error('elem is not an element!')

    const { over, out } = value()

    el.addEventListener('mouseover', over)
    el.addEventListener('mouseout', out)
  }
})

/**
 * clickAndKeydown click和回车
 * 使用此参数时，无法在行内使用$emit (v-clickAndKeydown="$emit('input')" 不允许)
 * @param {Function} fn
 */
Vue.directive('clickAndKeydown', {
  inserted: function (el, { value: fn }) {
    if (!isElement(el) || el.length === 0) throw new Error('elem is not an element!')

    el.addEventListener('click', fn)

    el.addEventListener('keydown', function (e) {
      if (e.keyCode.toString() === '13') {
        fn(e)
        e.stopPropagation()
      }
    })
  }
})
