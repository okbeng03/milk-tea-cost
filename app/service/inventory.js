const _ = require('lodash')
const Service = require('egg').Service
const recipeParse = require('../util/recipe').parse

class InventoryService extends Service {
  async list (name) {
    const { ctx } = this
    const Inventory = ctx.model.Inventory

    try {
      const result = await Inventory.find({ name }, '', { sort: { date: 'desc' } })

      return {
        success: true,
        data: result
      }
    } catch (err) {
      return {
        success: false,
        message: err.message
      }
    }
  }

  async findLast (name) {
    const { ctx } = this
    const Inventory = ctx.model.Inventory

    try {
      const result = await Inventory.findOne({ name }, '', { sort: { date: 'desc' } })

      if (result) {
        return {
          success: true,
          data: result
        }
      } else {
        return {
          success: false,
          message: '找不到结果'
        }
      }
    } catch (err) {
      return {
        success: false,
        message: err.message
      }
    }
  }

  // 入库
  async putIn (data) {
    // 先查
    const { ctx } = this
    const Material = ctx.model.Material
    let { name, price, unit, quantity, datum, datumUnit } = data
    let material = await ctx.service.material.findOneByName(name, '_id name price quantity unit minPrice')
    let oldPrice = material.price

    if (material) {
      // 比较单位
      if (datumUnit !== material.unit) {
        return {
          name,
          success: false,
          message: `【${name}】：基准单位应为${material.unit}，实际为${datumUnit}，请重新录入`
        }
      } else {
        // 计算成本
        datum = eval(datum)
        let datumPrice = price / datum
        let msg
        let minPrice = material.minPrice || Infinity

        if (material.price) {
          const diff = datumPrice - material.price
          const newPrice = (material.price * material.quantity + price * quantity) / (material.quantity + quantity)
          if (diff > 0) {
            msg = `【${name}】：成本提升了！before: ${material.price}, now: ${datumPrice}`
            datumPrice = newPrice
          } else {
            datumPrice = newPrice
            minPrice = _.min([minPrice, datumPrice])

            if (minPrice !== material.minPrice) {
              msg = `【${name}】：恭喜，成本又创新低了！before: ${material.price}, now: ${datumPrice}`
            }
          }
        } else {
          minPrice = datumPrice
        }

        material.price = datumPrice
        material.minPrice = minPrice
        material.quantity = quantity * datum + material.quantity

        try {
          // 查配方更新
          await ctx.service.inventory.updateRecipe(material, oldPrice)

          // 查产品更新
          await ctx.service.inventory.updateGood(material, oldPrice)

          // 材料更新
          await material.save()
          
          // 入库保存
          const Inventory = ctx.model.Inventory
          const inventory = new Inventory({
            name: name,
            date: new Date(),
            price: price,
            unit: unit,
            quantity: quantity,
            datum: datum,
            datumUnit: datumUnit,
            datumQuantity: 1,
            datumPrice: datumPrice
          })
          await inventory.save()
        } catch (err) {
          return {
            name,
            success: false,
            message: err.message
          }
        }

        return {
          success: true,
          message: msg,
          name
        }
      }
    } else {
      return {
        name,
        success: false,
        message: `【${name}】：先录入再入库`
      }
    }
  }

  // 批量入库
  async putInByBatch (materials) {
    const { ctx } = this
    const success = []
    const fail = []

    for (let i = 0, len = materials.length; i < len; i++) {
      const result = await ctx.service.inventory.putIn(materials[i])

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

  // 更新配方
  async updateRecipe (material, oldPrice) {
    const { ctx } = this
    const { name, price } = material
    const Material = ctx.model.Material

    const list = await Material.find({
      type: 'recipe',
      recipe: new RegExp(`${name}:`)
    }, '_id name price minPrice recipe')
    const len = list.length
    let item

    if (len) {
      try {
        for (let i = 0; i < len; i++) {
          item = list[i]
          const recipes = recipeParse(item.recipe)
          const recipe = _.find(recipes, { name })
          const newPrice = item.price - oldPrice * recipe.quantity + price * recipe.quantity
          const minPrice = _.min([item.minPrice, newPrice])

          item.price = newPrice
          item.minPrice = minPrice

          await item.save()
        }

        return {
          success: true
        }
      } catch (err) {
        return {
          success: false,
          message: err.message
        }
      }
    } else {
      return {
        success: true
      }
    }
  }

  // 更新产品
  async updateGood (material, oldPrice) {
    const { ctx } = this
    const { name, price } = material
    const Good = ctx.model.Good

    const goods = await Good.find({
      recipe: new RegExp(`${name}:`)
    })
    const len = goods.length
    let good

    if (len) {
      try {
        for (let i = 0; i < len; i++) {
          good = goods[i]
          const recipes = recipeParse(good.recipe)
          const recipe = _.find(recipes, { name })
          const costDetail = JSON.parse(good.costDetail)
          const item = _.find(costDetail, { name })
          item.price = price
          item.cost = price * recipe.quantity

          good.cost = good.cost - oldPrice * recipe.quantity + price * recipe.quantity
          good.gain = good.price - good.cost
          good.costDetail = JSON.stringify(costDetail)

          await good.save()
        }

        return {
          success: true
        }
      } catch (err) {
        console.error(err)
        return {
          success: false,
          message: err.message
        }
      }
    } else {
      return {
        success: true
      }
    }
  }
}

module.exports = InventoryService
