var db=require('../../db');
exports.memberlist=(req,res)=>{
        no=req.session.mem_no
        if(no!=1){
                res.send('<script>alert("잘못된 권한입니다.");history.back();</script>')
        }else{
                var max=10; //페이지당 문제수
                var pno=req.query.page; //페이지넘버
                if(!pno)  pno=1;
                var start=max*pno-max;
                var no=req.session.mem_no
                sql='select count(*) as count from member'
                db.query(sql,(err,result)=>{
                        if(err) console.log(err)
                        else{
                                var count=result[0].count
                                sql="select * from member order by mem_no desc limit ?,?";
                                db.query(sql,[start,max],(err,member)=>{
                                        if(err) console.log(err)
                                        else{
                                                var pager={
                                                        pagecount:count%max == 0 ? Math.trunc(count/max) : Math.trunc(count/max) +1, //총페이지수
                                                        startpost:max*pno-max, //시작시험번호
                                                        endpost:max*pno-1< count ?  max*pno-1 : count-1  //마지막시험번호
                                                }
                                                sql='select * from member where mem_no=?'
                                                db.query(sql,no,(err,user)=>{
                                                        if(err) console.log(err)
                                                        else{
                                                                res.render('member',{log:1,user:user[0],list:member,pager:pager,pno:pno})
                                                        }
                                                })
                                        }
                                })
                        }
                })
        }
}
exports.statusChange=(req,res)=>{
        flag=req.body.flag
        no=req.body.no
        sql='update member set mem_flag=? where mem_no=?'
        db.query(sql,[flag,no],(err,result)=>{
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