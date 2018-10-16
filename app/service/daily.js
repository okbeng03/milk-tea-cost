const path = require('path')
const Service = require('egg').Service

class DailyService extends Service {
  async create (data) {
    const { ctx } = this
    const Daily = ctx.model.Daily
    const daily = new Daily(data)
    
    try {
      await daily.save()

      return {
        success: true
      }
    } catch (err) {
      return {
        success: false,
        message: err.message
      }
    }
  }

  async list () {
    const { ctx } = this
    const Daily = ctx.model.Daily

    try {
      const dailies = await Daily.find({}, 'date goodAmount amount discount earning cost gain', { sort: { date: 'desc' } })
      let amount = 0
      let goodAmount = 0
      let discount = 0
      let earning = 0
      let cost = 0
      let gain = 0

      dailies.forEach(item => {
        amount += item.amount
        goodAmount += item.goodAmount
        discount += item.discount
        earning += item.earning
        cost += item.cost
        gain += item.gain
      })
      
      return {
        success: true,
        data: {
          list: dailies,
          amount,
          goodAmount,
          discount,
          earning,
          cost,
          gain
        }
      }
    } catch (err) {
      return {
        success: false,
        message: err.message
      }
    }
  }
}

module.exports = DailyService
