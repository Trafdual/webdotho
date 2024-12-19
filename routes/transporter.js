const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'trafdual0810@gmail.com',
    pass: 'plfu ulbm xnwj obha'
  }
})

module.exports = transporter
