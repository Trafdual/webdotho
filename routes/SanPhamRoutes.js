const express = require('express')
const router = express.Router()
const TheLoai = require('../models/theloaiSpModel')
const Chitietsp = require('../models/chitietSpModel')
const uploads = require('./upload')
const unicode = require('unidecode')

function removeSpecialChars (str) {
  const specialChars = /[:+,!@#$%^&*()\-?/]/g

  return str.replace(specialChars, '')
}

router.get('/sanpham', async (req, res) => {
  try {
    const theloai = await TheLoai.theloaiSP.find().lean()
    const theloaijson = await Promise.all(
      theloai.map(async tl => {
        const sanpham = await Promise.all(
          tl.chitietsp.map(async sp => {
            const sp1 = await Chitietsp.ChitietSp.findById(sp._id)
            return {
              _id: sp1._id,
              name: sp1.name,
              namekhongdau: sp1.namekhongdau,
              image: sp1.image,
              price: sp1.price
            }
          })
        )
        return {
          _id: tl._id,
          name: tl.name,
          sanpham: sanpham
        }
      })
    )
    res.json(theloaijson)
  } catch (error) {
    console.log(error)
  }
})
router.get('/fullsanphham/:nametheloai', async (req, res) => {
  try {
    const nametheloai = req.params.nametheloai
    const namekhongdau = decodeURIComponent(nametheloai).replace(/-/g, ' ')
    const theloai = await TheLoai.theloaiSP.findOne({ namekhongdau })
    const sanpham = await Promise.all(
      theloai.chitietsp.map(async sp => {
        const sp1 = await Chitietsp.ChitietSp.findById(sp._id)
        return {
          _id: sp1._id,
          name: sp1.name,
          namekhongdau: sp1.namekhongdau,
          image: sp1.image,
          price: sp1.price
        }
      })
    )
    res.json(sanpham)
  } catch (error) {
    console.log(error)
  }
})

router.post(
  '/postsanpham/:idtheloai',
  uploads.fields([
    { name: 'image', maxCount: 1 } // Một ảnh duy nhất
  ]),
  async (req, res) => {
    try {
      const { name, price, mota } = req.body
      const idtheloai = req.params.idtheloai
      const theloai = await TheLoai.theloaiSP.findById(idtheloai)
      const domain = 'https://baominh.shop'

      const image = req.files['image']
        ? `${domain}/${req.files['image'][0].filename}`
        : null

      const sanpham = new Chitietsp.ChitietSp({
        name,
        image,
        price,
        mota,
        idloaisp: theloai._id
      })
      theloai.chitietsp.push(sanpham._id)
      await sanpham.save()
      await theloai.save()
      res.json(sanpham)
    } catch (error) {
      console.log(error)
    }
  }
)

router.post('/putsanpham/:idsanpham', async (req, res) => {
  try {
    const idsanpham = req.params.idsanpham
    const { name, price, mota } = req.body
    const namekhongdau1 = unicode(name)
    const namekhongdau = removeSpecialChars(namekhongdau1)
    const sanpham = await Chitietsp.ChitietSp.findById(idsanpham)
    sanpham.name = name
    sanpham.price = price
    sanpham.mota = mota
    sanpham.namekhongdau = namekhongdau
    await sanpham.save()
    res.json(sanpham)
  } catch (error) {
    console.log(error)
  }
})

router.post('/deletesanpham/:idsanpham', async (req, res) => {
  try {
    const idsanpham = req.params.idsanpham
    const sanpham = await Chitietsp.ChitietSp.findById(idsanpham)
    const theloai = await TheLoai.theloaiSP.findById(sanpham.idloaisp)
    theloai.chitietsp = theloai.chitietsp.filter(
      chitietsp => chitietsp._id.toString() !== sanpham._id.toString()
    )
    await Chitietsp.ChitietSp.findByIdAndDelete(idsanpham)
    await theloai.save()
    res.json({ message: 'xóa thành công' })
  } catch (error) {
    console.log(error)
  }
})
router.get('/chitietsanpham/:tieude', async (req, res) => {
  try {
    const tieude = req.params.tieude
    const namekhongdau = decodeURIComponent(tieude).replace(/-/g, ' ')
    const sanpham = await Chitietsp.ChitietSp.findOne({ namekhongdau })
    const sanphamjson = {
      _id: sanpham._id,
      name: sanpham.name,
      image: sanpham.image,
      price: sanpham.price,
      mota: sanpham.mota
    }
    res.json(sanphamjson)
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
