const router = require('express').Router()
const member = require('../model/member')
router.get(['/','/memberlist'],member.memberlist)
router.post('/statuschange',member.statusChange)
module.exports = router