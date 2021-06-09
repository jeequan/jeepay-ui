/*
 * @Author: your name
 * @Date: 2020-12-23 09:05:40
 * @LastEditors: 王会峰
 * @LastEditTime: 2020-12-23 09:12:16
 * @FilePath: \pay\src\components\dialog\index.js
 * @SendWord: 永无BUG vite⚡
 */
import Vue from 'vue'
import Dialog from './dialog.vue'

const dialog = Vue.extend(Dialog)

Dialog.install = function(options, type) {
    if (options === undefined || options === null) {
        options = {
            content: ''
        }
    } else if (typeof options === 'string' || typeof options === 'number') {
        options = {
            content: options
        }
        if (type != undefined && options != null) {
            options.type = type;
        }
    }

    let instance = new dialog({
            data: options
        }).$mount()
        // document.querySelector('#app')

    document.body.appendChild(instance.$el)
    Vue.nextTick(() => {
        instance.visible = true
    })
}

export default Dialog