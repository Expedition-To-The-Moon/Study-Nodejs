const express = require('express');
const passport = require('../auth');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const router = express.Router();

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ Status: "Success", username: req.user.username });
    } else {
        return res.json({ Status: false });
    }
});

router.post('/signup', (req, res) => {
    const sql = `INSERT INTO user (username, email, password) VALUES (?)`;
    const password = req.body.password;

    bcrypt.hash(password.toString(), 10, (err, hash) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: '비밀번호 해싱 중 오류가 발생했습니다.' });
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
            return res.json({ message: '사용자 등록 성공' });
        });
    });
});


router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log("user? ",user)
            return res.status(401).json({ message: '로그인 실패' });
        }
        req.logIn(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }
            return res.status(200).json({ Status: "Success", message: '로그인 성공', user });
        });
    })(req, res);
});
  

router.get('/logout', (req, res) => {
    req.logout();
    res.clearCookie('session_cookie_name');
    return res.status(200).json({ Status: "Success" });
});

router.post('/send', (req, res) => {
    const sql = 'SELECT * FROM user WHERE username = ? AND email = ?';
    const values = [req.body.username, req.body.email];

    db.query(sql, values, (err, data) => {
        if(err) return res.status(500).json({ ok: false, message: 'db Error' });
        if(data.length > 0 ) {
            const authNum = Math.random().toString().substring(2,9);

            const sql2 = 'UPDATE user SET password = ? WHERE username = ?';
            const update = [authNum, data[0].username]
            db.query(sql2, update, (err2, data2) => {
                if(err2) {
                    return res.status(500).json({ ok: false, message: 'update Error' });
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
                            res.status(400).json({ ok: false , message: '존재하지 않는 이메일입니다.'});
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

module.exports = router;