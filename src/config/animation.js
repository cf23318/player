import Vue from 'vue'
import tween from '@tweenjs/tween.js'

window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 6000 / 60)
    }
}())

var _paused = false
var _lastAnimationRequestID = null
var _pauseStartTime = 0
var _totalPausedTime = 0

const play = tween.play = function () {
  if (_paused) {
    _lastAnimationRequestID = window.requestAnimFrame(animate)
    _paused = false
    if (window.performance) _totalPausedTime += window.performance.now() - _pauseStartTime
  }
}

const paused = tween.pause = function () {
  if (!_paused) {
    if (_lastAnimationRequestID) {
      cancelAnimationFrame(_lastAnimationRequestID)
      _lastAnimationRequestID = undefined
    }
    _paused = true
    if (window.performance) _pauseStartTime = window.performance.now()
  }
}

tween.togglePaused = function () {
  if (_paused) {
    play()
  } else {
    paused()
  }
}

function animate (time) {
  var currTweenTime = tween.currTweenTime = time - _totalPausedTime
  tween.update(currTweenTime)
  _lastAnimationRequestID = window.requestAnimFrame(animate)
}
animate()

Vue.prototype.$TWEEN = tween

export default tween
