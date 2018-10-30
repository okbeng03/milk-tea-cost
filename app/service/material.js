const _ = require('lodash')
const Service = require('egg').Service
const recipeParse = require('../util/recipe').parse

class MaterialService extends Service {
  async findOneByName (name, fields = '_id') {
    const { ctx } = this
    const Material = ctx.model.Material
    const result = await Material.findOne({ name }, fields)

    return result
  }

  async list () {
    const { ctx } = this
    const Material = ctx.model.Material
    
    return {
      success: true,
      data: await Material.find()
    }
  }

  async create (name, unit, minQuantity) {
    const { ctx } = this
    const Material = ctx.model.Material
    const result = await ctx.service.material.findOneByName(name)

    if (result) {
      return result._id
    }

    const material = new Material({
      type: 'material',
      name: name,
      price: 0,
      unit: unit,
      minQuantity: minQuantity
    })
    await material.save()
    return material._id
  }

  async createRecipe (name, unit, recipe, quantity, datum = 0) {
    const { ctx } = this
    const Material = ctx.model.Material
    const result = await ctx.service.material.findOneByName(name)

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
    let count = 0
    let item
    let msg
    
    for (let i = 0, len = recipes.length; i < len; i++) {
      item = recipes[i]
      count += item.quantity
      const stuff = await ctx.service.material.findOneByName(item.name, 'price')

      if (!stuff) {
        return {
          name: name,
          success: false,
          message: `【${name}】： 找不到材料【${item.name}】`
        }
      }

      amout += item.quantity * stuff.price
    }

    const price = amout / (datum ? datum : count)
    const material = new Material({
      type: 'recipe',
      name: name,
      price: price,
      minPrice: price,
      unit: unit,
      quantity: quantity,
      datum: datum - 0,
      recipe: recipe
    })

    try {
      await material.save()
    } catch (err) {
      return {
        name,
        success: false,
        message: err.message
      }
    }
    return {
      name: name,
      success: true
    }
  }

  // 基础材料录入
  async leadIn (materials) {
    const { ctx } = this
    const list = []

    for (let i = 0, len = materials.length; i < len; i++) {
      const id = await ctx.service.material.create(materials[i].name, materials[i].datumUnit, eval(materials[i].minQuantity))
      list.push({
        id,
        name: materials[i].name
      })
    }

    return list
  }

  // 配方录入
  async leadInRecipe (materials) {
    const { ctx } = this
    const success = []
    const fail = []

    for (let i = 0, len = materials.length; i < len; i++) {
      const result = await ctx.service.material.createRecipe(materials[i].name, materials[i].unit, materials[i].recipe, materials[i].quantity, materials[i].datum)
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

  // 使用
  async use (name, quantity) {
    const { ctx } = this
    const Material = ctx.model.Material
    const result = await ctx.service.material.findOneByName(name, '_id, name type quantity')
    let msg = ''
    let success = true

    if (result.type === 'material') {
      let less = result.quantity - quantity
      
      if (less < 0) {
        less = 0
        msg = `【${name}】材料已用完，请及时补货`
      }

      try {
        await Material.findOneAndUpdate({
          _id: result._id
        }, {
          quantity: less
        })
      } catch (err) {
        success: false
        msg = err.message
      }
    }

    const response = {
      success
    }

    if (msg) {
      response.message = msg
    }

    return response
  }
}

module.exports = MaterialService
