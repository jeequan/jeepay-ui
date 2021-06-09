/**
 * 获取渠道用户 工具类
 *
 * @author terrfly
 * @site https://www.jeepay.vip
 * @date 2021/5/8 07:18
 */
const getChannelUserId = function () {
    return localStorage.getItem("channelUserId")
}

const setChannelUserId = function (channelUserId) {
    localStorage.setItem("channelUserId", channelUserId)
}

export default {
    getChannelUserId: getChannelUserId,
    setChannelUserId: setChannelUserId
}
