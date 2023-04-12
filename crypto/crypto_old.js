const crypto = require('node:crypto');

const key = Buffer.from('-', 'utf-8');

module.exports.genSalt = function (username, email, password){
    const password64 = Buffer.from(password, 'utf-8').toString('base64');
    let updateStr = Buffer.from(`${username}&${email}`).toString('base64');

    const hash = crypto.createHmac('sha256', password64)
                       .update(updateStr)
                       .digest('hex');
            
    return hash.slice(0, 25);
}

function encrypt(text) {
    const iv = crypto.randomBytes(16);

    // Creating Cipheriv with its parameter
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
     
    // Updating text
    let encrypted = cipher.update(text);
     
    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);
     
    // Returning iv and encrypted data
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
     

function decrypt(text) {
  
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
     
    // Creating Decipher
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
     
    // Updating encrypted text
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
     
    // returns data after decryption
    return decrypted.toString();
}