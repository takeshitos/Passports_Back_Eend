const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const session = require('express-session');

const app = express()

const flash = require('connect-flash');
app.use(flash());

const PORT = process.env.PORT || 3000
const LocalStrategy = require('passport-local').Strategy;

//config mustache
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'dybala', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//passport
const users = [];

passport.use(new LocalStrategy({ usernameField: 'username' },
    function (username, password, done) {
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        return done(null, user);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    const user = users.find(u => u.id === id);
    done(null, user);
});

// Routes
app.get('/', (req, res) => {
    if (req.user) {
        res.render('index', { user: req.user, tasks: req.user.tasks, error: req.flash('error'), success: req.flash('success') });
    } else {
        res.render('login', {user: null, tasks: [], error: null, sucess: null});
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res, next) => {
    const newUser = {
        id: users.length+1,
        username: req.body.username,
        password: req.body.password,
        tasks: []
    }
    users.push(newUser);
    res.redirect('/login');
    console.log(user)
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});

app.post('/tasks', (req, res) => {
    const userId = req.user.id;
    const task = req.body.task;

    if (task === '') {
        req.flash('error', 'Task cannot be empty.');
        res.redirect('/');
    } else {
        req.user.tasks.push(task);
        req.flash('success', 'Task added successfully.');
        res.redirect('/');
    }
});

app.post('/delete-task/:index', (req, res) => {
    if (req.user) {
      const userId = req.user.id;
      const taskIndex = parseInt(req.params.index);
  
      req.user.tasks.splice(taskIndex, 1);
      res.redirect('/');
    } else {
      res.status(401).send('Unauthorized');
    }
  });
  
// Start server
app.listen(PORT, () => {
    console.log(`Servidor rodando aqui ${PORT}`);
});
