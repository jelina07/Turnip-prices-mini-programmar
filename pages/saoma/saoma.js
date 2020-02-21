// pages/saoma/saoma.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad: function (options) {
    wx.scanCode({
      success: (res) => {
          console.log(res)
          wx.navigateTo({
            url: 'res.result'
          })
        }
  })
  }
})