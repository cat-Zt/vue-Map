/* eslint-disable */
/**
 * @description 加载百度地图相关资源js
 * @param {string} ak
 */
export default function loadBMap (ak) {
  return new Promise((resolve, reject) => {
    asyncLoadBaiduJs(ak).then(() => {
      asyncLoadJs('https://api.map.baidu.com/library/LuShu/1.2/src/LuShu_min.js').then(() => {
        // asyncLoadJs('http://api.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js').then(() => {
        resolve()
        return true
        // }).catch(err => {
        //     reject(err);
        // })
      }).catch(err => {
        reject(err)
      })
    }).catch(err => {
      reject(err)
    })
  })
}
/**
 * @description 加载百度地图
 * @param {string} ak
 */
export function asyncLoadBaiduJs (ak) {
  return new Promise((resolve, reject) => {
    // window.onload = function () {
    //   resolve(BMap)
    // }
    if (typeof BMap !== 'undefined') {
      resolve(BMap)
      return true
    }
    window.onBMapCallback = function () {
      resolve(BMap)
    }
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'http://api.map.baidu.com/api?v=2.0&ak=' + ak + '&callback=onBMapCallback'
    script.onerror = reject
    document.head.appendChild(script)
  })
}
/**
 * @description 加载第三方组件js公共方法 路书
 * @param {string} url
 */
export function asyncLoadJs (url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    document.head.appendChild(script)
    script.onload = () => {
      resolve()
    }
    script.onerror = reject
  })
}
