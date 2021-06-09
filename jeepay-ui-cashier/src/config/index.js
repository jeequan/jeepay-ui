/*
 *  全局定义信息
 *
 *  @author terrfly
 *  @site https://www.jeepay.vip
 *  @date 2021/5/8 07:18
 */

const errorPageRouteName = 'Error' //错误页面名称定义
const passGuardRouteList = [errorPageRouteName]  // 不进入路由守卫的name

/** 定义支付方式 **/
const payWay = {
    WXPAY : {wayCode: "WX_JSAPI", routeName: "CashierWxpay"},
    ALIPAY : {wayCode: "ALI_JSAPI", routeName: "CashierAlipay"}
}

export default {
    errorPageRouteName: errorPageRouteName,
    passGuardRouteList: passGuardRouteList,
    urlTokenName: "jeepayToken", //URL传递的token名称
    payWay: payWay,
    cacheToken: ""
}