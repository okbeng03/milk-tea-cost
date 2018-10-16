module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
 
  const MaterialSchema = new Schema({
    id: Schema.Types.ObjectId,
    // 类型：基础材料、配方材料
    type: {
      type: String,
      enum: ['material', 'recipe']
    },
    name: String,
    // 价格
    price: Number,
    minPrice: Number,
    // 单位
    unit: String,
    // 数量
    quantity: {
      type: Number,
      default: 0
    },
    // 配方需要
    datum: Number,
    // 配方
    recipe: String // '翡翠茉莉绿茶: 100g, 热水: 3000g, 冰块: 2000g'
    // datum: Number,
    // // 基准数量
    // datumQuantity: Number,
    // // 基准价格
    // datumPrice: Schema.Types.Decimal128,
    // // 基准单位
    // datumUnit: String
  })
 
  return mongoose.model('Material', MaterialSchema)
}
