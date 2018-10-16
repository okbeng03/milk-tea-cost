module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
 
  const OrderSchema = new Schema({
    id: Schema.Types.ObjectId,
    name: String,
    // 规格
    category: String,
    specs: String,
    price: {
      type: Number,
      default: 0
    },
    quantity: {
      type: Number
    },
    date: Date,
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
 
  return mongoose.model('Order', OrderSchema)
}
