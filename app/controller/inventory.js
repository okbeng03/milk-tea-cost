const Controller = require('egg').Controller
const path = require('path')
const loadCSV = require('../util/loadCSV')

class InventoryController extends Controller {
  // 入库
  async putIn () {

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
