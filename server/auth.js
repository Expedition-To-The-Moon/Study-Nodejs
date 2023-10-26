const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./config/db');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    (email, password, done) => {
        const sql = 'SELECT * FROM user WHERE email = ?';
        db.query(sql, [email], (err, data) => {
            if (err) return done(err);
            if (data.length === 0) {
                return done(null, false, { message: '이메일이 틀렸습니다.' });
            }
            const user = data[0];
            bcrypt.compare(password, user.password, (err, response) => {
                if (err) return done(err);
                if (response) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: '비밀번호가 틀렸습니다.' });
                }
            });
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser((email, done) => {
    const sql = 'SELECT * FROM user WHERE email = ?';
    db.query(sql, [email], (err, data) => {
        if (err) return done(err);
        if (data.length === 0) {
            return done(null, false);
        }
        
        const user = data[0];
        done(null, user);
    });
});

module.exports = passport;