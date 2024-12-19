const db = require('./db')

const hoadonSchema = new db.mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  diachi: { type: String },
  tongtien: { type: Number },
  ngaymua: { type: Date },
  sanpham: [{ type: db.mongoose.Schema.Types.ObjectId, ref: 'chitietsp' }]
})

const hoadon = db.mongoose.model('hoadon', hoadonSchema)
module.exports = { hoadon }
