var db=require('../../db');
var Entities=require('html-entities').XmlEntities
const ent=new Entities()
var fs=require('fs')
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
                        sql="select *,(select count(*) from project_comment b where b.pro_no=a.pro_no) as com_cnt,(select count(*) from project_like b where b.pro_no=a.pro_no) as pro_like from project a natural join project_version order by pro_no desc limit ?,?";
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
        var no=req.session.mem_no
        var pro_no=req.query.pro
        if(pro_no){
                sql='update project set pro_cnt=pro_cnt+1 where pro_no=?'
                db.query(sql,pro_no,(err,result)=>{
                        if(err) console.log(err)
                })
                sql='select *,(select count(*) from project_comment b where b.pro_no=a.pro_no) as com_cnt,(select count(*) from project_like b where b.pro_no=a.pro_no) as pro_like from project a natural join project_version natural join member where pro_no=?'
                db.query(sql,pro_no,(err,result)=>{
                        if(err) console.log(err)
                        else{
                                // console.log(result[0])
                                result[0].pv_html=ent.decode(result[0].pv_html)
                                if(no){
                                        if(result[0].mem_no==no){
                                                master=1
                                        }else{
                                                master=0
                                        }
                                        sql='select count(*) as cnt from project_like where mem_no=? and pro_no=?'
                                        db.query(sql,[no,pro_no],(err,like)=>{
                                                if(err) console.log(err)
                                                else{
                                                        sql='select * from member natural join member_option where mem_no=?'
                                                        db.query(sql,no,(err,user)=>{
                                                                if(err) console.log(err)
                                                                else{
                                                                        if(no==1){
                                                                                // console.log(result)
                                                                                res.render('work',{log:1,user:user[0],work:1,pr:1,master:master,source:result[0],like:like[0].cnt})
                                                                        }else{
                                                                                res.render('work',{log:2,user:user[0],work:1,pr:1,master:master,source:result[0],like:like[0].cnt})
                                                                        }
                                                                }
                                                        })   
                                                }
                                        })
                                }else{
                                        res.render('work',{log:0,work:1,user:false,pr:1,master:0,source:result[0],like:0})
                                }
                        }
                })
        }else{
                if(no){
                        sql='select * from member natural join member_option where mem_no=?'
                        db.query(sql,no,(err,user)=>{
                                if(err) console.log(err)
                                else{
                                        if(no==1){
                                                res.render('work',{log:1,user:user[0],work:1,pr:0})
                                        }else{
                                                res.render('work',{log:2,user:user[0],work:1,pr:0})
                                        }
                                }
                        })   
                }else{
                        res.render('work',{log:0,work:1,user:false,pr:0})
                }
        }
}
exports.result=(req,res)=>{
        html='<body onclick="test()">'+req.body.html+'</body>'
        css='<head><style>'+req.body.css+'</style></head>'
        js='<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script><script>'+req.body.js+'</script>'
        total=css+html+js
        res.send({total:total})
        // fs.readFile('./project_result/test.html','utf-8',(err,data)=>{
        //         if(err) {
        //                 console.log(err)
        //                 fs.writeFile('./project_result/test.html',total,'utf-8',(err,data)=>{
        //                         if(err) {
        //                                 console.log(err)
        //                         }else{
        //                                 res.send({src:'test.html'})
        //                         }
        //                 })
        //         }else{
        //                 fs.writeFile('./project_result/test.html',total,'utf-8',(err,data)=>{
        //                         if(err) {
        //                                 console.log(err)
        //                         }else{
        //                                 res.send({src:'test.html'})
        //                         }
        //                 })
        //         }
        // })
}
exports.get_version=(req,res)=>{
        pv_no=req.body.pv_no
        sql='select * from project natural join project_version where pv_no=?'
        db.query(sql,pv_no,(err,result)=>{
                if(err) {console.log(err);res.send({ok:false})}
                else{
                        res.send({ok:true,result:result[0]})
                }
        })
}
exports.save=(req,res)=>{
        html=req.body.html
        css=req.body.css
        js=req.body.js
        title=req.body.title
        version=req.body.version
        ver_text=req.body.ver_text
        open=req.body.open
        h_kind=req.body.h_kind
        c_kind=req.body.c_kind
        j_kind=req.body.j_kind
        img=req.body.img
        total=req.body.total
        save=Number(req.body.save)
        pro_no=Number(req.body.pro_no)
        pv_no=Number(req.body.pv_no)
        new_version=Number(req.body.new_version)
        file=Date.now()+'-'+title+'-'+version
        no=req.session.mem_no
        if(save){
                sql='update project set pro_title =? where pro_no=?'
                db.query(sql,[title,pro_no],(err,result)=>{
                        if(err) {console.log(err); res.send({ok:false})}
                        else{
                                if(result.affectedRows){
                                        if(new_version){
                                                sql='select count(*) as count from project_version where pro_no=? and ver_no =?'
                                                db.query(sql,[pro_no,version],(err,result)=>{
                                                        if(err) {console.log(err); res.send({ok:false})}
                                                        else{
                                                                if(result[0].count>0){
                                                                        res.send({ok:false,count:false})
                                                                }else{
                                                                        sql='insert into project_version(pro_no,ver_no,ver_text,pv_html,pv_css,pv_js,pv_html_kind,pv_css_kind,pv_js_kind,pv_file)\
                                                                        values(?,?,?,?,?,?,?,?,?,?)'
                                                                        db.query(sql,[pro_no,version,ver_text,html,css,js,h_kind,c_kind,j_kind,total],(err,result)=>{
                                                                                if(err) {console.log(err); res.send({ok:false})}
                                                                                else{
                                                                                        if(result.affectedRows){
                                                                                                pv_no=result.insertId
                                                                                                sql='select pv_no,ver_no,ver_text from project_version where pro_no=? order by 1 desc'
                                                                                                db.query(sql,pro_no,(err,result)=>{
                                                                                                        if(err) {console.log(err);res.send({ok:false})}
                                                                                                        else{
                                                                                                                res.send({ok:true,ver:result,pv_no:pv_no,pro_no:pro_no})
                                                                                                        }
                                                                                                })
                                                                                        }else{
                                                                                                res.send({ok:false})
                                                                                        }
                                                                                }
                                                                        })
                                                                }
                                                        }
                                                })
                                        }else{
                                                sql='update project_version\
                                                        set ver_no=?,ver_text=?,pv_html=?,pv_css=?,pv_js=?,pv_html_kind=?,pv_css_kind=?,pv_js_kind=?,pv_reg=now(),pv_file=?\
                                                        where pv_no=?'
                                                db.query(sql,[version,ver_text,html,css,js,h_kind,c_kind,j_kind,total,pv_no],(err,result)=>{
                                                        if(err) {console.log(err); res.send({ok:false})}
                                                        else{
                                                                console.log(result)
                                                                if(result.affectedRows){
                                                                        sql='select pv_no,ver_no,ver_text from project_version where pro_no=? order by 1 desc'
                                                                        db.query(sql,pro_no,(err,result)=>{
                                                                                if(err) {console.log(err);res.send({ok:false})}
                                                                                else{
                                                                                        res.send({ok:true,ver:result,pv_no:pv_no,pro_no:pro_no})
                                                                                }
                                                                        })
                                                                }else{
                                                                        res.send({ok:false})
                                                                }
                                                        }
                                                })
                                        }
                                }else{
                                        res.send({ok:false})
                                }
                        }
                })
        }else{
                sql='insert into project(mem_no,pro_title,pro_open) values(?,?,?)'
                db.query(sql,[no,title,open],(err,result)=>{
                        if(err){console.log(err); res.send({ok:false})}
                        else{
                                pro_no=result.insertId
                                sql='insert into project_version(pro_no,ver_no,ver_text,pv_html,pv_css,pv_js,pv_html_kind,pv_css_kind,pv_js_kind,pv_file)\
                                        values(?,?,?,?,?,?,?,?,?,?)'
                                db.query(sql,[pro_no,version,ver_text,html,css,js,h_kind,c_kind,j_kind,total],(err,result)=>{
                                        if(err) {console.log(err); res.send({ok:false})}
                                        else{
                                                console.log(result)
                                                if(result.affectedRows){
                                                        pv_no=result.insertId
                                                        sql='select pv_no,ver_no,ver_text from project_version where pro_no=? order by 1 desc'
                                                        db.query(sql,pro_no,(err,result)=>{
                                                                if(err) {console.log(err);res.send({ok:false})}
                                                                else{
                                                                        res.send({ok:true,ver:result,pv_no:pv_no,pro_no:pro_no})
                                                                }
                                                        })
                                                        // res.send({ok:true})
                                                }else{
                                                        res.send({ok:false})
                                                }
                                        }
                                })
                        }
                })
        }
}
exports.like=(req,res)=>{
        num=req.body.num
        mem=req.session.mem_no
        result=req.body.result
        if(result==1){
                sql='delete from project_like where mem_no=? and pro_no=?'
        }else{
                sql='insert into project_like(mem_no,pro_no) values(?,?)'
        }
        db.query(sql,[mem,num],(err,result)=>{
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
exports.get_comment=(req,res)=>{
        pro_no=req.body.pro_no
        mem_no=req.session.mem_no
        sql='select *,(select count(*) from project_comment b where b.pro_no=a.pro_no) as com_cnt,(select count(*) from project_like b where b.pro_no=a.pro_no) as pro_like from project a natural join project_comment natural join member where pro_no=?'
        db.query(sql,pro_no,(err,result)=>{
                if(err) {console.log(err);res.send({ok:false})}
                else{
                        if(result.length){
                                for(i=0;i<result.length;i++){
                                        result[i].pc_reg=result[i].pc_reg.format('yyyy-MM-dd')
                                }
                                for(i=0;i<result.length;i++){
                                        result[i].mem_pic='../../file/usericon/'+result[i].mem_pic
                                }
                                for(i=0;i<result.length;i++){
                                        if(result[i].mem_no==mem_no){
                                                result[i].pro_no=true
                                        }else{
                                                result[i].pro_no=false
                                        }
                                }
                                res.send({ok:true,list:result,com_cnt:result[0].com_cnt,like_cnt:result[0].pro_like,pro_cnt:result[0].pro_cnt})
                        }else{
                                res.send({ok:false})
                        }
                }
        })
}
exports.write_comment=(req,res)=>{
        no=req.session.mem_no
        pro_no=req.body.pro_no
        comment=req.body.comment
        sql='insert into project_comment(pro_no,mem_no,pc_text) values(?,?,?)'
        db.query(sql,[pro_no,no,comment],(err,result)=>{
                if(err) res.send(false)
                else{
                        if(result.affectedRows){
                                res.send(true)
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.update_comment=(req,res)=>{
        pc_no=req.body.pc_no
        comment=req.body.comment
        sql='update project_comment set pc_text=? where pc_no=?'
        db.query(sql,[comment,pc_no],(err,result)=>{
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
exports.delete_comment=(req,res)=>{
        pc_no=req.body.pc_no
        sql='delete from project_comment where pc_no=?'
        db.query(sql,pc_no,(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        console.log(result)
                        if(result.affectedRows){
                                res.send(true)
                        }else{
                                res.send(false)
                        }
                }
        })
}