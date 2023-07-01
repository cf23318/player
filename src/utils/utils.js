import moment from 'moment'
import bowser from 'bowser'
import { debounce, isFunction, isNull, isArray, mergeWith } from 'lodash'

const userAgentInfo = window.navigator.userAgent
// const userAgentInfo = `Mozilla/5.0 (Linux; NetCast; U) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.33 Safari/537.31 SmartTV/5.0`;
// const userAgentInfo = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36`;
// const userAgentInfo = `Mozilla/5.0 (Linux; U) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 SmartTV/7.0 (NetCast) Android`;
// const userAgentInfo = `Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1`
// const userAgentInfo = `Mozilla/5.0 (SMART-TV; X11; Linux i686) AppleWebKit/535.20+ (KHTML, like Gecko) Version/5.0 Safari/535.20+ SamsungBrowser`
// const userAgentInfo = `Mozilla/5.0 (SMART-TV; X11; Linux armv7l) AppleWebKit/537.42 (KHTML, like Gecko) Chromium/25.0.1349.2 Chrome/25.0.1349.2 Safari/537.42`;
// const userAgentInfo = `Opera/9.80 (Linux armv7l; HbbTV/1.2.1 (; Philips; ; ; ; ) CE-HTML/1.0 NETTV/6.0.0 SmartTvA/3.0.0 (PhilipsTV, 6.1.1,) en) Presto/2.12.407 Version/12.50`;
// const userAgentInfo = `Mozilla/5.0 (iPad; U; CPU OS 5_1 like Mac OS X) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B367 Safari/531.21.10`;
// const userAgentInfo = `Mozilla/5.0 (Linux; Android 4.0.3; ASUS Transformer Pad TF700T Build/IML74K) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari/535.19`;
// const userAgentInfo = `Mozilla/5.0 (Linux; Android 4.2.2; vision2_2 TV Build/MASTER) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.80 Safari/537.36`;
// const userAgentInfo = `Mozilla/5.0 (Linux; Android 4.2.2; B-202 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.131 Safari/537.36`;
// const userAgentInfo = `Mozilla/5.0 (Linux; Android 7.1.1; SAMSUNG SM-J510GN Build/NMF26X) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/6.4 Chrome/56.0.2924.87 Mobile Safari/537.36`;
// const userAgentInfo = `Mozilla/5.0 (Nintendo WiiU) AppleWebKit/536.30 (KHTML, like Gecko) NX/3.0.4.2.13 NintendoBrowser/4.3.2.11274.EU`;
// const userAgentInfo = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.34 Safari/534.24`;
// const userAgentInfo = `Mozilla/5.0 (iPad; CPU OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1`
// const userAgentInfo = `Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12F69`;
// const userAgentInfo = `Mozilla/5.0 (Linux; NetCast; U) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.31 SmartTV/6.0`;
// const userAgentInfo = `Mozilla/5.0 (Linux; Android 6.0; MStar Android TV Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/48.0.2542.0 Mobile Safari/537.36`;
// const userAgentInfo = `Mozilla/5.0 (Linux; Android 5.1; UBOX4_S900PROBT Build/LMY47I) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36`;
// const userAgentInfo = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7`;
// const userAgentInfo = `Mozilla/5.0 (Linux; Android 6.0.1; NX531J Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3497.41 Mobile Safari/537.36`;
// const userAgentInfo = `Mozilla/5.0 (Linux; Android 6.0.1; NX531J Build/MMB29M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044205 Mobile Safari/537.36 MicroMessenger/6.7.2.1340(0x26070233) NetType/WIFI Language/zh_CN`;
// const userAgentInfo = `Mozilla/5.0 (Linux; U; Android 6.0.1; zh-CN; NX531J Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 Quark/2.4.3.987 Mobile Safari/537.36`;
// const userAgentInfo = `Mozilla/5.0 (X11; FreeBSD; U; Viera; en-NZ) AppleWebKit/537.11 (KHTML, like Gecko) Viera/3.10.17 Chrome/23.0.1271.97 Safari/537.11`;
// const userAgentInfo = `Mozilla/5.0 (SMART-TV; X11; Linux armv7l) AppleWebkit/537.42 (KHTML, like Gecko) Chromium/25.0.1349.2 Chrome/25.0.1349.2 Safari/537.42`;
// const userAgentInfo = `Mozilla/5.0 (SMART-TV; Linux; Tizen 3.0) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/2.0 Chrome/47.0.2526.69 TV safari/537.36`;

export const userAgent = {
  browserParser: bowser.getParser(userAgentInfo).parsedResult,
  userAgentInfo: userAgentInfo,
  isAndroid: /Android/i.test(userAgentInfo) || /Adr/i.test(userAgentInfo),
  isIos: /\(i[^;]+;( U;)?(.+?)CPU.+Mac OS/i.test(userAgentInfo),
  isWechat: /MicroMessenger/i.test(userAgentInfo) && /mobile/i.test(userAgentInfo),
  change (args) {
    Object.assign(userAgent, args)
  }
}

Object.assign(userAgent, {
  isIpad: userAgent.isIos && /iPad/i.test(userAgentInfo)
})

if (userAgent.isAndroid) {
  userAgentInfo.match(/Android(\s?)+([\d.]+)/i)

  Object.assign(userAgent, {
    version: RegExp.$2
  })
}

if (
  userAgent.isIos &&
  (/cpu iphone os (.*?) like mac os/i.test(userAgentInfo) || /cpu os (.*?) like mac os/i.test(userAgentInfo))
) {
  const regStrSaf = /os [\d._]*/gi
  const verinfo = userAgentInfo.match(regStrSaf)

  Object.assign(userAgent, {
    version: (verinfo + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.')
  })
}

// /**
//  * 判断是否加载完成，加载完成之后运行回掉函数
//  *
//  * @param {Array} [args.condition] 必须 所需要判断的值
//  * @param {Function} [args.cb] 必须 回掉函数
//  * @param {Array} [args.timeout] 默认120000毫秒 超时时间，毫秒
//  */
// export const loading = window.loading = function (args) {
//   const condition = args.condition;
//   const cb = args.cb;
//   const timeout = args.timeout || 120000;
//   const createTime = new Date();

//   // 判断值是否符合规定，并且做出筛选
//   if (!(condition instanceof Array)) {
//     throw new Error('load：判断参数必须为数组！');
//   }
//   if (!(cb instanceof Function)) {
//     throw new Error('load：回掉函数不能为空！');
//   }

//   condition = condition.filter(function (currCondition) {
//     return currCondition;
//   });

//   loop();

//   function loop () {
//     if (new Date() - createTime > timeout) {
//       alert('load：超时！请尝试刷新页面');
//       throw new Error('load：超时！');
//     }

//     let onOff = 0;

//     for (let i = 0; i < condition.length; i++) {
//       if (typeof condition[i] === 'string') {
//         if (window[condition[i]]) {
//           ++onOff;
//         }
//       } else if (typeof condition[i] === 'function') {
//         if (condition[i]()) {
//           ++onOff;
//         }
//       }
//     }

//     if (onOff === condition.length) {
//       cb();
//     } else {
//       setTimeout(loop, 1000 / 16);
//     }
//   }
// };

/**
 * Debounce 基于 lodash.debounce 进行改造，看不懂注释请移步lodash文档
 * @param {Function} lead 在调用之前开始执行
 * @param {Function} process 在调用中开始执行
 * @param {Function} trail 在调用之后开始执行
 * @param {Number} maxWait 最长多少秒执行一次process
 * @param {Number} time 中间停止的时长，超出事件后执行trail
 * @return {Function}
 */
export function advancedDebounce ({ lead, process, trail, maxWait = 100, time = 100 }) {
  const leadEvent = debounce(function () {
    lead && lead.apply(this)
  }, time, {
    leading: true,
    trailing: false
  })

  const processEvent = debounce(function () {
    process && process.apply(this)
  }, maxWait, {
    maxWait: maxWait
  })

  const trailEvent = debounce(function () {
    trail && trail.apply(this)
  }, time, {
    leading: false,
    trailing: true
  })

  return function () {
    leadEvent.apply(this)
    processEvent.apply(this)
    trailEvent.apply(this)
  }
}
/**
 * 闭包 让内部函数可以访问到外部this
 * @param {Function} fun
 * @return {Function}
 */
export function closure (fun) {
  if (!isFunction(fun)) throw new Error('arguments[0] is not a function!')

  let result = null
  return function () {
    if (isNull(result)) {
      result = fun.apply(this)
    }

    result.apply(this, arguments)
  }
}

/**
 * 双击
 * @param {Function} singleClick 单机时执行的函数
 * @param {Function} doubleClick 双机时执行的函数
 * @param {Number} time 单双击判断的时间
 */
export function doubleClick ({ singleClick, doubleClick, time = 300 }) {
  let clickFrequency = 0
  let timer

  return function () {
    ++clickFrequency
    clearTimeout(timer)

    if (clickFrequency === 1) {
      timer = setTimeout(function () {
        singleClick && singleClick()
        clickFrequency = 0
      }, time)
    } else if (clickFrequency === 2) {
      doubleClick && doubleClick()
      clickFrequency = 0
    }
  }
}

/**
 * 获取坐标
 * @param {Object} e 时间对象event
 * @return {Object} {x, y}
 */
export function getCoordinate (e) {
  var obj = {}

  if (isFinite(e.clientX)) {
    obj = {
      x: e.clientX,
      y: e.clientY
    }
  } else if (isFinite(e.changedTouches[0].clientX)) {
    obj = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    }
  } else {
    throw new Error('can not get coordinate!')
  }

  return obj
}

/**
 * 把时间格式化成 h:mm:ss的状态
 */
export function playTimeformat (time, format) {
  time = parseInt(time)

  if (format) {
    return moment.duration(time, 'seconds').format(format, { trim: false })
  } else {
    return moment.duration(time, 'seconds').format('hh:mm:ss', { stopTrim: 'm' })
  }
}

/**
 * 拖拽
 */
/**
export function drag ({elem, down, move, up}) {
  if (!isElement(elem) || elem.length === 0) throw new Error('elem is not an element!');

  let document = window.document.documentElement;

  // 当元素只有一个的时候
  if (isUndefined(elem.length)) {
    elem = [elem];
  }

  for (let i = 0; i < elem.length; i++) {
    elem[i].addEventListener('mousedown', downEvent);
    elem[i].addEventListener('touchstart', downEvent);
  }

  function downEvent (e) {
    down && down(e);

    document.addEventListener('mousemove', moveEvent);
    document.addEventListener('mouseup', upEvent);
    document.addEventListener('touchmove', moveEvent);
    document.addEventListener('touchend', upEvent);
  }

  function moveEvent (e) {
    move && move(e);
  }

  function upEvent (e) {
    up && up(e);

    document.removeEventListener('mousemove', moveEvent);
    document.removeEventListener('mouseup', upEvent);
    document.removeEventListener('touchmove', moveEvent);
    document.removeEventListener('touchend', upEvent);
  }
}
*/

/**
 * debuglog
 * 判断调试日志
 */
export const debuglog = {
  display: false,
  log: function (...args) {
    if (this.display) console.log(...args)
  },
  warn: function (...args) {
    if (this.display) console.warn(...args)
  },
  error: function (...args) {
    if (this.display) console.error(...args)
  }
}

/**
 * 判断视频类型
 * @param {String} url 视频地址
 * @returns {String} 视频类型
 */
export function getVideoType (url) {
  if (url.indexOf('m3u8') !== -1) {
    return 'application/x-mpegURL'
  } else {
    return 'video/mp4'
  }
}

/**
 * 深合并 数组采用覆盖方式
 * @return {Object} 对象
 */
export function deepMerge () {
  return mergeWith(...arguments, function (curr, next) {
    if (isArray(curr)) {
      return next
    }
  })
}

/**
 * 是否采取主播放器
 */
export const hasUseMainPlayFn = function () {
  // return true;

  if (userAgent.isPc && userAgent.isIpad) return true
  if (userAgent.isMobi) return true

  return false
}
