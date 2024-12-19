var db = require('./db');
const User = new db.mongoose.Schema(
    {
        ten: { type: String, require: true},
        email:{ type:String,require: true},
        sdt: {type: Number, require:true},
        password: {type: String, require: true}
    },
    {
        collection: 'User'
    }
);
let UserModel = db.mongoose.model('UserModel', User);
module.exports = {UserModel};