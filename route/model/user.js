var db=require('../../db');
var fs = require('fs')
var text='var d = new Date();\n\
theDay=d.getDay();\n\
switch (theDay)\n\
{\n\
        case 5:\n\
                document.write("<b>마지막 금요일</b>");\n\
                break;\n\
        case 6:\n\
                document.write("<b>즐거운 토요일y</b>");\n\
                break;\n\
        case 0:\n\
                document.write("<b>졸린 일요일</b>");\n\
                break;\n\
        default:\n\
                document.write("<b>일주일 끝!!</b>");\n\
}'
exports.main=(req,res)=>{
        var no=req.session.mem_no
        if(!no){
                res.send('<script>alert("로그인시 가능합니다");history.back();</script>')
        }else{
                sql='select * from member where mem_no=?'
                db.query(sql,no,(err,user)=>{
                        if(err) console.log(err)
                        else{
                                if(no==1){
                                        res.render('userprofile',{log:1,user:user[0]})
                                }else{
                                        res.render('userprofile',{log:2,user:user[0]})
                                }
                        }
                }) 
        }
}
exports.project=(req,res)=>{
        var max=10; //페이지당 문제수
        var pno=req.query.page; //페이지넘버
        var text=req.query.text ==undefined ? '' : req.query.text
        var type=req.query.type ==undefined ? 'pro_reg desc' : req.query.type
        if(!pno)  pno=1;
        if(req.query.search) pno=1;
        var start=max*pno-max;
        var no=req.session.mem_no
        var data=new Array()
        if(!no){
                res.send('<script>alert("로그인시 가능합니다");history.back();</script>')
        }else{
                if(text){
                        sql='select count(*) as count from project where mem_no=? and pro_title like ?'
                }else{
                        sql='select count(*) as count from project where mem_no=?'
                }
                db.query(sql,[no,'%'+text+'%'],(err,result)=>{
                        if(err) console.log(err)
                        else{
                                var count=result[0].count
                                if(text){
                                        sql="select *,(select count(*) from project_comment b where b.pro_no=project.pro_no) as com_cnt,(select count(*) from project_like b where b.pro_no=project.pro_no) as pro_like from project where mem_no=? and pro_title like ? order by "+type+" limit ?,?";
                                        data.push(no,'%'+text+'%',start,max)
                                }else{
                                        sql="select *,(select count(*) from project_comment b where b.pro_no=project.pro_no) as com_cnt,(select count(*) from project_like b where b.pro_no=project.pro_no) as pro_like from project where mem_no=? order by "+type+" limit ?,?";
                                        data.push(no,start,max)
                                }
                                db.query(sql,data,(err,project)=>{
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
                                                                if(no==1){
                                                                        res.render('userproject',{log:1,user:user[0],list:project,pager:pager,pno:pno,text:text,type:type})
                                                                }else{
                                                                        res.render('userproject',{log:2,user:user[0],list:project,pager:pager,pno:pno,text:text,type:type})
                                                                }
                                                        }
                                                })   
                                        }
                                })
                        }
                })
        }
}
exports.setting=(req,res)=>{
        var no=req.session.mem_no
        if(!no){
                res.send('<script>alert("로그인시 가능합니다");history.back();</script>')
        }else{
                sql='select * from member natural join member_option where mem_no=?'
                db.query(sql,no,(err,user)=>{
                        if(err) console.log(err)
                        else{
                                if(no==1){
                                        res.render('usersetting',{log:1,user:user[0],text:text})
                                }else{
                                        res.render('usersetting',{log:2,user:user[0],text:text})
                                }
                        }
                }) 
        }
}
exports.iconpost=(req,res)=>{
        file=req.file.filename
        no=req.session.mem_no
        sql='select mem_pic from member where mem_no=?'
        db.query(sql,no,(err,result)=>{
                if(err) {console.log(err);res.send({ok:false})}
                else{
                        if(result[0].mem_pic){
                                var file_path = "./file/usericon/"+result[0].mem_pic
                                fs.unlink(file_path, function (err) {
                                        if (err) throw err; 
                                });  
                        }
                        sql='update member set mem_pic=? where mem_no=?'
                        db.query(sql,[file,no],(err,result)=>{
                                if(err) {console.log(err);res.send({ok:false})}
                                else{
                                        if(result.affectedRows){
                                                res.send({ok:true,file:file})
                                        }else{
                                                res.send({ok:false})
                                        }
                                }
                        })
                }
        })
}
exports.nickchange=(req,res)=>{
        nick=req.body.nick
        no=req.session.mem_no
        sql='update member set mem_nick=? where mem_no=?'
        db.query(sql,[nick,no],(err,result)=>{
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
exports.pwchange=(req,res)=>{
        pw=req.body.pw
        newpw=req.body.newpw
        no=req.session.mem_no
        sql='select count(*) as cnt from member where mem_no=? and mem_pw=?'
        db.query(sql,[no,pw],(err,result)=>{
                if(err) {console.log(err);res.send({code:1})}
                else{
                        if(result[0].cnt){
                                sql='update member set mem_pw=? where mem_no=?'
                                db.query(sql,[newpw,no],(err,result)=>{
                                        if(err) {console.log(err);res.send({code:2})}
                                        else{
                                                if(result.affectedRows){
                                                        res.send({code:0})
                                                }else{
                                                        res.send({code:3})
                                                }
                                        }
                                })
                        }else{
                                res.send({code:4})
                        }
                }
        })
}
exports.retire=(req,res)=>{
        no=req.session.mem_no
        sql='update member set mem_flag=1 where mem_no=?'
        db.query(sql,no,(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result.affectedRows){
                                delete req.session.mem_no
                                res.send(true)
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.settingupdate=(req,res)=>{
        theme=req.body.theme
        font=req.body.font
        size=req.body.size
        no=req.session.mem_no
        sql='update member_option set mo_theme=?,mo_font=?,mo_size=? where mem_no=?'
        db.query(sql,[theme,font,size,no],(err,result)=>{
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