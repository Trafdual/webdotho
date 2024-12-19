const express = require('express')
const router = express.Router()
const Chitietsp = require('../models/chitietSpModel')
const Order = require('../models/orderphumodel')
const HoaDon = require('../models/HoaDonModel')
const momenttimezone = require('moment-timezone')
const transporter = require('./transporter')
const moment =require('moment')
function sortObject (obj) {
  let sorted = {}
  let str = []
  let key
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key))
    }
  }
  str.sort()
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
  }
  return sorted
}

router.post('/create_payment_url', async (req, res, next) => {
  process.env.TZ = 'Asia/Ho_Chi_Minh'

  let date = new Date()
  let createDate = moment(date).format('YYYYMMDDHHmmss')

  let ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress

  let config = require('config')

  let tmnCode = config.get('vnp_TmnCode')
  let secretKey = config.get('vnp_HashSecret')
  let vnpUrl = config.get('vnp_Url')
  let returnUrl = config.get('vnp_ReturnUrl')
  let orderId = moment(date).format('DDHHmmss')
  let amount = req.body.amount
  let bankCode = req.body.bankCode

  let locale = req.body.language
  const { name, phone, diachi, email, product } = req.body

  if (locale === null || locale === '') {
    locale = 'vn'
  }
  let currCode = 'VND'
  let vnp_Params = {}
  vnp_Params['vnp_Version'] = '2.1.0'
  vnp_Params['vnp_Command'] = 'pay'
  vnp_Params['vnp_TmnCode'] = tmnCode
  vnp_Params['vnp_Locale'] = locale
  vnp_Params['vnp_CurrCode'] = currCode
  vnp_Params['vnp_TxnRef'] = orderId
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId
  vnp_Params['vnp_OrderType'] = 'other'
  vnp_Params['vnp_Amount'] = amount * 100
  vnp_Params['vnp_ReturnUrl'] = returnUrl
  vnp_Params['vnp_IpAddr'] = ipAddr
  vnp_Params['vnp_CreateDate'] = createDate
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode
  }
  const ngaymua = momenttimezone().toDate()
  let order = new Order.orderphu({
    orderId,
    name,
    email,
    phone,
    diachi,
    ngaymua,
    tongtien: amount,
    sanpham: product
  })
  await order.save()

  vnp_Params = sortObject(vnp_Params)

  let querystring = require('qs')
  let signData = querystring.stringify(vnp_Params, { encode: false })
  let crypto = require('crypto')
  let hmac = crypto.createHmac('sha512', secretKey)
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')
  vnp_Params['vnp_SecureHash'] = signed
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false })

  res.json(vnpUrl)
})

router.get('/vnpay_return', async (req, res) => {
  let vnp_Params = req.query

  let secureHash = vnp_Params['vnp_SecureHash']
  let orderId = vnp_Params['vnp_TxnRef']
  let order = await Order.orderphu
    .findOne({ orderId: orderId })
    .populate('sanpham')

  delete vnp_Params['vnp_SecureHash']
  delete vnp_Params['vnp_SecureHashType']
  vnp_Params = sortObject(vnp_Params)

  let config = require('config')
  let secretKey = config.get('vnp_HashSecret')

  let querystring = require('qs')
  let signData = querystring.stringify(vnp_Params, { encode: false })
  let crypto = require('crypto')
  let hmac = crypto.createHmac('sha512', secretKey)
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex')

  if (secureHash === signed) {
    if (vnp_Params['vnp_ResponseCode'] === '00') {
      const hoadon = new HoaDon.hoadon({
        name: order.name,
        email: order.email,
        phone: order.phone,
        diachi: order.diachi,
        tongtien: order.tongtien,
        sanpham: order.sanpham
      })

      const sanphamTable = `
        <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            ${order.sanpham
              .map(
                sp => `
                  <tr>
                    <td>${sp.name}</td>
                    <td>${sp.price.toLocaleString()} đ</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      `

      const mailOptions = {
        from: 'trafdual0810@gmail.com',
        to: order.email, // Email của người đặt
        subject: 'Xác nhận thanh toán hóa đơn mua laptop',
        html: `
          <h1>Hóa đơn mua laptop</h1>
          <p>Xin chào, ${order.name},</p>
          <p>Chúng tôi đã nhận được thanh toán cho đơn hàng của bạn.</p>
          <h3>Thông tin hóa đơn:</h3>
           ${sanphamTable}
          <h3>Tổng tiền: ${order.tongtien.toLocaleString()} đ</h3>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        `
      }
      await hoadon.save()
      await transporter.sendMail(mailOptions)

      res.redirect('http://localhost:3000')
    }
  } else {
    res.redirect('http://localhost:3000')
  }
})

module.exports = router
