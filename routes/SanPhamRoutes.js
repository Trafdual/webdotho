const express = require('express')
const router = express.Router()
const TheLoai = require('../models/theloaiSpModel')
const Chitietsp = require('../models/chitietSpModel')
const uploads = require('./upload')

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
              image: sp1.image,
              price: sp1.price,
              mota: sp1.mota
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
      const domain = 'http://localhost:8080'

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
    const sanpham = await Chitietsp.ChitietSp.findById(idsanpham)
    sanpham.name = name
    sanpham.price = price
    sanpham.mota = mota
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
router.get('/:idsanpham', async (req, res) => {
  try {
    const idsanpham = req.params.idsanpham
    const sanpham = await Chitietsp.ChitietSp.findById(idsanpham)
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
