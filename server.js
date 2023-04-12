const express = require('express');
const app = express();
var bodyParser = require('body-parser')
const http = require('http').Server(app);
const io = require('socket.io')(http);

const ams = require('./ams.js');
const dbms = require('./dbms.js');

app.use('/static', express.static('static'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  if(req.headers.cookie?.includes('auth')) return res.redirect('/chat');
  res.redirect('/login');
});

app.get('/chat', (req, res) => {
  if(req.headers.cookie?.includes('auth')) return res.sendFile(`${__dirname}/html/chat.html`);
  res.redirect('/login');
});

app.get('/logout', (req, res) => {
  if(!req.headers.cookie?.includes('auth')) return res.redirect('/login');
  res.sendFile(`${__dirname}/html/logout.html`);
});

app.post('/messages', async (req, res) => {
  let token = req.headers.auth;
  if(!token) return res.status(400).send({message: "The 'auth' header is missing."});
  if(!req.body?.message) return res.status(400).send({message: "Require message 'parameter' in JSON body."});

  let sender = await dbms.getAccByToken(token);

  if(!sender) return res.status(403).send({'message': 'Token invalid.'});
  if(!online[token]) return res.status(403).send({'message': 'Ghosts are not allowed.'});

  emit(sender.username, req.body.message);
  res.status(200).send({'success': true});
});

app.post('/login', async (req, res) => {
  if(!req.body.email) return res.status(400).send({message: "The 'email' parameter is missing."});
  if(!req.body.password) return res.status(400).send({message: "The 'password' parameter is missing."});

  let correct = await ams.loginAccount(req.body.email, req.body.password);

  if(correct)
  {
    let cred = await dbms.getTokenUsername(req.body.email);
    res.set({'Set-Cookie': `auth=${cred.token}; SameSite=Lax`});
    res.status(200).send({success: true});
  }
  else res.status(403).send({message: "Wrong credentials provided."});
});

app.get('/login', (req, res) => {
  res.sendFile(`${__dirname}/html/login.html`);
});

app.get('/register', (req, res) => {
  res.sendFile(`${__dirname}/html/register.html`);
});

app.post('/register', async (req, res) => {
  if(!req.body.username) return res.status(400).send({message: "The 'username' parameter is missing."});
  if(!req.body.email) return res.status(400).send({message: "The 'email' parameter is missing."});
  if(!req.body.password) return res.status(400).send({message: "The 'password' parameter is missing."});

  let result = await ams.createAccount(req.body.username, req.body.email, req.body.password);

  if(result)
  {
    let cred = await dbms.getTokenUsername(req.body.email);
    res.set({'Set-Cookie': `auth=${cred.token}; SameSite=Strict`});
    res.status(201).send({success: true});
  }
  else res.status(409).send({message: "User with this username or email already exist."});
});

app.get('/me', async (req, res) => {
  if(!req.headers.auth) return res.status(401).send({message: "Missing 'auth' header"});

  let account = await dbms.getAccByToken(req.headers.auth);

  if(account)
  {
    res.status(200).send
    ({
      id: account.id,
      username: account.username,
      email: account.email
    })
  }
  else res.status(403).send({message: "Invalid token provided."});
});

app.get('/session', async (req, res) => {
  if(!req.headers.auth) return res.status(401).send({message: "Missing 'auth' header"});

  let account = await dbms.getAccByToken(req.headers.auth);

  if(account)
  {
    let resultArray = [];
    Object.entries(online).forEach(([e, v]) => {
      resultArray.push(v.name);
    });

    res.status(200).send({online: resultArray});
  }
  else res.status(403).send({message: "Invalid token provided."});
});

app.get('/whois/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  if(Number.isNaN(id)) return res.status(400).send({message: "Requested ID must be an integer."});

  let account = await dbms.getAccById(id);

  if(account)
  {
    res.status(200).send
    ({
      id: account.id,
      username: account.username
    })
  }
  else res.status(404).send({message: "User with this id not found."});
});

http.listen(3001, function() {
    console.log('listening on :3001');
});

var online = {}; // Injecting it right into the sockets might be better (TOTRY)

io.on('connection', socket => {

  socket.emit('shake', {state: 'waiting'});

  socket.once('shake', async message => {
    if(message.token)
    {
      let result = await dbms.getAccByToken(message.token);
      if(result) 
      { 
        online[message.token] = {id: socket.id, name: result.username};
        socket.username = result.username;
        socket.emit('shake', {state: 'accept'});
        io.emit('join', {name: result.username});
      }
      else socket.emit('shake', {state: 'reject', reason: 'Incorrect token.'});
    }
    else socket.emit('shake', {state: 'reject', reason: 'Missing token.'});
  });

  console.log('New connection established: '+socket.id);

  socket.on('disconnect', () => {
    console.log('Connection lost: '+socket.id);
  
    Object.entries(online).forEach(([e, v]) => {
      if(v.id == socket.id) {
        delete online[e]
        io.emit('leave', {name: v.name});
      }
    });

  });
});

function emit(user = '<unknown>', message = '<unknown>'){
  console.log(`Incoming message from ${user}: ${message}`)
  io.emit('messageCreate', {username: xssPatch(user), content: xssPatch(message)});
};

function xssPatch(string){
  let stringFixed = string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return stringFixed;
};