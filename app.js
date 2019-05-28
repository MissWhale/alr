{//서버설정###################################서버설정#####################################서버설정
    var express=require('express');
    var bodyParser=require('body-parser')
    var app=express();
    var session=require('express-session');
    var mss=require('express-mysql-session')(session);

    var option={ //세션설정
            host:'114.71.137.109',
            port:3306,
            user:'root',
            password:'tmvlflt1234',
            database:'Mok3',
            charset:'utf8'
    }
    var sstore=new mss(option);
    app.locals.pretty=true; //jade를 html태그로 렌더링할때 이쁘게 변환시켜줌
    app.set('view engine','jade');//jade 템플릿 엔진으로 설정
    app.set('views',["./view/user","./view/admin","./view/"]);//front-end파일의 경로
    app.use(express.static(__dirname+'/css'));//css파일 경로
    app.use("/css", express.static(__dirname + '/css'));//css파일 경로
    app.use(express.static(__dirname+'/img'));//이미지 파일 경로
    app.use("/img", express.static(__dirname + '/img'));//이미지 파일 경로
    app.use(express.static(__dirname+'/js'));//js파일경로
    app.use("/js", express.static(__dirname + '/js'));//js파일경로
    app.use(express.static(__dirname+'/file'));//js파일경로
    app.use("/file", express.static(__dirname + '/file'));//js파일경로
    app.use(express.static(__dirname+'/project_result'));//프로젝트 결과물 파일경로
    app.use("/project_result", express.static(__dirname + '/project_result'));//프로젝트 결과물 파일경로
    app.use(bodyParser.urlencoded({extended:false}));//post방식사용시 req.body로 값을 받아오기위해 사용
    app.use(bodyParser.json());//post방식사용시 req.body로 값을 받아오기위해 사용
    app.use(session({ //세션
            secret:'test',
            resave:false,
            saveUninitialized:true,
            store:sstore
    }));
    app.use('/login', require('./route/controller/loginctr')); //로그인관련 라우팅
    app.use('/user', require('./route/controller/userctr')); //회원정보관련 라우팅
    app.use('/notice', require('./route/controller/noticectr')); //성적관련 라우팅
    app.use('/board', require('./route/controller/boardctr')); //게시판관련 라우팅
    app.use(['/','/project'], require('./route/controller/projectctr')); //게시판관련 라우팅
    app.listen(3000,()=>{ 
            console.log('Conneted 3000 port');
    });
}
Date.prototype.format = function(f) { //날짜형식 함수
    if (!this.valueOf()) return " ";
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
            switch ($1) {
                    case "yyyy": return d.getFullYear();
                    case "yy": return (d.getFullYear() % 1000).zf(2);
                    case "MM": return (d.getMonth() + 1).zf(2);
                    case "dd": return d.getDate().zf(2);
                    case "E": return weekName[d.getDay()];
                    case "HH": return d.getHours().zf(2);
                    case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
                    case "mm": return d.getMinutes().zf(2);
                    case "ss": return d.getSeconds().zf(2);
                    case "a/p": return d.getHours() < 12 ? "오전" : "오후";
                    default: return $1;
            }
    });
};
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

// node-sass --watch css/ --output css/