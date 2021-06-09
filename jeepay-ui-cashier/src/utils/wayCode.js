/**
 * 获取支付方式工具类
 *
 * @author terrfly
 * @site https://www.jeepay.vip
 * @date 2021/5/8 07:18
 */

import config from '@/config'

const getToPageRouteName = function () {
    const payWay = getPayWay();
    return  payWay? payWay.routeName : null
}

const getPayWay = function () {

    const userAgent = navigator.userAgent;

    if(userAgent.indexOf("MicroMessenger") >= 0){
        return config.payWay.WXPAY;
    }

    if(userAgent.indexOf("AlipayClient") >= 0){
        return config.payWay.ALIPAY;
    }

    return null;

}


export default { getToPageRouteName: getToPageRouteName,
    getPayWay: getPayWay

}
