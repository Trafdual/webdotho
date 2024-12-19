const mongoose = require('mongoose')
const uri =
  'mongodb+srv://nnchien03:chien123@cluster0.fysyj.mongodb.net/webtmdt?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(uri).catch(err => {
  console.log('Loi ket noi CSDL')
  console.log(err)
})
module.exports = { mongoose }
