var db=require('../../db');
exports.prolist=(req,res)=>{ //메인페이지
        var max=10; //페이지당 문제수
        var pno=req.query.page; //페이지넘버
        if(!pno)  pno=1;
        var start=max*pno-max;
        var no=req.session.mem_no
        sql='select count(*) as count from project'
        db.query(sql,(err,result)=>{
                if(err) console.log(err)
                else{
                        var count=result[0].count
                        sql="select *,(select count(*) from project_comment b where b.pro_no=a.pro_no) as com_cnt,(select count(*) from project_like b where b.pro_no=a.pro_no) as pro_like from project a order by pro_no desc limit ?,?";
                        db.query(sql,[start,max],(err,project)=>{
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
                                                                        res.render('prolist',{log:1,user:user[0],list:project,pager:pager,pno:pno})
                                                                }else{
                                                                        res.render('prolist',{log:2,user:user[0],list:project,pager:pager,pno:pno})
                                                                }
                                                        }
                                                })   
                                        }else{
                                                res.render('prolist',{log:0,list:project,pager:pager,pno:pno})
                                        }
                                }
                        })
                }
        })
}
exports.workpage=(req,res)=>{
        res.render('work')
}