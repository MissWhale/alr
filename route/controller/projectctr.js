const router = require('express').Router()
const project = require('../model/project')
router.get(['/','/prolist'], project.prolist)
router.get('/work',project.workpage)
router.post('/result',project.result)
router.post('/save',project.save)
router.post('/get_version',project.get_version)
module.exports = router