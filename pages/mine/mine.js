Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    touxiang:'',
    nickname:null,
    display:true   //button显示
  },
  onLoad: function () {
    // 查看是否授权
    wx.getSetting({
      success:res=> {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo)
              this.data.touxiang = res.userInfo.avatarUrl
              this.data.nickname = res.userInfo.nickName
              if (this.data.nickname != null &&  this.data.nickname != undefined) {
                this.data.display = !this.data.display
                console.log(this.data.display)
              }
              this.setData({
                touxiang: this.data.touxiang,
                nickname: this.data.nickname,
                display: this.data.display
              })
            }
          })
        }
      }
    })
  },
  bindGetUserInfo(e) {
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'http://192.168.43.19:5000/test',
            data: {
              code: res.code
            },
            // method: "POST",
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    console.log(e.detail.userInfo)
    if (e.detail.userInfo != undefined){
      this.data.touxiang = e.detail.userInfo.avatarUrl
      this.data.nickname = e.detail.userInfo.nickName
      this.setData({
        touxiang: this.data.touxiang,
        nickname: this.data.nickname
      })
     }
    if (this.data.nickname != null){
       this.data.display=!this.data.display
       this.setData({
        display: this.data.display
      })
    }
  }
  })
