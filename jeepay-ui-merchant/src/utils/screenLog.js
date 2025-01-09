/* eslint-disable */
export const printANSI = () => {
  let text = `
       __
      / /___  ___  ____  ____ ___  __
 __  / // _ \\/ _ \\/ __ \\/ __ \`/ / / /
/ /_/ //  __/  __/ /_/ / /_/ / /_/ /
\\____/ \\___/\\___/ .___/\\__,_/\\__, /
               /_/          /____/
 :: Jeepay ::        (v3.0.0.RELEASE)
 让支付接入更简单 : https://www.jeequan.com
`

  console.log(`%c${text}`, 'color: #fc4d50')

  console.log('%cThanks for using Jeepay!', 'color: #fff; font-size: 14px; font-weight: 300; text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;')

}
