const express = require('express');
const bp = require('body-parser');
const db = require('knex')({
    client: 'pg',
    connection: {
        host: 'postgresql-tapered-09678',
        user: 'shadi',
        password: '',
        database: 'facerecog'
    }
});
const bcrypt = require('bcrypt');
const cors = require("cors");
const saltRounds = 10;

const app = express();
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }
 app.use(cors(corsOptions));
app.use(bp.json());

app.get('/', (req, res) => {res.send('Backend is running successfully!')});
app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const validCred = bcrypt.compareSync(req.body.password, data[0].hash);
            if (validCred) {
                return db.select('*').from('users').where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('Unable to get user'))
            }
            else {
                res.status(400).json('Wrong credentials')
            }
        })
        .catch(err => res.status(400).json('Wrong credentials'));
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    var validCheck = true;

    // check if there already exists this email in db
    db.select('email').from('login').where('email', '=', email)
        .then(data => {
            if (data.length == 1) {
                validCheck = false;
                res.status(400).json('User already exists');
            }
        });

    const hash = bcrypt.hashSync(password, saltRounds);
    if (validCheck == true) {
        db.transaction(trx => {
            trx('login').insert({
                hash: hash,
                email: email
            })
                .returning('email')
                .then(loginEmail => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            email: loginEmail[0].email,
                            name: name,
                            joined: new Date()
                        }).then(user => {
                            res.json(user);
                        })
                })
                .then(trx.commit)
                .catch(trx.rollback)
        })
            .catch(err => res.status(400).json('Unable to register'));
    }
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({ id }).then(user => {
        if (user.length) {
            res.json(user);
        }
        else {
            res.status(400).json('Not found');
        }
    })
        .catch(err => res.status(400).json('Error getting user'));
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id).increment('entries', 1).returning('entries')
        .then(entries => {
            res.json(entries[0]);
        })
        .catch(err => res.status(400).json('Unable to get entries'));
})

app.listen(process.env.PORT || 3000, () => {
    console.log('app is running on port ${process.env.port}');
})