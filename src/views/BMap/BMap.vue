<template>
  <div>
    <div :id="mapId" class="map-area" />
    <div>
      <button id="run" @click="control(1)">
        开始
      </button>
      <button id="stop" @click="control(2)">
        停止
      </button>
      <button id="pause" @click="control(3)">
        暂停
      </button>
    </div>
  </div>
</template>
<script>
import loadBMap from './mapClass.js';
import mapJson from './in.json';
export default {
  /* eslint-disable */
  data () {
    return {
      mapId: 'BMap-' + parseInt(Date.now() + Math.random()),
      myMap: null,
      lushu: null,
      mapJson: mapJson
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    // eslint-disable-next-line
    initMap () {
      loadBMap('wIt2mDCMGWRIi2pioR8GZnfrhSKQHzLY')
        .then(() => {
          this.myMap = new BMap.Map(this.mapId) // 创建map
          let point = new BMap.Point(116.404835, 39.911877) // 确定中心点
          this.myMap.centerAndZoom(point, 8) // 初始化地图map,设置中心点和地图级别。
          this.myMap.enableScrollWheelZoom(true)
          const that = this;
          var drv = new BMap.DrivingRoute('北京', {
              onSearchComplete: function(res) {
                  if (drv.getStatus() === BMAP_STATUS_SUCCESS) {
                      var plan = res.getPlan(0);
                      var arrPois =[];
                      for(var j=0;j<plan.getNumRoutes();j++){
                          var route = plan.getRoute(j);
                          arrPois= arrPois.concat(route.getPath());
                      }
                      that.addLine(arrPois);
                      that.myMap.setViewport(arrPois);
                      console.log(JSON.stringify(arrPois))
                      that.lushu = new BMapLib.LuShu(that.myMap, arrPois, {
                        defaultContent: '',
                        autoView: true, // 是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                        icon: new BMap.Icon('data:image/png;base64,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',
                          new BMap.Size(52, 26), { anchor: new BMap.Size(27, 13) }),
                        enableRotation: true, // 是否设置marker随着道路的走向进行旋转
                        landmarkPois: [],
                        speed: 4500
                      })
                  }
              }
          });
          var start=new BMap.Point(116.404844,39.911836);
          var end=new BMap.Point(116.308102,40.056057);
          drv.search(start, end);
        })
        .catch(err => {
          console.log('地图加载失败')
        })
    },
    	// 画线
    addLine (points) {
      // 画线
      var sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW, {
        scale: 0.6, // 图标缩放大小
        strokeColor: '#fff', // 设置矢量图标的线填充颜色
        strokeWeight: '2'// 设置线宽
      })
      var icons = new BMap.IconSequence(sy, '100%', '4%')
      var polyline = new BMap.Polyline(points, {
        enableEditing: false, // 是否启用线编辑，默认为false
        enableClicking: true, // 是否响应点击事件，默认为true
        icons: [icons],
        strokeWeight: '8', // 折线的宽度，以像素为单位
        strokeOpacity: 0.8, // 折线的透明度，取值范围0 - 1
        strokeColor: '#18a45b' // 折线颜色
      })
      this.myMap.addOverlay(polyline) // 增加折线
    },
    // 添加点
    addMarker (point) {
      var marker = new BMap.Marker(point)
      map.addOverlay(marker)
      var label = new BMap.Label('时间:' + gpsTime + '<br/>位置:' + marker.getPosition().lng + ',' + marker.getPosition().lat, { offset: new BMap[0].Size(20, -10) })
      marker.setLabel(label)
      label.hide()
      marker.addEventListener('mouseover', onMouseover)// 鼠标进入事件
      marker.addEventListener('mouseout', onMouseout)// 鼠标移出事件
    },
    // 控制
    control (data) {
      switch (data) {
        case 1:
          this.lushu.start()
          break
        case 2:
          this.lushu.stop()
          break
        case 3:
          this.lushu.pause()
          break
        default:
          break
      }
    }
  }
}
</script>
<style scoped>
.map-area {
  width: 100%;
  height: 500px;
}
</style>
