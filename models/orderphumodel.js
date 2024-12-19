const db = require('./db')

const orderphuSchema = new db.mongoose.Schema({
  orderId: { type: String },
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  diachi: { type: String },
  tongtien: { type: Number },
  ngaymua: { type: Date },
  sanpham: [{ type: db.mongoose.Schema.Types.ObjectId, ref: 'chitietsp' }]
})

const orderphu = db.mongoose.model('orderphu', orderphuSchema)
module.exports = { orderphu }
