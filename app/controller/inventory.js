const Controller = require('egg').Controller
const path = require('path')
const loadCSV = require('../util/loadCSV')

class InventoryController extends Controller {
  async list () {
    const { ctx, service } = this
    ctx.body = await service.inventory.list(ctx.request.query.name)
  }

  // 查找最新入库的
  async findLast () {
    const { ctx, service } = this
    ctx.body = await service.inventory.findLast(ctx.request.query.name)
  }

  // 入库
  async putIn () {
    const { ctx, service } = this
    const result = await service.inventory.putIn(ctx.request.body)

    ctx.body = {
      success: true,
      data: result
    }
  }

  // 批量入库
  async putInByBatch () {
    const { ctx, service } = this
    const materials = await loadCSV(path.resolve(ctx.app.config.baseDir, 'app/record/material.csv'))
    const result = await service.inventory.putInByBatch(materials)
    ctx.body = result
  }
}

module.exports = InventoryController
