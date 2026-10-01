import { createApp, nextTick } from 'vue'
import Dialog from './dialog.vue'

Dialog.install = function(options) {
    if (options === undefined || options === null) {
        options = { content: '' }
    } else if (typeof options === 'string' || typeof options === 'number') {
        options = { content: options }
    }

    const container = document.createElement('div')
    const app = createApp(Dialog, options)
    const instance = app.mount(container)
    document.body.appendChild(container)

    nextTick(() => {
        instance.visible = true
    })
}

export default Dialog
