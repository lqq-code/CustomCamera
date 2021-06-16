const moment = require("dayjs");
var util = require('../../utils/util.js')
let keys = 'SGXBZ-6X3K6-NYLSF-MALZD-QC6PK-BABOS';

Page({
  properties: {
    //属性值可以在组件使用时指定
    isCanDraw: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
        newVal && this.drawPic()
      }
    }
  },
  data: {
    width: 0,
    height: 0,
    // tempFilePath: "",
    currentTime: "",
    gps: {
      latitude: "", //纬度
      longitude: "", //经度
    },
    district: "",
    imgDraw: {}, //绘制图片的大对象
    // sharePath: '', //生成的分享图
  },

  onLoad: function (options) {
    var that = this
    that.path = options.path

    const _currentTime = moment().format("YYYY年MM月DD日 HH:mm:ss", util.formatTime(new Date()).split(" ")[1]);
    that.setData({
      currentTime: _currentTime,
    });
    that.getLocation();
  },
  onShow: function () {
  },
  getCanvas(path){
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        var width = res.windowWidth
        var height = res.windowHeight
        var gap = 40
        that.setData({
          width: width,
          height: height,
          gap: gap
        })
        wx.getImageInfo({
          src: that.path,
          success: function (res) {
            that.canvas = wx.createCanvasContext("image-canvas", that)
            that.canvas.drawImage(that.path, 0, 0, that.data.width, that.data.height)
 
            that.canvas.setFontSize(16);
            that.canvas.setFillStyle('#fff');
            that.canvas.fillText(that.data.currentTime, 50, 450)
           
            that.canvas.setFontSize(16)
            that.canvas.setFillStyle('#fff')
            that.canvas.fillText('经度：'+ that.data.gps.longitude + ' 纬度：' + that.data.gps.latitude, 50, 475)

            that.canvas.setFontSize(16)
            that.canvas.setFillStyle('#fff')
            that.canvas.fillText( that.data.district+ '附近', 50, 500)

            wx.showLoading({
              title: '数据处理中',
              mask: true
            })
            that.canvas.setStrokeStyle('red')
            // 这里有一些很神奇的操作,总结就是MD拍出来的照片规格居然不是统一的
            //过渡页面中，对裁剪框的设定
            that.canvas.draw()
            setTimeout(function () {
              wx.canvasToTempFilePath({ //裁剪对参数
                canvasId: "image-canvas",
                x: that.data.gap, //画布x轴起点
                y: that.data.gap, //画布y轴起点
                width: that.data.width - 2 * that.data.gap, //画布宽度
                height: 500, //画布高度
                destWidth: that.data.width - 2 * that.data.gap, //输出图片宽度
                destHeight: 500, //输出图片高度
                canvasId: 'image-canvas',
                success: function (res) {
                  that.filePath = res.tempFilePath
                  //清除画布上在该矩形区域内的内容。
                  that.canvas.clearRect(0, 0, that.data.width, that.data.height)
                  that.canvas.drawImage(that.filePath, that.data.gap, that.data.gap, that.data.width - that.data.gap * 2, 500)
                  that.canvas.draw()
                  wx.hideLoading()
                  //在此可进行网络请求

                },
                fail: function (e) {
                  wx.hideLoading()
                  wx.showToast({
                    title: '出错啦...',
                    icon: 'loading'
                  })
                }
              });
            }, 1000);
          }
        })
      }
    })
  },
  getLocation() {
    var that = this;
    wx.getLocation({
      type: "wgs84",
      success(res) {
        that.setData({
          gps: {
            latitude: res.latitude.toFixed(4),
            longitude: res.longitude.toFixed(4),
          },
        });
        that.getDistrict(res.latitude.toFixed(4), res.longitude.toFixed(4));
      },
    });
  },
  getDistrict(latitude, longitude) {
    let that = this;
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${keys}`,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        // 省
        let province = res.data.result.address_component.province;
        // 市
        let city = res.data.result.address_component.city;
        // 区
        let district = res.data.result.address_component.district;
        that.setData({
          district: res.data.result.address,
          region: [province, city, district]
        })
        that.getCanvas(that.path)
      }
    })
  },
  downImg() {
    let that = this;
    wx.canvasToTempFilePath({
      canvasId: "image-canvas",
      x: that.data.gap, //画布x轴起点
      y: that.data.gap, //画布y轴起点
      width: that.data.width - 2 * that.data.gap, //画布宽度
      height: 500, //画布高度
      destWidth: that.data.width - 2 * that.data.gap, //输出图片宽度
      destHeight: 500, //输出图片高度
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(e) {
            wx.showToast({
              title: '保存成功',
              icon: 'none',
              duration: 2000
            })
          },
          fail(e) {
            wx.getSetting({
              success(res) {
                if (!res.authSetting["scope.writePhotosAlbum"]) {
                  wx.showModal({
                    title: '警告',
                    content: '请打开相册权限，否则无法保存图片到相册',
                    success(res) {
                      if (res.confirm) {
                        wx.openSetting({
                          success(res) {
                            console.log(res)
                          }
                        })
                      } else if (res.cancel) {
                        wx.showToast({
                          title: '取消授权',
                          icon: "none",
                          duration: 2000
                        })
                      }
                    }
                  })
                }
              }
            })
          }
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  onImgErr(e) {
    wx.hideLoading()
    wx.showToast({
      title: '生成分享图失败，请刷新页面重试'
    })
  },
  onImgOK(e) {
    wx.hideLoading()
    this.setData({
      sharePath: e.detail.path,
      visible: true,
    })
    //通知外部绘制完成，重置isCanDraw为false
    this.triggerEvent('initData')
  },
})