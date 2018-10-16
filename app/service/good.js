const _ = require('lodash')
const Service = require('egg').Service
const recipeParse = require('../util/recipe').parse

class GoodService extends Service {
  async findOneByName (name, category, specs, fields = '_id') {
    const { ctx } = this
    const Good = ctx.model.Good
    const result = await Good.findOne({ name, category, specs }, fields)

    return result
  }

  async create (name, category, specs = '', price, unit, recipe) {
    const { ctx } = this
    const Good = ctx.model.Good
    const result = await ctx.service.good.findOneByName(name, category, specs)

    if (result) {
      return {
        name: name,
        success: false,
        message: `【${name}】：已录入`
      }
    }

    // 根据配方计算价格
    const recipes = recipeParse(recipe)
    let amout = 0
    let item
    let msg
    let cost
    let detail = []
    
    for (let i = 0, len = recipes.length; i < len; i++) {
      item = recipes[i]
      const stuff = await ctx.service.material.findOneByName(item.name, 'price')

      if (!stuff) {
        return {
          name: name,
          success: false,
          message: `【${name}】： 找不到材料【${item.name}】`
        }
      }

      cost = item.quantity * stuff.price
      amout += cost
      detail.push({
        name: item.name,
        quantity: item.quantity,
        price: stuff.price,
        cost: cost
      })
    }

    const good = new Good({
      name,
      category,
      specs,
      price,
      recipe,
      unit,
      cost: amout,
      gain: price - amout,
      costDetail: detail
    })

    try {
      await good.save()
    } catch (err) {
      return {
        name,
        success: false,
        message: err.message
      }
    }

    return {
      name: name,
      price: price,
      cost: amout,
      gain: price - amout,
      // detail: detail,
      success: true,
    }
  }

  // 菜品录入
  async leadIn (goods) {
    const { ctx } = this
    const success = []
    const fail = []
    let good

    for (let i = 0, len = goods.length; i < len; i++) {
      good = goods[i]
      const result = await ctx.service.good.create(good.name, good.category, good.specs, good.price, good.unit || '杯', good.recipe)
      if (result.success) {
        success.push(result)
      } else {
        fail.push(result)
      }
    }

    return {
      success: !!success.length,
      data: {
        list: success,
        errors: {
          count: fail.length,
          list: fail
        }
      }
    }
  }

  async list (sort = {}) {
    const { ctx } = this
    const Good = ctx.model.Good
    
    return {
      success: true,
      data: await Good.find({}, 'name category specs price unit recipe cost gain costDetail', sort)
    }
  }
}

module.exports = GoodService
