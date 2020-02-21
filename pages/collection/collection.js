// pages/collection/collection.js
const app = getApp()
Page({
  data: { 
    //收藏的水果蔬菜的名字列表  (图片，名称，平均价,x:0)
    list: [],
    currentX:'',
    tishi:"收藏夹空空的~",
    tishiShow:true    //true不显示
  },
  
  //只要是使用了 redirectTo() 或 navigateBack()，再次进入页面就会调用 onLoad()
  onLoad:function(e){
    var idback = wx.getStorageSync('id')
    var listShow = []
    wx.request({
      url: 'https://yekejie.xyz/readCollect',
      data: {
        id: idback,
      },
      success: res => {
        console.log(res.data)
        if(res.data == "NoData"){
          this.setData({ tishiShow: false })
        }
        else{
          for (var i = 0; i < Object.keys(res.data).length; i++){
            wx.showLoading({
              title: '数据加载中',
              mask: true
            })
            wx.request({
              url: 'https://yekejie.xyz/search',
              data: {
                id: idback,
                pname: app.globalData.province,
                cityname: app.globalData.city,
                adname: app.globalData.district,
                vegetable: res.data[i]
              },
              success:res => {
                wx.hideLoading()
                var obj = { image: "https://yekejie.xyz/static/" + res.data.name + ".jpg", name: res.data.name, aprice: res.data.average_price,x:0}
                listShow.push(obj)
                this.setData({ list:listShow })
                if (this.data.list.length == 0){
                  this.setData({ tishiShow:false })
                  console.log(this.data.list)
                }
              },
              fail: res => {
                console.log("查询失败")
              }
            })
          }
        }
      },
      fail: res => {
        console.log(res)
      }
    })
  },
  removelistHandle:function(e){
    var idback = wx.getStorageSync("id")
    wx.showModal({
      title: '提示',
      content: '确认要删除么',
      success: res => {
        if (res.confirm) {
          var list = this.data.list 
          var name = list[e.currentTarget.dataset.set].name                                             //确认之后要调用deleteCollection
          list.splice(e.currentTarget.dataset.set, 1)
          this.setData({ list: list })
          var flag = false
          //判断删除的是否在首页中，若是，则将首页中的heart变为空
          if(!flag){
            for (var item of app.globalData.listIndex) {
              if (name == item.name){
                item.heart = true
                flag = true
              }
            }
          }
          //判断删除的是否在蔬菜中，若是，则将蔬菜中的heart变为空
          if (!flag) {
            for (var item of app.globalData.listVegetable) {
              if (name == item.name) {
                item.heart = true
                flag = true
              }
            }
          }
          //判断删除的是否在肉禽蛋类中，若是，则将肉禽蛋类中的heart变为空
          if (!flag) {
            for (var item of app.globalData.listMeat) {
              if (name == item.name) {
                item.heart = true
                flag = true
              }
            }
          }
          //判断删除的是否在水产品中，若是，则将水产品中的heart变为空
          if (!flag) {
            for (var item of app.globalData.listShui) {
              if (name == item.name) {
                item.heart = true
                flag = true
              }
            }
          }
          //判断删除的是否在豆制品中，若是，则将豆制品中的heart变为空
          if (!flag) {
            for (var item of app.globalData.listDou) {
              if (name == item.name) {
                item.heart = true
                flag = true
              }
            }
          }
          //判断删除的是否在水果中，若是，则将水果中的heart变为空
          if (!flag) {
            for (var item of app.globalData.listFriut) {
              if (name == item.name) {
                item.heart = true
                flag = true
              }
            }
          }
          wx.request({
            url: 'https://yekejie.xyz/deleteCollect',
            data:{
              id: idback,
              collect_name: name
            },
            success:res => {
              // wx.request({
              //   url: 'https://yekejie.xyz/readCollect',
              //   data: {
              //     id: idback,
              //   },
              //   success: res => {
              //     app.globalData.collectName = []
              //     for (var i = 0; i < Object.keys(res.data).length; i++)
              //       app.globalData.collectName.push(res.data[i])
              //     console.log(app.globalData.collectName)
              //   },
              //   fail: res => {
              //     console.log(res)
              //   }
              // })
            }
          })
        } else if (res.cancel) {
          var item = this.data.list[e.currentTarget.dataset.set]
          item.x = 0
          this.setData({ list: this.data.list })
        }
      }
    })
  },
   handleTouchend:function(e){
     console.log(e)
     if (this.data.currentX > -22) {
       var item = this.data.list[e.currentTarget.dataset.set]
       item.x = 0
       this.setData({
         list: this.data.list 
       })
     } else {
       var item = this.data.list[e.currentTarget.dataset.set]
       item.x = -55
       this.setData({
         list: this.data.list
       })
     }
   },
  suohui:function(e){
    var item = this.data.list[e.currentTarget.dataset.set]
    item.x = 0
    this.setData({
      list: this.data.list
    })
  },
  handleMovableChange:function(e){
    this.data.currentX = e.detail.x
    this.setData({currentX:this.data.currentX})
    //console.log(this.data.currentX)
  }
})