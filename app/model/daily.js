module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
 
  const DailySchema = new Schema({
    id: Schema.Types.ObjectId,
    date: Date,
    // 订单数量
    orderAmount: {
      type: Number,
      default: 0
    },
    // 数量
    goodAmount: {
      type: Number,
      default: 0
    },
    // 合计
    amount: {
      type: Number,
      default: 0
    },
    // 优惠
    discount: {
      type: Number,
      default: 0
    },
    // 收入
    earning: {
      type: Number,
      default: 0
    },
    // 成本
    cost: {
      type: Number,
      default: 0
    },
    // 收益
    gain: {
      type: Number,
      default: 0
    }
  })
 
  return mongoose.model('Daily', DailySchema)
}
