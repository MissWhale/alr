var db=require('../../db');
exports.noticelist=(req,res)=>{ //메인페이지
        var max=10; //페이지당 문제수
        var pno=req.query.page; //페이지넘버
        if(!pno)  pno=1;
        var start=max*pno-max;
        var no=req.session.mem_no
        sql='select count(*) as count from board where brd_notice=1'
        db.query(sql,(err,result)=>{
                if(err) console.log(err)
                else{
                        var count=result[0].count
                        sql="select *,(select count(*) from board_comment b where b.brd_no=board.brd_no) as com_cnt,(select count(*) from board_like b where b.brd_no=board.brd_no) as brd_like from board where brd_notice=1 order by brd_no desc limit ?,?";
                        db.query(sql,[start,max],(err,board)=>{
                                if(err) console.log(err)
                                else{
                                        var pager={
                                                pagecount:count%max == 0 ? Math.trunc(count/max) : Math.trunc(count/max) +1, //총페이지수
                                                startpost:max*pno-max, //시작시험번호
                                                endpost:max*pno-1< count ?  max*pno-1 : count-1  //마지막시험번호
                                        }
                                        if(no){
                                                sql='select * from member where mem_no=?'
                                                db.query(sql,no,(err,user)=>{
                                                        if(err) console.log(err)
                                                        else{
                                                                if(no==1){
                                                                        res.render('noticelist',{log:1,user:user[0],list:board,pager:pager,pno:pno})
                                                                }else{
                                                                        res.render('noticelist',{log:2,user:user[0],list:board,pager:pager,pno:pno})
                                                                }
                                                        }
                                                })   
                                        }else{
                                                res.render('noticelist',{log:0,list:board,pager:pager,pno:pno})
                                        }
                                }
                        })
                }
        })
}
exports.writepage=(req,res)=>{
        var no=req.session.mem_no
        if(!no){
                res.send('<script>alert("로그인시 가능합니다");history.back();</script>')
        }else{
                sql='select * from member where mem_no=?'
                db.query(sql,no,(err,user)=>{
                        if(err) console.log(err)
                        else{
                                if(no==1){
                                        res.render('noticewrite',{log:1,user:user[0]})
                                }else{
                                        res.render('noticewrite',{log:2,user:user[0]})
                                }
                        }
                }) 
        }
}
exports.write=(req,res)=>{
        var title=req.body.title
        var body=req.body.body
        var no=req.session.mem_no
        var sql='insert into board(mem_no,brd_title,brd_text,brd_notice) values(?,?,?,1)'
        db.query(sql,[no,title,body],(err,result)=>{
                if(err) {console.log(err);res.send({sc:false})}
                else{
                        if(result.affectedRows){
                                res.send({sc:true,row:result.insertId})
                        }else{
                                res.send({sc:false})
                        }
                }
        })
}
exports.updatepage=(req,res)=>{
        var num=req.query.num;
        var no=req.session.mem_no
        if(!no){
                res.send('<script>alert("로그인시 가능합니다");history.back();</script>')
        }else{
                sql='select * from board where brd_no=?'
                db.query(sql,num,(err,result)=>{
                        if(err) console.log(err)
                        else{
                                sql='select * from member where mem_no=?'
                                db.query(sql,no,(err,user)=>{
                                        if(err) console.log(err)
                                        else{
                                                if(no==1){
                                                        res.render('noticeupdate',{log:1,user:user[0],board:result[0]})
                                                }else{
                                                        res.render('noticeupdate',{log:2,user:user[0],board:result[0]})
                                                }
                                        }
                                }) 
                        }
                })
        }
}
exports.update=(req,res)=>{
        var title=req.body.title
        var body=req.body.body
        var num=req.body.num
        var sql='update board set brd_title=?,brd_text=? where brd_no=?'
        db.query(sql,[title,body,num],(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result.affectedRows){
                                res.send(true)
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.delete=(req,res)=>{
        num=req.body.num
        sql='delete from board where brd_no=?'
        db.query(sql,num,(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result.affectedRows){
                                res.send(true)
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.noticelike=(req,res)=>{
        num=req.body.num
        mem=req.session.mem_no
        result=req.body.result
        if(result==1){
                sql='delete from board_like where brd_no='+num
        }else{
                sql='insert into board_like(mem_no,brd_no) values('+mem+','+num+');'
        }
        db.query(sql,(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result.affectedRows){
                                res.send(true)
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.post=(req,res)=>{
        var no=req.session.mem_no
        var bno=req.query.num
        sql='update board set brd_cnt=brd_cnt+1 where brd_no=?'
        db.query(sql,bno,(err,result)=>{
                if(err) console.log(err)
                else{
                        if(result.affectedRows){
                                sql='select board.*,mem_nick,(select count(*) from board_like b where b.brd_no=board.brd_no) as brd_like from board natural join member where brd_no=?'
                                db.query(sql,bno,(err,board)=>{
                                        if(err) console.log(err)
                                        else{
                                                sql='select * from board_comment natural join member where brd_no=?'
                                                db.query(sql,bno,(err,comment)=>{
                                                        if(err) console.log(err)
                                                        else{
                                                                if(no){
                                                                        sql='select * from member where mem_no=?'
                                                                        db.query(sql,no,(err,user)=>{
                                                                                if(err) console.log(err)
                                                                                else{
                                                                                        if(no==1){
                                                                                                res.render('noticepost',{log:1,user:user[0],board:board[0],com:comment,no:no})
                                                                                        }else{
                                                                                                res.render('noticepost',{log:2,user:user[0],board:board[0],com:comment,no:no})
                                                                                        }
                                                                                }
                                                                        })   
                                                                }else{
                                                                        res.render('noticepost',{log:0,board:board[0],com:comment,no:0})
                                                                }
                                                        }
                                                })
                                        }
                                })
                        }
                }
        })
}
exports.commwrite=(req,res)=>{
        body=req.body.body
        num=req.body.num
        no=req.session.mem_no
        sql='insert into board_comment(mem_no,brd_no,bc_text) values(?,?,?)'
        db.query(sql,[no,num,body],(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result.affectedRows){
                                res.send(true)
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.commupdate=(req,res)=>{
        body=req.body.body
        num=req.body.num
        sql='update board_comment set bc_text=? where bc_no=?'
        db.query(sql,[body,num],(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result.affectedRows){
                                res.send(true)
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.commdelete=(req,res)=>{
        num=req.body.num
        sql='delete from board_comment where bc_no=?'
        db.query(sql,num,(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result.affectedRows){
                                res.send(true)
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.commread=(req,res)=>{
        sql='select brd_cnt,(select count(*) from board_like b where b.brd_no=board.brd_no) as brd_like,(select count(*) from board_comment b where b.brd_no=board.brd_no) as com_cnt from board where brd_no=?'
        db.query(sql,req.body.num,(err,board)=>{
                if(err) console.log(err)
                else{
                        sql='select * from board_comment natural join member  where brd_no=? order by bc_no'
                        db.query(sql,req.body.num,(err,result)=>{
                                if(err) {console.log(err),res.send({ss:false})}
                                else{
                                        for(i=0;i<result.length;i++){
                                                result[i].bc_reg=result[i].bc_reg.format('yyyy-MM-dd')
                                        }
                                        res.send({ss:true,result:result,board:board[0]})
                                }
                        })
                }
        })
}
exports.imgupload=(req,res)=>{
        if(req.file){
                var file={
                        path:req.file.path,
                        origin:req.file.originalname,
                        name:req.file.filename
                }
                res.send({
                        "uploaded":1,
                        "filename":file.origin,
                        "url":'/file/'+file.name,
                        "error":{
                                "message":"업로드 성공"
                }});
        }else{
                res.send({
                        "uploaded":0,
                        "error":{
                                "message":"업로드 실패"
                }});
        } 
}