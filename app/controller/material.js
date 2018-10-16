const Controller = require('egg').Controller
const path = require('path')
const loadCSV = require('../util/loadCSV')

class MaterialController extends Controller {
  async index () {
    await this.ctx.render('page/material/list.njk')
  }

  async list () {
    const { ctx } = this
    ctx.body = await ctx.service.material.list()
  }

  async create () {
    // const { ctx, service } = this
    // const res = await service.material.create(req)
    // // 设置响应内容和响应状态码
    // ctx.body = { id: res.id }
    // ctx.status = 201
  }

  // 导入
  async leadIn () {
    const { ctx, service } = this
    const materials = await loadCSV(path.resolve(ctx.app.config.baseDir, 'app/record/material.csv'))
    const result = await service.material.leadIn(materials)
    ctx.body = result
  }

  async leadInRecipe () {
    const { ctx, service } = this
    const materials = await loadCSV(path.resolve(ctx.app.config.baseDir, 'app/record/recipe.csv'))
    const result = await service.material.leadInRecipe(materials)
    ctx.body = result
  }
}
module.exports = MaterialController
