import express from 'express'
import bodyParser from 'body-parser'
import { v4 as uuidv4 } from 'uuid';
import pgPromise from 'pg-promise'
const pgp = pgPromise({});

const app = express()
const port = 3000

app.use(bodyParser.json())

let conn = null
// function connectPostgresSQL
const connectPostgresSQL = async () => {
  conn = await pgp({
    host: '127.0.0.1',
    port: 5432,
    database: 'test_db',
    user: 'root',
    password: 'root',
  })
}

//* Root path
app.get('/', (req, res) => {



  res.send('Hello World!!')
})

//** Get all users */
app.get('/users', async (req, res) => {
  let trxid = uuidv4()
  let users = []

  try {
    users = await conn.any('SELECT uid, name FROM users');
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }

  res.json({
    transactionID: trxid,
    message: "get all users success",
    data: users
  })
})

//* Create users
app.post('/users', async (req, res) => {
  let trxid = uuidv4()
  let user = req.body

  try {
    let uid = uuidv4()
    await conn.any('INSERT INTO users(uid, name, age) VALUES($1, $2, $3)', [uid, user.name, user.age]);
    // success
    user.uid = uid
  }
  catch (e) {
    // error
    console.error(e);
  }

  res.json({
    transactionID: trxid,
    message: "create users success",
    data: user
  })
})

//** Get users by id
app.get('/users/:id', async (req, res) => {
  let trxid = uuidv4()
  let uid = req.params.id

  let resUser = {}
  try {
    resUser = await conn.any('SELECT * FROM users WHERE uid = $1', [uid]);
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }

  res.json({
    transactionID: trxid,
    message: "get users success",
    data: resUser[0]
  })
})

//** Update users by id
app.put('/users/:id', async (req, res) => {
  let trxid = uuidv4()
  let uid = req.params.id
  let reqUser = req.body

  //** get user by id */
  let resUser = {}
  try {
    resUser = await conn.any('SELECT * FROM users WHERE uid = $1', [uid]);
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }

  //** process data */
  let updateUser = resUser[0]
  updateUser.name = reqUser.name || updateUser.name
  updateUser.age = reqUser.age || updateUser.age

  //** update user by id */
  try {
    await conn.any('UPDATE users SET name = $1, age = $2 WHERE uid = $3', [updateUser.name, updateUser.age, uid]);
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }

  res.json({
    transactionID: trxid,
    message: "update success",
    data: updateUser
  })
})

//** Delete users by id
app.delete('/users/:id', async (req, res) => {
  let trxid = uuidv4()
  let uid = req.params.id
  // let selectedIndex = users.findIndex(user => user.uid == uid)
  // users.splice(selectedIndex, 1)

  //** delete user by id */
  try {
    await conn.any('DELETE FROM users WHERE uid = $1', [uid]);
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }

  res.json({
    transactionID: trxid,
    message: "delete success",
    data: { deleted: uid }
  })
})


//* Start Server
app.listen(port, async () => {
  await connectPostgresSQL()
  console.log(`Example app listening on port ${port}`)
})