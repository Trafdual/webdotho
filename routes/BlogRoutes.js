const express = require('express')
const router = express.Router()
const Blog = require('../models/blog.model')
const unicode = require('unicode')
const uploads = require('./upload')

function removeSpecialChars (str) {
  const specialChars = /[:+,!@#$%^&*()\-?/]/g

  return str.replace(specialChars, '')
}

router.post(
  '/postblog',
  uploads.fields([
    { name: 'image', maxCount: 1 } // Một ảnh duy nhất
  ]),
  async (req, res) => {
    try {
      const { tieude_blog } = req.body
      const domain = 'http://localhost:8080'

      const image = req.files['image']
        ? `${domain}/${req.files['image'][0].filename}`
        : null

      const tieude_khongdau1 = unicode(tieude_blog)
      const tieude_khongdau = removeSpecialChars(tieude_khongdau1)
      const blog = new Blog.blogModel({
        tieude_blog,
        tieude_khongdau,
        img_blog: image
      })
      await blog.save()
      res.json(blog)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
    }
  }
)
router.get('/getblog', async (req, res) => {
  try {
    const blog = await Blog.blogModel.find().lean()
    const blogjson =  blog.map(bl =>{
      return {
        _id: bl._id,
        tieude_blog: bl.tieude_blog,
        tieude_khongdau: bl.tieude_khongdau,
        img_blog: bl.img_blog
      }
    })
    res.json(blogjson)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/:tieude', async (req, res) => {
  try {
    const tieude = req.params.tieude
    const tieude_khongdau = decodeURIComponent(tieude).replace(/-/g, ' ')
    const blog = await Blog.blogModel.findOne({ tieude_khongdau }).lean()
    res.json(blog)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

module.exports = router
