const router = require('express').Router()
const project = require('../model/project')
router.get(['/','/prolist'], project.prolist)
router.get('/work',project.workpage)
module.exports = router