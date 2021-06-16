const moment = require("dayjs");
var util = require('../../utils/util.js')
let keys = 'SGXBZ-6X3K6-NYLSF-MALZD-QC6PK-BABOS';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowCamera: false,
    image: "",
    isShowImage: false,
    currentTime: "",
    gps: {
      latitude: "", //纬度
      longitude: "", //经度
    },
    district: "",
    width: 0,
    height: 0,
    gap:0,
    hasTakePhoto: false,
    src: "",
    logo: "../../assets/imgs/takephoto.jpg",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.ctx = wx.createCameraContext()

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          width: res.windowWidth,
          height: res.windowHeight,
          gap: 40
        })
      }
    })
  
    setInterval(function () {
      const _currentTime = moment().format("YYYY年MM月DD日 HH:mm:ss", util.formatTime(new Date()).split(" ")[1]);
      that.setData({
        currentTime: _currentTime,
      });
    }, 1000)
  },
  onShow: function () {
    this.getLocation();
    var that = this
    wx.authorize({
      scope: 'scope.camera',
      success: function (res) {
        that.setData({
          isShowCamera: true,
        })
      },
      fail: function (res) {
        console.log("" + res);
        wx.showModal({
          title: '请求授权您的摄像头',
          content: '如需正常使用此小程序功能，请您按确定并在设置页面授权用户信息',
          confirmText: '确定',
          success: res => {
            if (res.confirm) {
              wx.openSetting({
                success: function (res) {
                  console.log('成功');
                  console.log(res);
                  if (res.authSetting['scope.camera']) { //设置允许获取摄像头
                    console.log('设置允许获取摄像头')
                    wx.showToast({
                      title: '授权成功',
                      icon: 'success',
                      duration: 1000
                    })
                    that.setData({
                      isShowCamera: true,
                    })
                  } else { //不允许
                    wx.showToast({
                      title: '授权失败',
                      icon: 'none',
                      duration: 1000
                    })
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }
              })
            } else { //取消
              wx.showToast({
                title: '授权失败',
                icon: 'none',
                duration: 1000
              })
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }
    })
  },

  takePhoto: function() {
    var that = this
    that.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        wx.setStorage({
          key: 'originalImagePath',
          data: res.tempImagePath,
        })
        wx.navigateTo({
          url: 'upload?path=' + res.tempImagePath + '&char=0'
        })
      }
    })
  },
  getLocation() {
    let that = this;
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
      }
    })
  },

    

})