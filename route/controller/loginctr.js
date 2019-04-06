const router = require('express').Router()
const login = require('../model/login')
router.get('/', login.loginpage)
router.post('/',login.login)
router.get('/logout',login.logout)
router.get('/register',login.registerpage)
router.post('/emailok',login.emailok)
router.post('/nickok',login.nickok)
router.post('/register',login.register)
router.post('/pwfind',login.pwfind)
module.exports = router