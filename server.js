const express = require('express');
const bp = require('body-parser');
// const db = require('knex')({
//     client: 'pg',
//     connection: {
//         connectionString: process.env.DATABASE_URL,
//         ssl: {
//             rejectUnauthorized: false
//         }
//     }
// });
const bcrypt = require('bcrypt');
const cors = require("cors");
const saltRounds = 10;

const app = express();
const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions));
app.use(bp.json());

app.get('/', (req, res) => { res.send('Backend is running successfully!') });
app.post('/signin', (req, res) => {
    res.json("Found");
})

app.post('/signup', (req, res) => {
    res.json("Found");
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
    console.log(`app is running on port ${process.env.PORT}`);
})