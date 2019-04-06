var db=require('../../db');
var mail=require('nodemailer')
exports.loginpage=function(req,res){ //로그인페이지
        res.render('login')
};
exports.login=function(req,res){ //로그인
        user={
                email:req.body.email,
                pw:req.body.pw,
        }
        var sql="select count(*) as count,mem_no from member where mem_email=? and mem_pw=?" 
        db.query(sql,[user.email,user.pw],function(err,result){
                if(err) {console.log(err);res.send(false)}
                else{
                        var count=result[0].count
                        var mem_no=result[0].mem_no
                        if(count==1){
                                var sql="update member set mem_cnt=mem_cnt+1 where mem_email=?" 
                                db.query(sql,user.email,function(err,result){
                                        if(err) console.log(err)
                                        else{
                                                if(result.affectedRows){
                                                        req.session.mem_no=mem_no
                                                        // var hour = 1800000
                                                        // req.session.cookie.expires = new Date(Date.now() + hour)
                                                        // req.session.cookie.maxAge = hour
                                                        req.session.save(function(){
                                                                res.send(true)
                                                        })
                                                }
                                        }
                                })
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.logout=function(req,res){//로그아웃
        delete req.session.mem_no //해당회원의 세션정보 삭제
        req.session.destroy(function(){
                res.redirect('/')
        })
}
exports.registerpage=(req,res)=>{
        res.render('register')
}
exports.register=(req,res)=>{
        var email=req.body.email
        var pw=req.body.pw
        var nick=req.body.nick
        var sql='insert into member(mem_email,mem_pw,mem_nick) values(?,?,?)'
        db.query(sql,[email,pw,nick],(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result.affectedRows){
                                req.session.mem_no=result.insertId
                                sql='insert into member_option(mem_no) values(?)'
                                db.query(sql,result.insertId,(err,result)=>{
                                        if(err) {console.log(err);res.send(false)}
                                        else{
                                                if(result.affectedRows){
                                                        res.send(true)
                                                }else{
                                                        res.send(false)
                                                }
                                        }
                                })
                        }else{
                                res.send(false)
                        }
                }
        })
}
exports.emailok=(req,res)=>{
        var email=req.body.email
        var sql='select count(*) as count from member where mem_email=?'
        db.query(sql,email,(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result[0].count>0){
                                res.send(false)
                        }else{
                                res.send(true)
                        }
                }
        })
}
exports.nickok=(req,res)=>{
        var nick=req.body.nick
        var sql='select count(*) as count from member where mem_nick=?'
        db.query(sql,nick,(err,result)=>{
                if(err) {console.log(err);res.send(false)}
                else{
                        if(result[0].count>0){
                                res.send(false)
                        }else{
                                res.send(true)
                        }
                }
        })
}
exports.pwfind=(req,res)=>{
        var email=req.body.email
        var sql='select count(*) as cnt from member where mem_email=?'
        db.query(sql,email,(err,result)=>{
                if(err){console.log(err);res.send({ok:false,code:1})}
                else{
                        if(result[0].cnt>0){
                                var newpw=generate()
                                var sql='update member set mem_pw=? where mem_email=?'
                                db.query(sql,[newpw,email],(err,result)=>{
                                        if(err) {console.log(err);res.send({ok:false,code:2})}
                                        else{
                                                if(result.affectedRows){
                                                        var main='<div class="body" style="margin:0px;">\
                                                                        <div class="title_img" style="width: 680px;margin-bottom:20px;background: rgb(10,101,168);padding: 20px 10px;"><img src="http://114.71.137.111:8080/img/menu_title.png" style="width: 150px;" /></div>\
                                                                        <div class="title" style="width:690px;height:100px;/*! padding:50px; */border:5px solid rgb(10,101,169);font-size:30px;position: relative;">\
                                                                                <div style="padding: 25px 130px;"><span style="color:rgb(10,101,169);font-weight:bold;">임시 비밀번호를 </span><span>알려드립니다</span></div>\
                                                                        </div>\
                                                                        <div class="body" style="font-size: 12px;width: 712px;margin:10px 0px">\
                                                                                <p>안녕하세요. alldaysql입니다.</p><span>회원님이 요청하신 임시 비밀번호는 </span><strong style="color: rgb(10,101,168);font-size: 14px;">[password]</strong><span> 입니다.</span>\
                                                                                <p>위의 임시 비밀번호로 로그인하신 후 바로 비밀번호를 새로운 비밀번호로 변경하시기 바랍니다.</p>\
                                                                        </div>\
                                                                        <div class="bottom" style="width: 700px;text-align: center;/*! background: gray; */background: #ddd;">\
                                                                                <p style="font-size:12px;">COPYRIGHT © 2019 INHA TECHNICAL COLLEGE. SPIRIT LAB. ALL RIGHTS RESERVED</p>\
                                                                        </div>\
                                                                </div>'
                                                        main=main.replace('password',newpw)
                                                        var post=mail.createTransport({
                                                                service:'gmail',
                                                                auth:{
                                                                        user:'alldaysql@gmail.com',
                                                                        pass:'tS1024768!@'
                                                                }
                                                        })
                                                        var option={
                                                                from:'alldaysql@gmail.com',
                                                                to:email,
                                                                subject:'[Ohe] 임시 비밀번호 발송 안내',
                                                                html:main
                                                        }
                                                        post.sendMail(option,(err,result)=>{
                                                                if(err){console.log(err);res.send({ok:false,code:4})}
                                                                else{
                                                                        res.send({ok:true,code:0})
                                                                }
                                                        })
                                                }else{
                                                        res.send({ok:false,code:3})
                                                }
                                        }
                                })
                        }else{
                                res.send({ok:false,code:1})
                        }
                }
        })
}
function randomPassword(length) { //랜덤패스워드생성
        var chars = "abcdefghijklmnopqrstuvwxyz1234567890";
        var pass = "";
        for (var x = 0; x < length; x++) {
            var i = Math.floor(Math.random() * chars.length);
            pass += chars.charAt(i);
        }
        return pass;
    }
    
function generate() {
        return randomPassword(6);
}