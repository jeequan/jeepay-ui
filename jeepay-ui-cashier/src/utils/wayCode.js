/**
 * 获取支付方式工具类
 *
 * @author terrfly
 * @site https://www.jeepay.vip
 * @date 2021/5/8 07:18
 */

import config from '@/config'

const getPayWay = function () {
    const ua = navigator.userAgent

    if (ua.indexOf('MicroMessenger') >= 0) {
        return config.payWay.WXPAY
    }

    if (ua.indexOf('AlipayClient') >= 0) {
        return config.payWay.ALIPAY
    }

    // 云闪付 App UA 包含 CloudPay 或 UnionPay
    if (ua.indexOf('CloudPay') >= 0 || ua.indexOf('UnionPay') >= 0) {
        return config.payWay.YSFPAY
    }

    return null
}

const getToPageRouteName = function () {
    const payWay = getPayWay()
    return payWay ? payWay.routeName : null
}

export default { getPayWay, getToPageRouteName }
