const path = require('path')
const _ = require('lodash')
const Service = require('egg').Service
const excelToJson = require('convert-excel-to-json')
const recipeParse = require('../util/recipe').parse

const regNameSpecs = /(\S+)（(\S+)）/

class OrderService extends Service {
  async isExit (date) {
    const { ctx } = this
    const Order = ctx.model.Order
    const result = await Order.findOne({ date }, '_id')

    return !!result
  }

  async create (data, date) {
    const { ctx } = this
    const Order = ctx.model.Order
    let { name, category, price, quantity, amount, discount, earning } = data
    const match = name.match(regNameSpecs)
    let specs

    if (match) {
      name = match[1]
      specs = match[2]
      specs = specs === '份' ? '' : specs
    }

    // 计算成本
    const good = await ctx.service.good.findOneByName(name, category, specs, 'name cost recipe')

    if (good) {
      const cost = good.cost * quantity
      const gain = earning - cost
      const messages = []

      const order = new Order({
        name,
        category,
        specs,
        price,
        quantity,
        date,
        amount,
        discount,
        earning,
        cost,
        gain
      })

      // 减去材料数量
      const recipes = recipeParse(good.recipe)
      let recipe
      let useResult

      for (let i = 0, len = recipes.length; i < len; i++) {
        recipe = recipes[i]
        useResult = await ctx.service.material.use(recipe.name, recipe.quantity)

        if (useResult.message) {
          messages.push(useResult.message)
        }
      }

      try {
        await order.save()
      } catch (err) {
        messages.unshift(err.message)

        return {
          name,
          success: false,
          message: messages
        }
      }

      return {
        order,
        success: true,
        message: messages
      }
    } else {
      return {
        name,
        success: false,
        message: `【${name}（${specs || '份'}）-${category}】产品还未录入`
      }
    }
  }

  // 录入
  async leadIn (date) {
    const { ctx } = this
    const isExit = await ctx.service.order.isExit(date)

    if (isExit) {
      return {
        success: true,
        message: `${date}订单已录入`
      }
    }

    const orders = excelToJson({
      sourceFile: path.resolve(ctx.app.config.baseDir, `app/record/${date}.xlsx`),
      header:{
        rows: 1
      },
      columnToKey: {
        A: 'name',
        B: 'category',
        C: 'price',
        D: 'quantity',
        E: 'amount',
        F: 'discount',
        G: 'earning'
      }
    }).sheet1

    // 订单录入
    const success = []
    const fail = []
    let order
    let goodAmount = 0
    let amount = 0
    let discount = 0
    let earning = 0
    let cost = 0
    let gain = 0
    let messages = []

    for (let i = 0, len = orders.length; i < len; i++) {
      order = orders[i]
      const result = await ctx.service.order.create(order, date)

      if (result.success) {
        success.push(result)
        goodAmount += result.order.quantity
        amount += result.order.amount
        discount += result.order.discount
        earning += result.order.earning
        cost += result.order.cost
        gain += result.order.gain
        messages = messages.concat(result.message)
      } else {
        fail.push(result)
      }
    }

    let message = ''
    let dailyResult

    // 建立清单
    try {
      dailyResult = await ctx.service.daily.create({
        date,
        goodAmount,
        amount,
        discount,
        earning,
        cost,
        gain
      })

      if (!dailyResult.success) {
        message = dailyResult.message
      }
    } catch (err) {
      message = err.message
    }

    return {
      success: dailyResult.success,
      data: {
        successes: success,
        messages,
        errors: {
          count: fail.length,
          list: fail
        }
      },
      message
    }
  }

  async list (date) {
    const { ctx } = this
    const Order = ctx.model.Order
    const orders = await Order.find({ date: new Date(date) }, 'name category specs price quantity amount discount earning cost gain', { quantity: 'desc' })

    if (orders && orders.length) {
      let amount = 0
      let goodAmount = 0
      let discount = 0
      let earning = 0
      let cost = 0
      let gain = 0

      orders.forEach(item => {
        amount += item.amount
        goodAmount += item.quantity
        discount += item.discount
        earning += item.earning
        cost += item.cost
        gain += item.gain
      })
      
      return {
        success: true,
        data: {
          list: orders,
          amount,
          goodAmount,
          discount,
          earning,
          cost,
          gain
        }
      }
    } else {
      return {
        success: false,
        message: '当天无数据'
      }
    }
  }
}

module.exports = OrderService
