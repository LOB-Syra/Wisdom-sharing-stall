// pages/reserve/reserve.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoLatitude: "",
    photoLongitude: "",
    address: ""
  },
  postAddress: function () {
    var that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.openSetting({
            success: function (res) {
              if (res.authSetting['scope.userLocation']) {
                this.getAddress()
              }
            }
          })
        } else {
          this.getAddress()
        }
      }
    })
  },
  //如果成功的话就获得用户地理位置
  getAddress: function () {
    var that = this
    wx.getLocation({
      //小程序要求数据格式
      type: 'gcj02',
      success: function (res) {
        //console.log(res)
        var latitude = res.latitude
        var longitude = res.longitude
        app.qqmapsdk.reverseGeocoder({
          //输入坐标，返回对应文字信息
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (res) {
            //console.log(res)
            if (res.message == 'query ok') {
              var address = res.result.address
              that.setData({
                photoLatitude: latitude,
                photoLongitude: longitude,
                address: address,
              })
              db.collection('backdoor').where({
                  _openid: wx.getStorageSync('openid')
                })
                .get({
                  success: function (res) {
                    console.log(res.data)
                    if (res.data.length == 0) {
                      db.collection('backdoor').add({
                        data: {
                          address: that.data.address,
                          createTime: db.serverDate(),
                          updateTime: db.serverDate()
                        },
                      })
                    } else if (res.data[0].address != that.data.address) {
                      //console.log("更新地址")
                      db.collection('backdoor').where({
                        _openid: wx.getStorageSync('openid')
                      }).update({
                        data: {
                          address: that.data.address,
                          updateTime: db.serverDate()
                        },
                      })
                    }
                  }
                })
            }
          },
          fail: function (res) {
            console.log("我没了，为啥呀？" + res)
          },
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 1
      });
    }
    this.getAddress()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})