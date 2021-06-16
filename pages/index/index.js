//index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    src:"../../assets/imgs/takephoto.jpg",
    takephoto_txt:"证据保全相机",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听被展示时调用
   */
  onShow: function(){

  },

  /**
   * 跳转到拍照界面
   */
  takePhoto: function(){
    wx.navigateTo({
      url: '../takePhoto/takePhoto'
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
