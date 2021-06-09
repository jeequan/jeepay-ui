/*
 * @Author: your name
 * @Date: 2020-12-14 16:32:48
 * @LastEditors: 王会峰
 * @LastEditTime: 2020-12-24 16:02:58
 * @FilePath: \pay\.postcssrc.js
 * @SendWord: 永无BUG vite⚡
 */
// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
    "plugins": {
        "postcss-import": {},
        "postcss-url": {},
        // to edit target browsers: use "browserslist" field in package.json
        "autoprefixer": {},
        "postcss-px2rem": {
            "remUnit": 75
        }
    }
}