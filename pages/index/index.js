var util = require('../../utils/util.js');
const app = getApp()
Page({
  data: {
    week: '',//星期
    today: '',//日期
    location:'',
    // userLocation:'', 
    locationComplete:true,
    list: [] 
  },
  changeAddress(){
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
    var province = ""
    var city = ""
    var district = ""
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: res => {
        console.log("定位成功");
        var locationString = res.latitude + "," + res.longitude;
        wx.showLoading({
          title: '数据加载中',
          mask: true
        })
        wx.request({
          url: 'http://apis.map.qq.com/ws/geocoder/v1/?l&get_poi=1',
          data: {
            "key": "FJ6BZ-DSOLU-IXTVS-4XFRC-QNCHT-JXBDV",
            "location": locationString
          },
          method: 'GET',
          // header: {}, 
          success: res => {
            console.log("请求成功");
            wx.hideLoading()
            var lastLocation = this.data.location
            province = res.data.result.address_component.province
            city = res.data.result.address_component.city
            district = res.data.result.address_component.district
            this.data.location = city + district
            if (this.data.location != lastLocation){
              this.setData({ location: this.data.location })
              app.globalData.province = province
              app.globalData.city = city
              app.globalData.district = district              
              wx.request({
                url: 'https://yekejie.xyz/updateAddress',
                data: {
                  id: idback,
                  pname: province,
                  cityname: city,
                  adname: district
                },
                header: {
                  'content-type': 'application/json'
                },
                success: res => {
                  console.log(res.data)
                }
              })
              // var listShow = []
              app.globalData.listIndex = []
              for (var i = 0; i < 25; i++) {
                wx.showLoading({
                  title: '数据加载中',
                  mask: true
                })
                wx.request({
                  url: 'https://yekejie.xyz/search',
                  data: {
                    id: idback,
                    pname: province,
                    cityname: city,
                    adname: district,
                    vegetable: app.globalData.listIndexN[i]
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
                      app.globalData.listIndex.push(obj)
                      this.setData({ list: app.globalData.listIndex })
                    }
                  },
                  fail: res => {
                    wx.hideLoading()
                    wx.showToast({
                      title: '网络请求失败',
                      icon: 'none',
                      duration: 3000
                    })
                    console.log("请求蔬菜价格等失败")
                  }
                })
              }
            }
          },
          fail: res => {
            wx.hideLoading()
            wx.showToast({
              title: '请求地址失败',
              icon: 'none',
              duration: 3000
            })
            console.log("请求地址失败");
          }
        })
      },
      fail: res => {
        console.log("定位失败");
        wx.showModal({
          title: '提示',
          content: '获取您的定位失败，小程序部分功能不可使用，是否前往设置页更改设置',
          confirmText: '前往',
          confirmColor: '#2ABB80',
          success: res => {
            if (res.confirm) {
              wx.openSetting({
                success: res => {
                  console.log(res.authSetting)
                }
              })
            } else if (res.cancel) {
              console.log('用户不前往设置')
            }
          }
        })
      }
    })
  },
  fangda(e){
    var item = this.data.list[e.currentTarget.dataset.set]
    wx.navigateTo({
      url: '../fangda/fangda' + "?name=" + item.name + '&minP=' + item.minP + '&maxP=' + item.maxP + '&aprice=' + item.aprice,
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        // res.eventChannel.emit('acceptDataFromOpenerPage', {name: item.name})
        console.log("跳转放大页面成功")
      }
    })
  },
  shoucangHandle(e) {
    var idback = wx.getStorageSync("id")
    var item = app.globalData.listIndex[e.currentTarget.dataset.index]
    item.heart = !item.heart
    this.setData({ list: app.globalData.listIndex })
    // false,则加入收藏夹
    if(!item.heart){ 
      wx.request({
        url: 'https://yekejie.xyz/addCollect',
        data: {
          id: idback,
          collect_name:item.name
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
  onShow:function(){
    this.setData({ list: app.globalData.listIndex })
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
        if (res.data == "NoData"){
          collectName = []
        }
        else{
          for (var i = 0; i < Object.keys(res.data).length; i++)
            collectName.push(res.data[i])
        }
        console.log(collectName)
      },
      fail: res => {
        console.log(res)
      }
    })
    wx.getSetting({
      success:res => {
        console.log(!res.authSetting.hasOwnProperty("scope.userLocation"))
        //新用户登录
        if (!res.authSetting.hasOwnProperty("scope.userLocation")){
        //if(isNew == 1){
          wx.getLocation({
            type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
            success: res => {
              console.log("定位成功");
              // this.data.userLocation = true
              // this.setData({ userLocation: this.data.userLocation})
              var locationString = res.latitude + "," + res.longitude;
              wx.showLoading({
                title: '数据加载中',
                mask: true
              })
              wx.request({
                url: 'http://apis.map.qq.com/ws/geocoder/v1/?l&get_poi=1',
                data: {
                  "key": "FJ6BZ-DSOLU-IXTVS-4XFRC-QNCHT-JXBDV",
                  "location": locationString
                },
                method: 'GET',
                success: res => {
                  console.log("请求成功");
                  wx.hideLoading()
                  var province = res.data.result.address_component.province
                  var city = res.data.result.address_component.city
                  var district = res.data.result.address_component.district
                  this.data.location = city + district
                  this.setData({ location: this.data.location })
                  app.globalData.province = province
                  app.globalData.city = city
                  app.globalData.district = district 
                  wx.request({
                    url: 'https://yekejie.xyz/updateAddress', 
                    data: {
                      id: idback,
                      pname: province,
                      cityname:city,
                      adname: district
                    },
                    header: {
                      'content-type': 'application/json' 
                    },
                    success:res => {
                      console.log(res.data)
                    }
                  })
                  //第一次登录获取地址成功，开始查询
                  if (this.data.location != '') {
                    //var listShow = []
                    for (var i = 0; i < 25; i++) {
                      wx.showLoading({
                        title: '数据加载中',
                        mask: true
                      })
                      wx.request({
                        url: 'https://yekejie.xyz/search',
                        data: {
                          id: idback,
                          pname: province,
                          cityname: city,
                          adname: district,
                          vegetable: app.globalData.listIndexN[i]
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
                            var obj = { image: "https://yekejie.xyz/static/" + res.data.name+".jpg", name: res.data.name, aprice: res.data.average_price, heart: flag , minP: res.data.min_price, maxP:res.data.max_price }  //false已收藏
                            app.globalData.listIndex.push(obj)
                            this.setData({ list: app.globalData.listIndex })
                          }
                        },
                        fail: res => {
                          wx.hideLoading()
                          wx.showToast({
                            title: '网络请求失败',
                            icon: 'none',
                            duration: 3000
                          })
                          console.log("请求蔬菜价格等失败")
                        }
                      })
                    }
                  }
                },
                fail: res => {
                  wx.hideLoading()
                  wx.showToast({
                    title: '请求地址失败',
                    icon: 'none',
                    duration: 3000
                  })
                  console.log("请求地址失败");
                }
              })
            },
            fail: res => {
              console.log("定位失败");
              // this.setData({locationComplete:false})
              wx.showModal({
                title: '提示',
                content: '获取您的定位失败，小程序部分功能不可使用，是否前往设置页更改设置',
                confirmText: '前往',
                confirmColor: '#2ABB80',
                success: res => {
                  if (res.confirm) {
                    wx.openSetting({
                      success: res => {
                        console.log(res.authSetting)
                      }
                    })
                  } else if (res.cancel) {
                    console.log('用户不前往设置')
                  }
                }
              })
            }
          })
        }
        //老用户登录
        else{
          wx.showLoading({
            title: '数据加载中',
            mask: true
          })
          wx.request({
            url: 'https://yekejie.xyz/getAddress', 
            data: {
              id: idback
            },
            header: {
              'content-type': 'application/json'
            },
            success:res => {
              wx.hideLoading()
              console.log(res.data)
              var province = res.data.pname
              var city = res.data.cityname
              var district = res.data.adname
              this.data.location = city + district
              this.setData({ location: this.data.location })
              app.globalData.province = province
              app.globalData.city = city
              app.globalData.district = district
              if (this.data.location != '' && this.data.location != null) {
                // var listShow = []
                //!!!!!!
                for(var i=0;i<25;i++){
                  wx.showLoading({
                    title: '数据加载中',
                    mask: true
                  })
                  wx.request({
                    url: 'https://yekejie.xyz/search',
                    data: {
                      id: idback,
                      pname: province,
                      cityname: city,
                      adname: district,
                      vegetable: app.globalData.listIndexN[i]
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
                        app.globalData.listIndex.push(obj)
                        this.setData({ list: app.globalData.listIndex })
                      }
                    },
                    fail: res => {
                      console.log("请求蔬菜价格等失败")
                    }
                  })
                 }
              }
            },
            fail:res=>{
              wx.hideLoading()
              wx.showToast({
                title: '网络请求失败',
                icon: 'none',
                duration: 3000
              })

            }
          })
        }
      }
    })
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success() {
              // 用户已经同意小程序使用相机功能，后续调用 createCameraContext() 接口不会弹窗询问
              wx.createCameraContext()
            }
          })
        }
      }
    })
    //获取时间
    var time = util.formatTime(new Date());
    console.log(time)
    this.data.today = time
    this.setData({ today: this.data.today })
    //获取星期
    var weekArray = new Array("日", "一", "二", "三", "四", "五", "六");
    var week = weekArray[new Date().getDay()];  //注意此处必须是先new一个Date
    console.log(week)
    this.data.week = week
    this.setData({ week: this.data.week })
    }
})
