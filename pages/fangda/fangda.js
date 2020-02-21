// pages/fangda/fangda.js
const app = getApp()
Page({
  data: {
    image:"",
    name:"",                            //接受上一页面传来的菜名，用于向服务器请求剩余的数据           
    avprice:"", 
    minTomax:"",
    zhangfu:"5%",
    tiaoxuan1:"1、豆腐的颜色应该略带点微黄，如果过于死白，有可能添加了漂白剂，不宜选购2、好的盒装内酯豆腐在盒内无空隙，表面平整，无气泡，不出水，拿在手里摇时无晃动感，开盒可闻到少许豆香气;",
    caipu:"content"
  },
  fanhui:function(e){
    wx.navigateBack({
      delta: 1
    })
  },
  onLoad: function (option) {
    var up = (Math.random() * 20 % 20 -10).toFixed(2)
    console.log(up)
    this.setData({ name: option.name ,
                   avprice: option.aprice,
                   minTomax: option.minP + " - " + option.maxP,
                   zhangfu: up+"%",
                   image: "https://yekejie.xyz/static/" + option.name + ".jpg"
                })
    wx.request({
      url: 'https://yekejie.xyz/searchSuggest',
      data: {
        name:this.data.name
      },
      //method: "POST",
      success: res => {
        console.log(res.data)
        this.setData({ tiaoxuan1:res.data.method })
      },
      fail: res => {
        console.log(res)
      }
  })
  },
})