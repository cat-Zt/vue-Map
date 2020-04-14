<template>
  <div id="onPassage">
    <div id="container" />
    <!-- <div id="map" :style="{ height: contentHeight }" /> -->
    <div class="input-card top-message">
      <div>
        <el-dropdown @command="handleClick">
          <span class="el-dropdown-link">
            播放速度({{ handleNum }})
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="3">快</el-dropdown-item>
            <el-dropdown-item command="2">正常</el-dropdown-item>
            <el-dropdown-item command="1">慢</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="car-center btn-text" @click="trackPlayback">
        轨迹回放
      </div>
      <div v-show="trackState" class="btn-text" @click="trackStop">
        轨迹暂停
      </div>
      <div v-show="!trackState" class="btn-text" @click="trackBegin">
        轨迹继续
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import loadBMap from './AMap';
export default {
  data() {
    return {
      handleNum: '正常',
      trackState: true,
      map: null,
      contentHeight: '',
      /**
       * @dotGather 经纬度数据: 数组 ;   
       * 起点/终点 途经点--> 以 wayPoint 值为标准
       */
      dotGather: [
        {
          longitude: '113.211047',
          latitude: '22.907129',
          wayPoint: false
        },
        {
          longitude: '113.211047',
          latitude: '22.907129',
          wayPoint: false
        },
        {
          longitude: '113.211047',
          latitude: '22.907129',
          wayPoint: false,
        },
        {
          longitude: '113.221845',
          latitude: '22.906755',
          wayPoint: true
        },
        {
          longitude: '113.190394',
          latitude: '22.916889',
          wayPoint: true
        },
        {
          longitude: '113.166925',
          latitude: '22.901237',
          wayPoint: false
        }
      ],
      showLocationButton: '展示',
      navgFirst: null,
      trackSpeed: 1500
    };
  },
  methods: {
    // npm i vue-amap --save
    // main.js import AMap from 'vue-amap'; Vue.use(VueResource);
    // 地图初始化
    initMap() {
      const self = this;
      self.map = new AMap.Map('container', {
        zoom: 12,
        mapStyle: 'amap://styles/whitesmoke'
      });
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
        self.map.addControl(
          new AMap.ToolBar({
            offset: new AMap.Pixel(40, 60),
            direction: false
          })
        );
        self.map.addControl(new AMap.Scale());
      });
      this.initMapLine();
    },
    parseRouteToPath(route) {
      var path = [];
      for (var i = 0, l = route.steps.length; i < l; i++) {
        var step = route.steps[i];
        for (var j = 0, n = step.path.length; j < n; j++) {
          path.push(step.path[j]);
        }
      }
      return path;
    },
    // 获取整条线路的经纬度
    initMapLine(data) {
      let self = this;
      self.map.clearMap();
      let dotGather = [];
      let dotGatherEnd = [];
      let dotwayPoint = [];
      self.dotGather.map((item, index) => {
        if (index === self.dotGather.length - 1) {
          dotGatherEnd[1] = [];
          dotGatherEnd[1][0] = item.longitude;
          dotGatherEnd[1][1] = item.latitude;
        } else if (item.wayPoint) {
          let pointdata = [];
          pointdata[0] = item.longitude;
          pointdata[1] = item.latitude;
          dotwayPoint.push(pointdata);
        } else if (index === self.dotGather.length - 2) {
          dotGather[index] = [];
          dotGatherEnd[0] = [];
          dotGather[index][0] = item.longitude;
          dotGather[index][1] = item.latitude;
          dotGatherEnd[0][0] = item.longitude;
          dotGatherEnd[0][1] = item.latitude;
        } else {
          dotGather[index] = [];
          dotGather[index][0] = item.longitude;
          dotGather[index][1] = item.latitude;
        }
      });
      let driving = new AMap.Driving({
        policy: AMap.DrivingPolicy.LEAST_TIME
      });
      let startLat = new AMap.LngLat(
        self.dotGather[0].longitude,
        self.dotGather[0].latitude
      );
      let endLat = new AMap.LngLat(
        self.dotGather[self.dotGather.length - 1].longitude,
        self.dotGather[self.dotGather.length - 1].latitude
      );
      let waypoints = { waypoints: dotwayPoint };
      console.log(startLat, endLat, waypoints);
      driving.search(startLat, endLat, waypoints, function(status, result) {
        console.log(status);
        if (status === 'complete') {
          if (result.routes && result.routes.length) {
            let latArray = self.parseRouteToPath(result.routes[0]);
            console.log(latArray);
            self.initCruise(latArray, dotwayPoint);
          }
        } else {
          console.error('获取驾车数据失败：' + result);
        }
      });
    },
    initCruise(startData, dotwayPoint) {
      let self = this;
      var colors = ['#008ad3'];
      loadBMap('6cc20787964ab8ee4b019abf4819b979').then(() => {
        // 初始化 起点终点
        self.markerStart = new AMap.Marker({
          map: self.map,
          position: [self.dotGather[0].longitude, self.dotGather[0].latitude],
          offset: new AMap.Pixel(-14, -42),
          icon: new AMap.Icon({
            image: require('../../assets/car-start.png'),
            size: new AMap.Size(56, 100),
            imageSize: new AMap.Size(28, 50)
          }),
          autoRotation: true
        });
        self.markerEnd = new AMap.Marker({
          map: self.map,
          position: [
            self.dotGather[self.dotGather.length - 1].longitude,
            self.dotGather[self.dotGather.length - 1].latitude
          ],
          offset: new AMap.Pixel(-14, -42),
          icon: new AMap.Icon({
            image: require('../../assets/car-end.png'),
            size: new AMap.Size(56, 100),
            imageSize: new AMap.Size(28, 50)
          }),
          autoRotation: true,
          angle: 0
        });
        // 途径的标记点
        AMapUI.loadUI(['overlay/SimpleMarker'], function(SimpleMarker) {
          for (var i = 0, len = dotwayPoint.length; i < len; i++) {
            new SimpleMarker({
              // 添加自定义的class
              containerClassNames: 'my_color',
              // 样式主题
              iconTheme: 'numv2',
              src: '//webapi.amap.com/theme/v1.3/markers/b/mark_b.png',
              // 图标文字
              iconLabel: {
                innerHTML: '<div>' + '经' + '</div>',
                style: {
                  color: 'white',
                  fontSize: '70%'
                }
              },
              // 显示定位点
              map: self.map,
              position: dotwayPoint[i],
              label: {
                offset: new AMap.Pixel(27, 25)
              }
            });
          }
        });
        // 实现轨迹清除
        if (window.pathSimplifierIns) {
          pathSimplifierIns.setData([]);
        }
        // var vehicleNo = self.dotGather[0].vehicleNo;
        // 构造巡航器
        AMapUI.loadUI(['misc/PathSimplifier'], function(PathSimplifier) {
          var pathSimplifierIns = new PathSimplifier({
            zIndex: 100,
            // autoSetFitView:false,
            map: self.map, // 所属的地图实例
            // 返回轨迹数据中的节点坐标信息
            getPath: function(pathData, pathIndex) {
              return pathData.path;
            },
            // 绘制引擎的构造参数
            renderOptions: {
              // 如果地图视野内的轨迹节点的总数量小于该阈值，则绘制全部的节点。默认值为-1，即不开启。开启时，建议设置一个1000以内的数值。
              renderAllPointsIfNumberBelow: -1, // 绘制路线节点，如不需要可设置为-1\
              // 轨迹线的样式 ，属性取值
              pathLineStyle: {
                dirArrowStyle: {
                  strokeStyle: '#5EB0DC'
                }
              },
              // pathLineStyle: {
              //     strokeStyle: '#ff3366', // string 线颜色
              //     lineWidth:  6, //  number 线宽度
              //     // borderStyle: 'blue', //  string 描边颜色
              //     // borderWidth: 2 //  number 描边宽度
              // },
              // pathInfo 轨迹信息，包括轨迹索引和轨迹数据 zoom 地图当前的zoom级别 @return {Object} 样式配置
              getPathStyle: function(pathItem, zoom) {
                // 依次取颜色
                var color = colors[pathItem.pathIndex % colors.length];
                var lineWidth = 6;
                return {
                  pathLineStyle: {
                    strokeStyle: color,
                    lineWidth: lineWidth
                  },
                  pathLineSelectedStyle: {
                    lineWidth: lineWidth
                  },
                  pathNavigatorStyle: {
                    fillStyle: color
                  },
                  pathLineHoverStyle: {
                    strokeStyle: color
                  }
                };
              }
            }
          });
          window.pathSimplifierIns = pathSimplifierIns;
          // 设置数据
          pathSimplifierIns.setData([
            {
              name: '路线0',
              path: startData
            }
          ]);
          // 对第一条线路（即索引 0）创建一个巡航器 pathIndex：关联的轨迹索引
          self.navgFirst = pathSimplifierIns.createPathNavigator(0, {
            loop: true, // 循环播放
            speed: self.trackSpeed, // 巡航速度，单位千米/小时
            pathNavigatorStyle: {
              width: 22, // 巡航器形状宽度
              height: 55, // 巡航器形状高度
              // 使用图片
              content: PathSimplifier.Render.Canvas.getImageContent(
                require('../../assets/huoche.png'),
                onload,
                onerror
              ),
              strokeStyle: null, // 描边色
              fillStyle: null, // 填充色
              // 经过路径的样式
              pathLinePassedStyle: {
                lineWidth: 6,
                strokeStyle: '#0087d2',
                dirArrowStyle: {
                  stepSpace: 15,
                  strokeStyle: '#ffffff'
                }
              }
            }
          });
          // 图片加载的回调
          function onload() {
            pathSimplifierIns.renderLater();
          }
          function onerror(e) {
            alert('图片加载失败！');
          }
        });
        self.map.setFitView();
      });
    },
    // 轨迹回放
    trackPlayback() {
      this.navgFirst.start();
    },
    // 播放速度
    handleClick(index) {
      if (index === '3') {
        this.handleNum = '快';
      } else if (index === '2') {
        this.handleNum = '正常';
      } else if (index === '1') {
        this.handleNum = '慢';
      }
      this.trackSpeed = 1000 * index;
      this.navgFirst.setSpeed(this.trackSpeed);
    },
    // 轨迹暂停
    trackStop() {
      this.trackState = false;
      this.navgFirst.pause();
    },
    // 恢复巡航
    trackBegin() {
      this.trackState = true;
      this.navgFirst.resume();
    }
  },
  mounted() {
    this.initMap();
  }
};
</script>
<style lang="less">
#onPassage {
  display: flex;
  .el-menu-vertical-demo {
    overflow: auto;
    .el-menu-vertical-box:active {
      background: #eff8fa;
    }
  }
  .left-box {
    background: #fff;
  }
  .right-box {
    flex-grow: 1;
  }
  .select-line-box {
    padding-right: 10px;
  }
  .el-submenu__title {
    height: 44px;
    line-height: 44px;
  }
  .line-search {
    margin-bottom: 8px;
  }
  .radio-class {
    margin: 10px 10px 20px 10px;
  }
  .select-box {
    width: 100%;
  }
  .el-submenu__icon-arrow {
    left: 2px !important;
    right: auto;
  }
  .el-submenu__title {
    font-size: 14px !important;
  }
  .line-details-box:hover {
    background: #f6f8fa;
  }
  .line-details-box-active {
    background: #eff8fa !important;
  }
  .line-details-box {
    font-size: 12px;
    height: 120px;
    background: #f9f9f9;
    box-sizing: content-box;
    border-bottom: 1px solid #f2f2f2;
    padding: 16px 20px !important;
    clear: both;
    > div {
      height: 22px;
      line-height: 22px;
      float: left;
    }
  }
  .hint-text-box {
    height: 72px;
    line-height: 72px;
    text-align: center;
    font-size: 16px;
  }
  .alone-box {
    margin-top: 10px;
  }
  #map {
    width: 100%;
    position: absolute;
  }
  #container {
    position: relative;
    height: 96vh;
    width: 100%;
    .amap-icon img {
      width: 16px;
      height: 20px;
    }
    .amap-marker-label {
      border: 0;
      background-color: transparent;
      opacity: 0.6;
    }
    .info {
      position: relative;
      top: 0;
      right: 0;
      min-width: 0;
    }
  }
  .car-number {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 999;
  }
  .input-card {
    position: absolute;
    right: 10px;
    top: 10px;
  }
  .driver-particulars {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 999;
    background-color: #ffffff;
    .name-box {
      display: inline-block;
      width: 70%;
    }
    .particulars-btn {
      padding: 0 !important;
    }
    .particulars-box {
      font-size: 14px;
      text-align: right;
      display: inline-block;
      width: 30%;
      color: #d8d8d8;
    }
    .line-name {
      color: #898c8c;
    }
    > li {
      width: 214px;
      margin: 0 16px;
    }
    .header-title {
      height: 50px;
      line-height: 50px;
      border-bottom: 1px solid #e8e8e8;
      margin-bottom: 8px;
    }
    .text-line {
      height: 24px;
      line-height: 24px;
      font-size: 12px;
    }
  }
  .top-message {
    height: 16px;
    padding: 8px 0;
    z-index: 999;
    background-color: #ffffff;
    display: flex;
    > div {
      font-size: 12px;
      text-align: center;
      width: 130px;
      height: 16px;
      line-height: 16px;
    }
    .car-center {
      border-left: 1px solid #e8e8e8;
      border-right: 1px solid #e8e8e8;
    }
    .left-text-btn {
      border-right: 1px solid #e8e8e8;
    }
    .num {
      color: #00bcbf;
    }
  }
  .btn-text {
    cursor: pointer;
    color: #555757;
  }
  .numbers {
    font-family: PingFangSC-Medium;
    font-weight: 500;
    width: 54%;
    font-size: 14px;
    color: #252626;
    padding-bottom: 10px;
  }
  .driver {
    width: 46%;
    color: #252626;
    padding-bottom: 10px;
  }
  .details {
    width: 100%;
    color: #555757;
    .icon-size {
      font-size: 12px;
    }
    .right-text {
      margin-left: 10px;
    }
  }
  .el-dropdown-link {
    cursor: pointer;
    /*color: #00BCBF;*/
  }
  .full-screen-btn {
    position: absolute;
    left: 10px;
    font-size: 32px;
    color: #555757;
    bottom: 64px;
    z-index: 999;
  }
  .map-title-time {
    width: 250px;
    height: 32px;
    font-size: 16px;
    line-height: 32px;
    color: #fff;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    opacity: 0.6;
    padding: 8px 12px 0 12px;
    background: #000000;
  }
  .map-title-adress {
    width: 250px;
    font-size: 14px;
    line-height: 20px;
    color: #fff;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    opacity: 0.78;
    padding: 0 12px 8px 12px;
    background: #000000;
    white-space: normal;
  }
  .el-table {
    min-height: 280px !important;
  }
  .carClass {
    width: 100px;
    display: block;
    color: #635448;
    font-size: 14px;
  }
}
</style>