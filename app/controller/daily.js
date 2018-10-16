const Controller = require('egg').Controller

class DailyController extends Controller {
  async index () {
    await this.ctx.render('page/daily/list.njk')
  }

  async list () {
    const { ctx } = this
    ctx.body = await ctx.service.daily.list()
  }
}

module.exports = DailyController
