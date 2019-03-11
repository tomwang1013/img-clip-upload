const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
const bodyParser = require('body-parser')

app.use(express.static('public'))
app.use(bodyParser.raw({ type: 'image/*' }))

app.options('/upload', (req, res) => {
  res.append('Access-Control-Allow-Origin', '*')
  res.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  res.send('first');
});

app.post('/upload', (req, res) => {
  res.append('Access-Control-Allow-Origin', '*')
  fs.writeFile('./public/upload.png', req.body, err => {
    res.append('Content-Type', 'text/plain')
    res.send('http://127.0.0.1:3000/upload.png?_time=' + Date.now())
  })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))