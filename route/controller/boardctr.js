const router = require('express').Router()
const board = require('../model/board')
var multer = require('multer')
var upload = multer({storage : multer.diskStorage({
        destination:function(req, file, cb){
            cb(null,'./file');
        },
        filename : function(req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname);
        }
    }),})
router.get(['/','/boardlist'], board.boardlist)
router.get('/boardwrite',board.writepage)
router.get('/post',board.post)
router.get('/boardupdate',board.updatepage)
router.post('/boardlike',board.boardlike)
router.post('/boardupdate',board.update)
router.post('/boardwrite',board.write)
router.post('/boarddelete',board.delete)
router.post('/imgupload',upload.single('upload'),board.imgupload)
router.post('/commread',board.commread)
router.post('/commwrite',board.commwrite)
router.post('/commupdate',board.commupdate)
router.post('/commdelete',board.commdelete)
module.exports = router