/* eslint-disable */
/**
 * @description 加载高德地图相关资源js
 * @param {string} ak
 */
export default function loadBMap (ak) {
    return new Promise((resolve, reject) => {
        asyncLoadBaiduJs(ak).then(() => {
            asyncLoadJs('//webapi.amap.com/ui/1.0/main.js?v=1.0.11').then(() => {
                resolve();
                return true;
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
}
/**
   * @description 加载高德地图
   * @param {string} ak
   */
export function asyncLoadBaiduJs (ak) {
    return new Promise((resolve, reject) => {
        // window.onload = function () {
        //   resolve(BMap)
        // }
        if (typeof AMap !== 'undefined') {
            resolve(window.AMap);
            return true;
        }
        window.initAMap = function () {
            resolve(window.AMap);
        };
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://webapi.amap.com/maps?v=1.4.15&' + ak + '&callback=initAMap';
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
/**
   * @description 加载第三方组件UI公共方法
   * @param {string} url
   */
export function asyncLoadJs (url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        document.head.appendChild(script);
        script.onload = () => {
            resolve();
        };
        script.onerror = reject;
    });
}