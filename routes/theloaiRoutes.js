const express = require('express')
const router = express.Router()
const TheLoai = require('../models/theloaiSpModel')
const Chitietsp = require('../models/chitietSpModel')
const unicode = require('unidecode')

function removeSpecialChars (str) {
  const specialChars = /[:+,!@#$%^&*()\-?/]/g

  return str.replace(specialChars, '')
}

router.get('/theloaisanpham', async (req, res) => {
  try {
    const theloai = await TheLoai.theloaiSP.find().lean()
    const theloaijson = await Promise.all(
      theloai.map(async tl => {
        return {
          _id: tl._id,
          name: tl.name,
          namekhongdau: tl.namekhongdau
        }
      })
    )
    res.json(theloaijson)
  } catch (error) {
    console.log(error)
  }
})

router.post('/posttheloai', async (req, res) => {
  try {
    const { name } = req.body
    const theloai = new TheLoai.theloaiSP({
      name
    })
    await theloai.save()
    res.json(theloai)
  } catch (error) {
    console.log(error)
  }
})

router.post('/puttheloai/:idtheloai', async (req, res) => {
  try {
    const idtheloai = req.params.idtheloai
    const { name } = req.body
    const namekhongdau1 = unicode(name)
    const namekhongdau = removeSpecialChars(namekhongdau1)

    const theloai = await TheLoai.theloaiSP.findById(idtheloai)
    theloai.name = name
    theloai.namekhongdau = namekhongdau
    await theloai.save()
    res.json(theloai)
  } catch (error) {
    console.log(error)
  }
})

router.post('/deletetheloai/:idtheloai', async (req, res) => {
  try {
    const idtheloai = req.params.idtheloai
    const theloai = await TheLoai.theloaiSP.findById(idtheloai)
    await Promise.all(
      theloai.chitietsp.map(async ct => {
        await Chitietsp.ChitietSp.findByIdAndDelete(ct._id)
      })
    )
    await TheLoai.theloaiSP.findByIdAndDelete(idtheloai)
    res.json({ message: 'xóa thành công' })
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
