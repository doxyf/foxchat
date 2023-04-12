const { Client } = require('pg')
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'users',
  password: '-',
  port: 5432,
});

client.connect();

module.exports.add_user = async function (username, email, password, salt, token){
  username = patch(username);
  email = patch(email);
  err = false;

  await client.query(`INSERT INTO people (username, email, token, passwd, salt) VALUES ('${username}', '${email}', '${token}', '${password}', '${salt}')`)
  .catch(e => err = true);

  if(err) return false;
  else return true;
};

module.exports.getCreds = async function (email){
  email = patch(email);

  var res = await client.query(`SELECT passwd, salt FROM people WHERE email='${email}'`);
  if(res.rowCount == 0) return false;
  else return res.rows[0];
}

module.exports.getTokenUsername = async function (email){
  var res = await client.query(`SELECT token FROM people WHERE email='${email}'`);
  if(res.rowCount == 0) return false; 
  else return res.rows[0];
}

module.exports.getAccByToken = async function (token){
  token = patch(token);

  var res = await client.query(`SELECT * FROM people WHERE token='${token}'`);
  if(res.rowCount == 0) return false;
  else return res.rows[0];
};

module.exports.getAccById = async function (id){
  id = patch(id.toString());

  var res = await client.query(`SELECT * FROM people WHERE id='${id}'`);
  if(res.rowCount == 0) return false;
  else return res.rows[0];
};

function patch(string){
  let fixed = string.replace(/'/g, "''");
  return fixed;
}

//DB PORT 5432