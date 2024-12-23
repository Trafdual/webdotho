const express = require('express')
const router = express.Router()
const Blog = require('../models/blog.model')
const uploads = require('./upload')
const unicode = require('unidecode')
function removeSpecialChars (str) {
  const specialChars = /[:+,!@#$%^&*()\-/?.\s]/g // Bao gồm cả dấu cách (\s)
  return str
    .replace(specialChars, '-') // Thay tất cả ký tự đặc biệt và dấu cách bằng dấu -
    .replace(/-+/g, '-') // Loại bỏ dấu - thừa (nhiều dấu liền nhau chỉ còn 1)
    .replace(/^-|-$/g, '') // Loại bỏ dấu - ở đầu hoặc cuối chuỗi
}

router.post(
  '/postblog',
  uploads.fields([{ name: 'image', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { tieude_blog, noidung } = req.body
      const domain = 'https://baominh.shop'

      const image = req.files['image']
        ? `${domain}/${req.files['image'][0].filename}`
        : null

      const tieude_khongdau1 = unicode(tieude_blog)
      const tieude_khongdau = removeSpecialChars(tieude_khongdau1)
      const blog = new Blog.blogModel({
        tieude_blog,
        tieude_khongdau,
        img_blog: image,
        noidung
      })
      await blog.save()
      res.json(blog)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
    }
  }
)

router.post('/putblog/:idblog', async (req, res) => {
  try {
    const idblog = req.params.idblog
    const { tieude_blog, noidung } = req.body
    const tieude_khongdau1 = unicode(tieude_blog)
    const tieude_khongdau = removeSpecialChars(tieude_khongdau1)
    const blog = await Blog.blogModel.findById(idblog)
    blog.tieude_blog = tieude_blog
    blog.tieude_khongdau = tieude_khongdau
    blog.noidung = noidung
    await blog.save()
    res.json(blog)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/deleteblog/:idblog', async (req, res) => {
  try {
    const idblog = req.params.idblog
    await Blog.blogModel.findByIdAndDelete(idblog)
    res.json({ message: 'Xóa thành công' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getblog', async (req, res) => {
  try {
    const blog = await Blog.blogModel.find().lean() // Tìm tất cả blog
    const blogjson = blog.map(bl => {
      return {
        _id: bl._id,
        tieude_blog: bl.tieude_blog,
        tieude_khongdau: bl.tieude_khongdau,
        img_blog: bl.img_blog
      }
    })
    res.json(blogjson) // Trả về danh sách blog
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/chitietblog/:tieude', async (req, res) => {
  try {
    const tieude = req.params.tieude
    const blog = await Blog.blogModel.findOne({ tieude_khongdau: tieude })
    res.json(blog)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

module.exports = router
