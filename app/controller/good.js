const Controller = require('egg').Controller
const path = require('path')
const loadCSV = require('../util/loadCSV')

class GoodController extends Controller {
  async index () {
    await this.ctx.render('page/good/list.njk')
  }

  async list () {
    const { ctx } = this
    const { sort } = ctx.request.query
    
    if (sort) {
      const [ type, order ] = sort.split('-')
      ctx.body = await ctx.service.good.list({
        type: order
      })
    } else {
      ctx.body = await ctx.service.good.list()
    }
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
    const goods = await loadCSV(path.resolve(ctx.app.config.baseDir, 'app/record/good.csv'))
    const result = await service.good.leadIn(goods)
    ctx.body = result
  }
}
module.exports = GoodController
