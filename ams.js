// Account management system

const dbms = require('./dbms.js');
const crypto = require('./crypto/crypto.js');

module.exports.createAccount = async function(username, email, password){

    let salt = crypto.genSalt(username, email, password);
    let encrypted_pass = crypto.encrypt(password, salt);
    let token = crypto.genToken(username);

    let res = await dbms.add_user(username, email, encrypted_pass, salt, token);
    return res;
};

module.exports.loginAccount = async function(email, password){
    // TODO: filter blocked
    let originCreds = await dbms.getCreds(email); //GETS HMAC AND SALT
    if(!originCreds) return false; //In case account does not exist
     
    let originHmac = originCreds.passwd;
    let originSalt = originCreds.salt;

    let newHmac = crypto.encrypt(password, originSalt);

    if(originHmac == newHmac) return true;
    else return false;
}