const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const methodOverride = require('method-override')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const sanphamroutes = require('./routes/SanPhamRoutes')
const theloaiRoutes = require('./routes/theloaiRoutes')
const thanhtoanroutes =require('./routes/ThanhToanRoutes')
const blogroutes =require('./routes/BlogRoutes')

const MongoStore = require('connect-mongo')

var path = require('path')

var app = express()
app.use(methodOverride('_method'))

const uri =
  'mongodb+srv://baongocxink03:KD3qvAqFfpKC1uzX@cluster0.aocmw.mongodb.net/webdotho?retryWrites=true&w=majority'

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(console.log('kết nối thành công'))

const mongoStoreOptions = {
  mongooseConnection: mongoose.connection,
  mongoUrl: uri,
  collection: 'sessions'
}

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/uploads')))
app.use(express.static(path.join(__dirname, '/images')))

app.use(express.static(path.join(__dirname, '/style')))

app.use(
  session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create(mongoStoreOptions),
    cookie: {
      secure: false
    }
  })
)
app.use(cors())
app.use('/', theloaiRoutes)
app.use('/', sanphamroutes)
app.use('/',thanhtoanroutes)
app.use('/',blogroutes)

const port = process.env.PORT || 3010

app.listen(port, () => {
  try {
    console.log('kết nối thành công 3010')
  } catch (error) {
    console.log('kết nối thất bại 3010', error)
  }
})
