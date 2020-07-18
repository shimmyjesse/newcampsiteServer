const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    admin: {
        type: Boolean,
        default: false
    }
});

//also comes with authentication method, which we'll use elsewhere
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
//model name: 'User' - in first argument. //collection will automatically be named "users"
//giving the Schema to use for this model: userSchema.