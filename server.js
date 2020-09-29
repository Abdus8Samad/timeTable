const express = require('express'),
app = express(),
morgan = require('morgan'),
bodyParser = require('body-parser'),
bcrypt = require('bcrypt'),
flash = require('connect-flash'),
fs = require('fs'),
expressSession = require('express-session'),
table = require('./timeTable'),
subs = require('./subs'),
PORT = process.env.PORT || 8080,
passWord = 'Katana',
userName = 'admin';
var isAdmin = false;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressSession({
    resave:true,
    saveUninitialized:true,
    secret:'My Secret'
}))
app.use(flash());
app.set('view engine','ejs');
app.use(express.static('public'));

app.get('/',(req,res) =>{
    if(isAdmin) res.render('adminIndex',{subs,table,msg:req.flash('success')});
        else res.render('index',{table,msg:req.flash('logout')});
})

app.get('/login',(req,res) =>{
    if(isAdmin) res.redirect('/');
    else res.render('login',{msg:req.flash('error')});
})

app.post('/login',(req,res) =>{
    let { username, password } = req.body;
    bcrypt.hash(passWord, 10)
    .then(hash =>{
        bcrypt.compare(password, hash)
        .then(result =>{
            if(!result || username !== userName){
                res.status(401);
                req.flash('error','Incorrect Username or pasword');
                res.redirect('/login');
            } else {
                isAdmin = true;
                res.status(200);
                req.flash('success','Welcome, Admin');
                res.redirect('/');
            }
        })
    })
})

app.get('/logout',(req,res) =>{
    isAdmin = false;
    req.flash('logout','Logged Out Successfully');
    res.redirect('/');
})

app.post("/saveSubs",(req,res) =>{
    req.body.toRemove.forEach(sub =>{
        let index = subs.indexOf(sub);
        subs.splice(index,1);
    })
    req.body.toAdd.forEach(sub =>{
        subs.push(sub);
    })
    fs.writeFile('subs.json',JSON.stringify(subs), err =>{
        if(err) throw err;
        console.log("Subs file written");
        res.send();
    });
})

app.post("/save",(req,res) =>{
    req.body.cont.forEach(elem =>{
        let day = elem[1].split(",")[0];
        let index = elem[1].split(",")[1];
        table[day][index] = elem[0];
    })
    fs.writeFile('timeTable.json',JSON.stringify(table), err =>{
        if(err) throw err;
        console.log("Table file written");
        res.send();
    })
})

app.listen(PORT,() => console.log(`Server Listening at PORT ${PORT}`));
