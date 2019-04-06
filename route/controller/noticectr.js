const router = require('express').Router()
const notice = require('../model/notice')
var multer = require('multer')
var upload = multer({storage : multer.diskStorage({
        destination:function(req, file, cb){
            cb(null,'./file');
        },
        filename : function(req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname);
        }
    }),})
router.get(['/','/noticelist'], notice.noticelist)
router.get('/noticewrite',notice.writepage)
router.get('/post',notice.post)
router.get('/noticeupdate',notice.updatepage)
router.post('/noticelike',notice.noticelike)
router.post('/noticeupdate',notice.update)
router.post('/noticewrite',notice.write)
router.post('/noticedelete',notice.delete)
router.post('/imgupload',upload.single('upload'),notice.imgupload)
router.post('/commread',notice.commread)
router.post('/commwrite',notice.commwrite)
router.post('/commupdate',notice.commupdate)
router.post('/commdelete',notice.commdelete)
module.exports = router