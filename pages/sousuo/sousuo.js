// pages/sousuo/sousuo.js
const app = getApp() 
Page({
  data: {
    // keyValue:'',
    // collectName:[],
    lenghtmore1:false, 
    inputVal: "",
    tishi:"请输入您想搜索的名称",
    list2: []
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
  lengthHeadle:function(e){
    console.log(e.detail.value)
    this.setData({ list2:[] })
    if (e.detail.value == ''){
      this.setData({ tishi: "请输入您想搜索的名称",
                     lenghtmore1: false
                  })
    }
    else {
      this.setData({ tishi: "" ,
                    lenghtmore1:true
                  })
    }
    // console.log(e.detail.value)
    //this.setData({ keyValue: e.detail.value })
    // console.log(this.data.keyValue)
    /* *** */
    // if (e.detail.value.length>0){
    //   this.data.lenghtmore1=true
    //   this.setData({lenghtmore1:this.data.lenghtmore1})
    // }
    // else{
    //   this.data.lenghtmore1 = false
    //   this.setData({ lenghtmore1: this.data.lenghtmore1})
    // }
    // var newList = []
    // for (var item of this.data.list) {
    //   if (item.name.indexOf(e.detail.value) != -1 && e.detail.value!='') {
    //     newList.push(item)
    //   }
    // }
    // this.setData({ list2: newList })
    // // console.log(this.data.list2)
    // if (e.detail.value != '' && newList.length == 0) {
    //   this.setData({ tishi: "抱歉，没有搜索到结果" })
    // }
    // else if (e.detail.value == '' && newList.length == 0){
    //   this.setData({ tishi: "请输入您想搜索的名称" })
    // }
  },
  // inputBind: function (e) {
  //   this.data.dianji=true
  //   this.setData({dianji:this.data.dianji})
  // },
  clearInput: function () {
    this.setData({
      lenghtmore1:false,
      inputVal: "", 
      list2: [],
      tishi: "请输入您想搜索的名称"
    });
  },
  dianjisousuo:function(e){
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
    var searchName = []
    var list2Show = []
    console.log('开始搜索')
    //1
    if (e.detail.value != ''){
      var allVegName = app.globalData.listIndexN.concat(app.globalData.listMeatN).concat(app.globalData.listVegetableN).concat(app.globalData.listFriutN).concat(app.globalData.listShuiN).concat(app.globalData.listDouN)
      for (var item of allVegName) {
        if (item.indexOf(e.detail.value) != -1)
          searchName.push(item)
    }
      if(searchName.length != 0){
        for(var item of searchName){
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
                // var obj = { image: "../../images/土豆.jpg", name: res.data.name, aprice: res.data.average_price, heart: flag }  //false已收藏
                list2Show.push(obj)
                this.setData({ list2: list2Show })
              }
            },
            fail: res => {
              console.log("请求蔬菜价格等失败")
            }
          })
         }
         /* 有个小bug */
        // if (this.data.list2.length == 0)   //搜寻结果返回“Not Found”导致list2为空  
        //   this.setData({ tishi: "抱歉，hhh" })
      }
      else{   //输入的名称不存在
        this.setData({ tishi: "抱歉，没有搜索到结果" })
      }
    }
    else {
      this.setData({ tishi: "抱歉，您没有输入名称" })
    }
  
    //如果list2不为空则显示，在一定时间内显示加载中，超过时间显示找不到
    // var newList = []
    // for(var item of this.data.list){
    //   if(item.name.indexOf(this.data.keyValue)!=-1){
    //     newList.push(item)
    //   }
    // }
    // this.setData({list2: newList})
    // // console.log(this.data.list2)
    // if (newList.length==0){
    //   this.setData({ tishi:"抱歉，没有搜索到结果"})
    // }
  },
  // onShow(){
  //   this.setData({  })
  // },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})