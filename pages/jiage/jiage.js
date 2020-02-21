//可以改，减少读取收藏次数
var util = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    week:'',//星期
    today:'',//日期 
    pinzhong:'蔬菜',
    list:[{name:"蔬菜",isclick:true},
          {name:"肉禽蛋类",isclick:false},
          {name:"水产品",isclick:false},
          {name:"豆制品与粮食",isclick:false},
          {name:"水果",isclick: false}],
    list2: []
  },
  watch: {
    pinzhong: function (newValue) {
    }
  },
  fangda(e){
    var item = this.data.list2[e.currentTarget.dataset.set]
    wx.navigateTo({
      url: '../fangda/fangda' + "?name=" + item.name + '&minP=' + item.minP + '&maxP=' + item.maxP + '&aprice=' + item.aprice,
      success: function (res) {
        console.log("跳转放大页面成功")
      }
    })
  },
  changeImg:function(e){
    var idback = wx.getStorageSync("id")
    var item = 0
    if (this.data.pinzhong == "蔬菜"){
      item = app.globalData.listVegetable[e.currentTarget.dataset.index]
      item.heart = !item.heart
      this.setData({ list2: app.globalData.listVegetable })
    } 
    else if (this.data.pinzhong == "肉禽蛋类"){
      item = app.globalData.listMeat[e.currentTarget.dataset.index]
      item.heart = !item.heart
      this.setData({ list2: app.globalData.listMeat })
    }
    else if (this.data.pinzhong == "水产品") {
      item = app.globalData.listShui[e.currentTarget.dataset.index]
      item.heart = !item.heart
      this.setData({ list2: app.globalData.listShui })
    }
    else if (this.data.pinzhong == "豆制品与粮食") {
      item = app.globalData.listDou[e.currentTarget.dataset.index]
      item.heart = !item.heart
      this.setData({ list2: app.globalData.listDou })
    }
    else {
      item = app.globalData.listFriut[e.currentTarget.dataset.index]
      item.heart = !item.heart
      this.setData({ list2: app.globalData.listFriut })
    }
     
    // false,则加入收藏夹
    if (!item.heart) {
      wx.request({
        url: 'https://yekejie.xyz/addCollect',
        data: {
          id: idback,
          collect_name: item.name
        },
        //method: "POST",
        success: res => {
          console.log(res.data)
        },
        fail: res => {
          console.log(res)
        }
      })
    }

    //true 移出收藏夹
    if (item.heart) {
      wx.request({
        url: 'https://yekejie.xyz/deleteCollect',
        data: {
          id: idback,
          collect_name: item.name
        },
        success: res => {
          console.log(res.data)
        },
        fail: res => {
          console.log(res)
        }
      })
    }
    wx.showToast({
      title: item.heart ? '取消收藏' : '收藏成功',
      icon: 'success'
    })
  },
  inputBind:function(){
    wx.navigateTo({
      url: '../sousuo/sousuo',
    })
  },
  zhongleionclick:function(e){
    for(var i=0; i<5; i++){
      if(this.data.list[i].isclick){
        this.data.list[i].isclick=false
        this.setData({list:this.data.list})
      }
    }
    var item2 = this.data.list[e.currentTarget.dataset.index]
    item2.isclick = !item2.isclick
    var pinzhong = item2.name
    app.setWatcher(this.data, this.watch)
    this.setData({list:this.data.list,
                  pinzhong:pinzhong})
    //不需要监听
    var idback = wx.getStorageSync('id')
    //读取收藏数据库
    var collectName = []
    wx.request({
      url: 'https://yekejie.xyz/readCollect',
      data: {
        id: idback,
      },
      success: res => {
        if (res.data == "NoData") {
          collectName = []
        }
        else {
          for (var i = 0; i < Object.keys(res.data).length; i++)
            collectName.push(res.data[i])
        }
        console.log(collectName)
      },
      fail: res => {
        console.log(res)
      }
    })
     //点击“蔬菜”
    if (this.data.list[0].isclick) {
      this.setData({ list2: app.globalData.listVegetable })
    }
     //点击“肉禽蛋类”
    if(this.data.list[1].isclick){
      //第一次点击
      if(app.globalData.listMeat.length == 0){
        for (var item of app.globalData.listMeatN) {
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
              vegetable: item
            },
            success: res => {
              wx.hideLoading()
              var flag = true
              console.log(res.data)
              if (res.data != "Not Found") {
                for (var collNa of collectName)
                  if (collNa == res.data.name) {
                    flag = false
                  }
                var obj = { image: "https://yekejie.xyz/static/" + res.data.name + ".jpg", name: res.data.name, aprice: res.data.average_price, heart: flag, minP: res.data.min_price, maxP: res.data.max_price }      //false已收藏
                // var obj = { image: "../../images/芹菜.jpg", name: res.data.name, aprice: res.data.average_price, heart: flag }  
                app.globalData.listMeat.push(obj)
                this.setData({ list2: app.globalData.listMeat })
              }
            },
            fail: res => {
              console.log("请求蔬菜价格等失败")
            }
          })
        }
      }
      //不是第一次点击
      else{
        this.setData({ list2: app.globalData.listMeat })
      }
    }

    //点击“水产品”
    if (this.data.list[2].isclick) {
      //第一次点击
      if (app.globalData.listShui.length == 0) {
        for (var item of app.globalData.listShuiN) {
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
              vegetable: item
            },
            success: res => {
              wx.hideLoading()
              var flag = true
              console.log(res.data)
              if (res.data != "Not Found") {
                for (var collNa of collectName)
                  if (collNa == res.data.name) {
                    flag = false
                  }
                var obj = { image: "https://yekejie.xyz/static/" + res.data.name + ".jpg", name: res.data.name, aprice: res.data.average_price, heart: flag, minP: res.data.min_price, maxP: res.data.max_price }
                app.globalData.listShui.push(obj)
                this.setData({ list2: app.globalData.listShui })
              }
            },
            fail: res => {
              console.log("请求蔬菜价格等失败")
            }
          })
        }
      }
      //不是第一次点击
      else {
        this.setData({ list2: app.globalData.listShui })
      }
    }

    //点击“豆制品与粮食”
    if (this.data.list[3].isclick) {
      //第一次点击
      if (app.globalData.listDou.length == 0) {
        for (var item of app.globalData.listDouN) {
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
              vegetable: item
            },
            success: res => {
              wx.hideLoading()
              var flag = true
              console.log(res.data)
              if (res.data != "Not Found"){
                for (var collNa of collectName)
                  if (collNa == res.data.name) {
                    flag = false
                }
                var obj = { image: "https://yekejie.xyz/static/" + res.data.name + ".jpg", name: res.data.name, aprice: res.data.average_price, heart: flag, minP: res.data.min_price, maxP: res.data.max_price }  //false已收藏
                app.globalData.listDou.push(obj)
                this.setData({ list2: app.globalData.listDou })
              }
            },
            fail: res => {
              console.log("请求蔬菜价格等失败")
            }
          })
        }
      }
      //不是第一次点击
      else {
        this.setData({ list2: app.globalData.listDou })
      }
    }

    //点击“水果”
    if (this.data.list[4].isclick) {
      //第一次点击
      if (app.globalData.listFriut.length == 0) {
        for (var item of app.globalData.listFriutN) {
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
              vegetable: item
            },
            success: res => {
              wx.hideLoading()
              var flag = true
              console.log(res.data)
              if (res.data != "Not Found") {
                for (var collNa of collectName)
                  if (collNa == res.data.name) {
                    flag = false
                  }
                var obj = { image: "https://yekejie.xyz/static/" + res.data.name + ".jpg", name: res.data.name, aprice: res.data.average_price, heart: flag, minP: res.data.min_price, maxP: res.data.max_price }  //false已收藏
                app.globalData.listFriut.push(obj)
                this.setData({ list2: app.globalData.listFriut })
              }
            },
            fail: res => {
              console.log("请求蔬菜价格等失败")
            }
          })
        }
      }
      //不是第一次点击
      else {
        this.setData({ list2: app.globalData.listFriut })
      }
    }
  },
  onShow: function () {
    if(this.data.pinzhong == "蔬菜")
      this.setData({ list2: app.globalData.listVegetable })
    else if (this.data.pinzhong == "肉禽蛋类")
      this.setData({ list2: app.globalData.listMeat })
    else if (this.data.pinzhong == "水产品")
      this.setData({ list2: app.globalData.listShui })
    else if (this.data.pinzhong == "豆制品与粮食")
      this.setData({ list2: app.globalData.listDou })
    else
      this.setData({ list2: app.globalData.listFriut })
    // for (var i = 0; i < 5; i++) {
    //   if (this.data.list[i].isclick) {
    //     this.data.list[i].isclick = false
    //     this.setData({ list: this.data.list })
    //   }
    // }
    // this.data.list[0].isclick = true
    // this.setData({ list: this.data.list })
    // this.setData({ pinzhong: "蔬菜" })
  },
  onLoad: function (option) {
    var idback = wx.getStorageSync('id')
    var collectName = []
    wx.request({
      url: 'https://yekejie.xyz/readCollect',
      data: {
        id: idback,
      },
      success: res => {
        if (res.data == "NoData") {
          collectName = []
        }
        else {
          for (var i = 0; i < Object.keys(res.data).length; i++)
            collectName.push(res.data[i])
        }
        console.log(collectName)
      },
      fail: res => {
        console.log(res)
      }
    })
    //显示蔬菜列表
    for (var item of app.globalData.listVegetableN) {
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
          vegetable: item
        },
        success: res => {
          wx.hideLoading()
          var flag = true
          console.log(res.data)
          if (res.data != "Not Found") {
            for (var collNa of collectName)
              if (collNa == res.data.name) {
                flag = false
              }
            var obj = { image: "https://yekejie.xyz/static/" + res.data.name + ".jpg", name: res.data.name, aprice: res.data.average_price, heart: flag, minP: res.data.min_price, maxP: res.data.max_price }  //false已收藏
            app.globalData.listVegetable.push(obj)
            this.setData({ list2: app.globalData.listVegetable })
          }
        },
        fail: res => {
          console.log("请求蔬菜价格等失败")
        }
      })
    }
    //获取时间
    var time = util.formatTime(new Date());
    console.log(time)
    this.data.today = time
    this.setData({ today: this.data.today})
    //获取星期
    var weekArray = new Array("日", "一", "二", "三", "四", "五", "六");
    var week = weekArray[new Date().getDay()];  //注意此处必须是先new一个Date
   // console.log(week)
    this.data.week = week
    this.setData({ week: this.data.week })
    //if pinzhong = '蔬菜' 访问蔬菜信息所在页面的价格
  }
})