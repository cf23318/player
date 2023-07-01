import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'

axios.interceptors.request.use((request) => {
  if (request.data && request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    request.data = qs.stringify(request.data)
  }
  return request
})

Vue.prototype.$axios = axios
export default axios
