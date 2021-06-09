
// vue.config.js
const vueConfig = {

  publicPath: process.env.VUE_APP_BASE_URL,  // 前端资源访问根目录， 可配置到cdn目录下。 建议使用命令行环境变量进行替换。
  devServer: {
    disableHostCheck: true  //不检查域名是否正确
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-px2rem')({ remUnit: 75 }), // 换算的基数
        ]
      }
    }
  }
}

module.exports = vueConfig
