const crypto = require('node:crypto');

const key = Buffer.from('-', 'utf-8');

module.exports.genSalt = function (username, email, password){ //PASSWORD IS STILL IN BASE64!!!!
    let updateStr = Buffer.from(`${username}&${email}`).toString('base64');

    const hash = crypto.createHmac('sha256', password)
                       .update(updateStr)
                       .digest('hex');
            
    return hash.slice(0, 25);
};

module.exports.encrypt = function (password, salt) {
    const hash = crypto.createHmac('sha256', key)
                       .update(`${salt}${password}`)
                       .digest('hex');

    return hash;
};

module.exports.genToken = function(username){
    let id64 = Buffer.from(username, 'utf-8').toString('base64');
    let tokenraw = crypto.randomBytes(50).toString('base64');

    return `Ur.${id64.slice(0, 5)}.${tokenraw}`;
};