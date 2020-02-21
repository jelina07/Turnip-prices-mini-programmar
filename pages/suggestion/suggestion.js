// pages/suggestion/suggestion.js
Page({
  data: {
    disabled:true,
    inputvalue:false
  },
  stylechange:function(e){
    if (e.detail.value.length>=6){
      this.data.disabled = false
      this.setData({disabled:this.data.disabled})
    }
    else{
      this.data.disabled = true
      this.setData({ disabled: this.data.disabled })
    }
  },
  formSubmit:function(e){
    // wx.request({
    //    url:"",
    //    data:{
    //      x:"",
    //      y:""
    //    },
    //    hender:{
    //    },
    //    method:"POST",
    //    success:res => {
         
    //    },
    //    fail:res =>{
    //    }
    // })
    console.log(e.detail.value.suggestions)
    this.data.inputvalue = !this.data.inputvalue
    this.setData({inputvalue:this.data.inputvalue})
    wx.showToast({
      title: '提交成功',
      icon: 'success', //当icon：'none'时，没有图标 只有文字
      duration: 1500
    })
    this.data.disabled = true
    this.setData({ disabled: this.data.disabled })
    console.log(e.detail.value.connection)

  }
  
})