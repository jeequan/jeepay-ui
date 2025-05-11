import Vue from 'vue'

import Viser from 'viser-vue'

// ext library
import VueCropper from 'vue-cropper'

Vue.use(Viser)
Vue.use(VueCropper)

process.env.NODE_ENV !== 'production' && console.warn('[antd-pro] NOTICE: Antd use lazy-load.')
