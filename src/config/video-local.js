import localforage from 'localforage'

var store = localforage.createInstance({
  name: 'vjs',
  storeName: 'video-local'
})

export default store
