const router = require('express').Router()
const user = require('../model/user')
var multer = require('multer')
var upload = multer({storage : multer.diskStorage({
    destination:function(req, file, cb){
        cb(null,'./file/usericon/');
    },
    filename : function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
}),})
router.get('/', user.main)
router.get('/project', user.project) 
router.get('/setting', user.setting)
router.post('/icon',upload.single('file'),user.iconpost)
router.post('/nickchange',user.nickchange)
router.post('/pwchange',user.pwchange)
router.post('/retire',user.retire)
router.post('/settingupdate',user.settingupdate)
module.exports = router