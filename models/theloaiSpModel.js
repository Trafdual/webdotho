const db = require('./db');

const theloaiSpSchema = new db.mongoose.Schema({
name:{type:String},
chitietsp:[{ type: db.mongoose.Schema.Types.ObjectId, ref: 'chitietsp' }],
});

const theloaiSP = db.mongoose.model('loaisp', theloaiSpSchema);
module.exports = {theloaiSP};
