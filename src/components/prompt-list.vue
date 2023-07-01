<template>
  <div id="vjs-prompt-list">
    <div class="vjs-prompt-list__smallBox" v-for="prompt in promptList" :key="prompt.id">
      <div class="vjs-prompt-list__small">
        <p v-if="prompt.text" v-html="prompt.text"></p>
        <component v-if="prompt.component" :is="prompt.component" v-bind="prompt.props"></component>

        <a href="javascript:void(0);" class="vjs-prompt-list__close vjs-iconfont" @click="remove(prompt.id)">&#xe61d;</a>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'prompt-list',

  data () {
    return {
      promptList: [
        // {
        //   id: '1000000001',
        //   text: '关闭',
        //   component: 'vue component',
        // }
      ]
    }
  },

  created () {
    Vue.prototype.$vjsPrompt = {
      add: this.add,
      remove: this.remove,
      removeAll: this.removeAll
    }
  },

  methods: {
    reset () {
      this.removeAll()
    },
    /**
     * 添加提示
     * @param {String} text 需要提示的问题，支持html，注意xss
     * @param {Boolean} autoClose 是否自动关闭提示
     * @param {Number} time 停留时间，单位 秒
     * @return {Id} id 可保留id，然后统一删除
     * @return {Function} remove 删除此条提示
     */
    add ({ text, component, props, autoClose = true, time = 5 }) {
      let id = parseInt(Math.random() * 100000000)

      this.promptList.push({ id, text, component, props })

      if (autoClose) {
        setTimeout(() => {
          this.$set(this, 'promptList', this.promptList.filter(info => info.id !== id))
        }, time * 1000)
      }

      return {
        id: id,
        remove: () => {
          this.remove(id)
        }
      }
    },
    /**
     * 删除某一个指定的提示
     * @param {Id} 随机生成的id
     */
    remove (id) {
      this.$set(this, 'promptList', this.promptList.filter(info => info.id !== id))
    },
    /**
     * 删除所有提示
     */
    removeAll () {
      this.$set(this, 'promptList', [])
    }
  }
}
</script>

<style>
#vjs-prompt-list {
  position: absolute;
  left: 10px;
  bottom: 65px;
  z-index: 10;
  font-size: 12px;
}

#vjs-prompt-list .vjs-prompt-list__small {
  position: relative;
  display: inline-block;
  height: 24px;
  line-height: 24px;
  padding: 0 24px 0 10px;
  margin-top: 5px;
  background: rgba(0,0,0,.6);
  border-radius: 5px;
}

#vjs-prompt-list .vjs-prompt-list__close {
  position: absolute;
  right: 5px;
  top: 0;
  font-size: 14px;
  color: #ff6e0b;
  text-decoration: none;
}
</style>
