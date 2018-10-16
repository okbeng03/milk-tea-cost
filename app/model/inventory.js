module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
 
  const InventorySchema = new Schema({
    id: Schema.Types.ObjectId,
    name: String,
    date: Date,
    // 规则
    // 价格
    price: {
      type: Number,
      default: 0
    },
    unit: String,
    quantity: Number,
    datum: Number,
    // 基准数量
    datumQuantity: Number,
    // 基准价格
    datumPrice: Number,
    // 基准单位
    datumUnit: String
  })
 
  return mongoose.model('Inventory', InventorySchema)
}
