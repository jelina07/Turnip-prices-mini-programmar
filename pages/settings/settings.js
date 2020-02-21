// pages/settings/settings.js
Page({
  data: {
    items1: [{ image: " ../../images/定位.png", neirong: "定位", kaiguan: '开'},
      { image: "../../images/相机.png", neirong: "调用相机", kaiguan: '开'}],

    items2: [{ image: "../../images/官方.png", neirong: "官方网站", url:"../guanwang/guanwang"},
             {image: "../../images/反馈.png", neirong: "我要反馈",url:"../suggestion/suggestion"}],
     
  },
  onShow:function(e){
    wx.getSetting({
      success: res => {
        console.log(res.authSetting)
        if (!res.authSetting['scope.userLocation']) {
          this.data.items1[0].kaiguan = '关'
          this.setData({ items1: this.data.items1 })
        }
        else{
          this.data.items1[0].kaiguan = '开'
          this.setData({ items1: this.data.items1 })
        }
        if (!res.authSetting['scope.camera']) {
          this.data.items1[1].kaiguan = '关'
          this.setData({ items1: this.data.items1 })
        }
        else {
          this.data.items1[1].kaiguan = '开'
          this.setData({ items1: this.data.items1 })
        }
      }
    })
  },
  switchHandle:function(e){
   wx.showModal({
     title: '是否修改权限',
     content: '若确定修改该功能权限，即将跳转至设置页。',
     success:res=>{
       if(res.confirm){
         wx.openSetting({
           success: res => {
             console.log("成功跳往设置页")
           }
         })
       }
       else if(res.cancel){
         console.log("用户点击取消")
      }
     }
   })
  }
})