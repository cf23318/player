import localforage from 'localforage'

var store = localforage.createInstance({
  name: 'vjs',
  storeName: 'video-options'
})

export default store
