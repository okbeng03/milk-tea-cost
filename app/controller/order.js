const Controller = require('egg').Controller

class OrderController extends Controller {
  async index () {
    await this.ctx.render('page/order/list.njk')
  }

  async list () {
    const { ctx } = this
    const { date } = ctx.request.query
    ctx.body = await ctx.service.order.list(date)
  }

  async leadIn () {
    const { ctx } = this
    const date = ctx.query.date

    ctx.body = await ctx.service.order.leadIn(date)
  }
}

module.exports = OrderController
