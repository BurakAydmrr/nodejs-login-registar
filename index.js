const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

const saltRounds = 10;
dotenv.config({ path: './.env' });
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_ROOT,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})


db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("MYSQL Connected...")
    }
});


app.get('/', (req, res) => {
    res.render('index', { title: 'Node.js Login Registar' });
});


app.get('/login', (req, res) => {
    res.render('login');

});

app.get('/register', (req, res) => {
    res.render('register');
});



app.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.pass;

    const query = 'SELECT * FROM users WHERE email = ? ';

    const plainPassword = password;

    db.query(query, [email], (error, result) => {
        if (error) {
            console.log(error);
        } else {
            if (result.length > 0) {
                const userName = result[0].name;
                bcrypt.compare(plainPassword, result[0].password, (err, result) => {
                    if (err) {
                        console.error(err);
                    } else {
                        if (result) {
                            var token = jwt.sign({ email: email, date: new Date() }, process.env.JWT_SECRET, { expiresIn: '1h' })
                            res.status(200).send(`Giriş Başarılı, Hoşgeldin ${userName}`);
                        } else {
                            res.status(401).send('Kullanıcı bilgileri yanlış');
                        }
                    }
                });

            } else {
                res.status(401).send('Kullanıcı bilgileri yanlış');
            }
        }

    });

});

app.post('/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.pass;

    const plainPassword = password;

    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
        if (err) {
            console.error(err);
        } else {
            const query = 'INSERT INTO users SET name = ?, email = ?, password = ?';

            db.query(query, [name, email, hash], (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    res.send('Kayıt başarılı');
                }
            });
        }
    });
});

 // optional token control

// app.get('/dashboard', (req, res) => {
  
//     let token = req.headers['x-access-token'] || req.headers['authorization'].split(' ')[1];
//     if(token){
//         jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//             if(err){
//                 res.status(401).send('Token geçersiz');
//             }else{
//                 res.status(200).send('Token geçerli');
//             }
//         });

//     }else{
//         res.status(401).send('Token geçersiz');
//     }

// });

app.listen(5000, () => {
    console.log("Server started on port 5000");
});