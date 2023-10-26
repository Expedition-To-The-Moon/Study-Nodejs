const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('./auth');
const flash = require('connect-flash');
const sessionOption = require('./config/sessionOption');
const routes = require('./routes/routes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(express.json());

const mysqlStore = require('express-mysql-session')(session); 
const sessionStore = new mysqlStore(sessionOption);

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

app.use(cookieParser(process.env.SECRET_KEY));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', routes);
app.use('/signup', routes);
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));
app.use('/logout', routes);
app.use('/send', routes);


app.listen(4000, () => {
    console.log("Listening...");
});