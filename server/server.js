const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
// const { check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


const db = require('./config/db');
const sessionOption = require('./config/sessionOption');
const { response } = require('express');

const KakaoStrategy = require('passport-kakao').Strategy;
const NaverStrategy = require('passport-naver').Strategy;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(express.json());

let mysqlStore = require('express-mysql-session')(session); 
let sessionStore = new mysqlStore(sessionOption);

app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SECRET_KEY,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: "Lax", //'None':Https연결에서 사용 
        path: '/', 
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// passport와 관련된 코드는 session를 사용하므로 session활성화 코드 밑에 들어가야함.
passport.serializeUser((user, done) => {
    // console.log('serializeUser', user);
    done(null, user.email);
});

passport.deserializeUser((id, done) => {
    // console.log('deserializeUser', id);
    User
});

passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    (email, password, done) => {
        const sql = 'SELECT * FROM user WHERE email = ?';
        db.query(sql, [email], (err, data) => {
            if(err) return done(err);
            if(data.length === 0){
                return done(null, false, {Message : '이메일이 틀렸습니다.'});
            }

            const user = data[0];
            bcrypt.compare(password, user.password, (err, response) => {
                if(err) return done(err);
                if (response) {
                    return done(null, user);
                } else {
                    return done(null, false, { Message: '비밀번호가 틀렸습니다.' });
                }
            });
        });
    }
));


app.use(cookieParser(process.env.SECRET_KEY));
app.use(passport.initialize());
app.use(passport.session());
  

app.post('/login',
    passport.authenticate('local', { 
        successRedirect: '/', 
        failureRedirect: '/login' 
    })
);




//////////////////////////////////////////////////////////

app.get('/', (req, res) => {
    if(req.session.username) {
        return res.json({Status: "Success", username: req.session.username})
    } else {
        return res.json({Status: false})
    }
});

app.post('/signup', (req, res) => {
    const sql = `INSERT INTO user (username, email, password) VALUES (?)`;
    const password = req.body.password;

    bcrypt.hash(password.toString(), 10, (err, hash) => {
        if(err) {
            console.log(err);
        }
        const values = [
            req.body.username, 
            req.body.email, 
            hash
        ]
        db.query(sql, [values], (err, data) => {
            if (err) {
                console.error('MySQL 오류:', err);
                return res.status(500).json({ error: 'MySQL 쿼리 실행 중 오류가 발생했습니다.' });
            }
            return res.json(data);
        });
    });
});

app.post('/login'
, (req, res) => {
    const sql = 'SELECT * FROM user WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) => {
            if(err) return res.json({Message: "Error inside server"});
            if(data.length > 0){
                bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
                    if(err) {
                        return res.json({Message : "Error"});
                    }
                    if(response) {
                        req.session.username = data[0].username;
                        return res.json({Status : "Success"});
                    }
                    return res.json({Status : false});
                });
                
            } else {
                return res.json({Status : false});
            }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('세션 삭제 중 오류 발생:', err);
            return res.status(500).json({ Message: '로그아웃 실패' });
        } else {
            res.clearCookie('session_cookie_name');
            return res.status(200).json({Status : "Success"});
        }
    });
});


app.post('/send', (req, res) => {
    const sql = 'SELECT * FROM user WHERE username = ? AND email = ?';
    const values = [req.body.username, req.body.email];

    db.query(sql, values, (err, data) => {
        if(err) return res.status(500).json({ ok: false, Message: 'db Error' });
        if(data.length > 0 ) {
            const authNum = Math.random().toString().substring(2,9);

            const sql2 = 'UPDATE user SET password = ? WHERE username = ?';
            const update = [authNum, data[0].username]
            db.query(sql2, update, (err2, data2) => {
                if(err2) {
                    return res.status(500).json({ ok: false, Message: 'update Error' });
                } else {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.MAILER_ID,
                            pass: process.env.MAILER_PASSWORD
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });
        
                    const mailOptions = {
                        from: process.env.MAILER_ID,
                        to: req.body.email,
                        subject: '임시 비밀번호입니다.',
                        html: `
                            <html><body>
                                <p>${data[0].username}님의 임시 비밀번호는 다음과 같습니다</p>
                                <p>${authNum}</p>
                            </body></html>`
                    };
        
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            res.status(400).json({ ok: false , Message: '존재하지 않는 이메일입니다.'});
                        } else {
                            console.log('Email sent: ' + info.response);
                            res.status(200).json({ ok: true });
                        }
                        transporter.close();
                    });
                }
            });
           
        } else {
            res.status(400).json({ ok: false, error: 'User not found' });
        }
    });
});


app.listen(8081, () => {
    console.log("Listening...");
});