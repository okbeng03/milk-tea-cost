module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
 
  const GoodSchema = new Schema({
    id: Schema.Types.ObjectId,
    // 分类
    category: String,
    name: String,
    // 规则
    specs: String,
    // 价格
    price: {
      type: Number,
      default: 0
    },
    unit: String,
    quantity: {
      type: Number,
      default: 1
    },
    // 配方
    recipe: String,
    // 成本
    cost: {
      type: Number,
      default: 0
    },
    // 收益
    gain: {
      type: Number,
      default: 0
    },
    costDetail: Array
  })
 
  return mongoose.model('Good', GoodSchema)
}
