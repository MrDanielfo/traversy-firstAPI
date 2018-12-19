const express = require('express');
const path   = require('path');

// Call Mongoose
const mongoose = require('mongoose'); 
// Call Body Parser
const bodyParser = require('body-parser'); 
// Call Validator
const expressValidator = require('express-validator');
// Call Flash
const flash = require('connect-flash'); 
// Call Session
const session = require('express-session');
// Call config
const config = require('./config/database.js'); 
// Call Passport
const passport = require('passport');


let db = mongoose.connection; 

mongoose.connect(config.database); 

db.once('open', function(){
    console.log('Connected to MongoDB');
})

// Check for DB errors

db.on('error', function(){
    console.log(err)
})

// declarar variable
// init APP
const app = express(); 

// Bring in Models 

let Article = require('./models/article'); 



// Load View Engine

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug'); 

// Body Parser Middleware

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Set Public Folder 

app.use(express.static(path.join(__dirname, 'public'))); 

// Express Session Middleware

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
})); 

// Express Messages Middleware

app.use(require('connect-flash')());

app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
})

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg : msg,
            value: value
        };
    }
}));

// Passport config

require('./config/passport')(passport); 

// Passport Middleware Settings 

app.use(passport.initialize());
app.use(passport.session());

// Passport local user variable

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next(); 
})


// Home Route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err); 
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            }); 
        }
    }); 
}); 

// Route Files

let articlesRoute = require('./routes/articles'); 

app.use('/articles', articlesRoute); 

let usersRoute = require('./routes/users');

app.use('/users', usersRoute); 

// Start Server
app.listen(3000, function() {
  console.log('Server started on http://localhost:3000');
});

/* fin del código */
