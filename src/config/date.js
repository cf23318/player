import Vue from 'vue'
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'

momentDurationFormatSetup(moment)
moment.locale('zh-cn')
Vue.prototype.$date = moment
