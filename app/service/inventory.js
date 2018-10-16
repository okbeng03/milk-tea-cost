const _ = require('lodash')
const Service = require('egg').Service
const recipeParse = require('../util/recipe').parse

class InventoryService extends Service {
  // 入库
  async putIn (data) {
    // 先查
    const { ctx } = this
    const Material = ctx.model.Material
    let { name, price, unit, quantity, datum, datumUnit } = data
    let material = await ctx.service.material.findOneByName(name, '_id price quantity unit minPrice')

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

          if (diff > 0) {
            msg = `【${name}】：成本提升了！before: ${material.price}, now: ${datumPrice}`
            datumPrice = (material.price + datumPrice) / 2
          } else {
            datumPrice = (material.price + datumPrice) / 2
            minPrice = _.min([minPrice, datumPrice])

            if (minPrice !== material.minPrice) {
              msg = `【${name}】：恭喜，成本又创新低了！before: ${material.minPrice}, now: ${minPrice}`
            }
          }
        } else {
          minPrice = datumPrice
        }

        material.price = datumPrice
        material.minPrice = minPrice
        material.quantity = quantity * datum + material.quantity

        try {
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
          name,
          success: true,
          message: msg
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
}

module.exports = InventoryService
