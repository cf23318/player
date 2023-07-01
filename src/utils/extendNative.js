import { mergeWith, cloneDeep, isArray } from 'lodash'

/**
 * 返回正确的数据类型
 * @return {String} dataType
 */
Object.defineProperty(Object.prototype, 'typeof', {
  value: function (arg) {
    var type = Object.prototype.toString.call(arg || this)

    return type.substring(8, type.length - 1).toLocaleLowerCase()
  },
  writable: false,
  enumerable: false,
  configurable: false
})

/**
 * 克隆当前对象
 * @return {Object, Array} 对象
 */
Object.defineProperty(Object.prototype, 'clone', {
  value: function (args) {
    return args ? cloneDeep(args) : cloneDeep(this)
  },
  writable: true,
  enumerable: false,
  configurable: false
})

/**
 * 深合并 数组采用覆盖方式
 * @return {Object} 对象
 */
Object.defineProperty(Object.prototype, 'deepMerge', {
  value: function () {
    return mergeWith(...arguments, function (curr, next) {
      if (isArray(curr)) {
        return next
      }
    })
  },
  writable: false,
  enumerable: false,
  configurable: false
})
