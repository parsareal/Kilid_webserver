var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
let _ = require('lodash')

let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: Number,
        required: true
    },

    // email: {
    //     type: String,
    //     default: null
    // },

    emails: [{
        email: {
            type: String,
            minlength: 5
        }
    }],

    userType: {
        type: String,
        default: "normal"
    },

    // token: {
    //     type: String,
    //     required: true
    // }
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
    
})

UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();

    return _.pick(userObject, ['_id', 'username', 'userType'])
}

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({_id: user._id.toHexString(), access}, 'some secret 123').toString();

    user.tokens.push({access, token});
    // user.tokens = ({access, token});
    // user.tokens.access = access;
    // user.tokens.token = token;
    // console.log(user.tokens);
    
    user.save();
    return token;
    // return user.save().then(() => {
    //     return token;
    // })
};

UserSchema.methods.removeToken = function (token) {
    let user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    })
};

UserSchema.methods.addEmail = async function (email) {
    let user = this;
    user.emails.push({email});
    let newUser;
    try {
        newUser = await user.save();
    } catch (error) {
        newUser = null
    }
    return newUser
    // return user.update({
    //     $pull: {
    //         tokens: {token}
    //     }
    // })
};

UserSchema.statics.findBytoken = function (token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'some secret 123');
    } catch (error) {
        return Promise.reject()
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

UserSchema.statics.findByCredentials = async function (username, password) {
    let User = this;
    let finalUser = await User.findOne({username, password})

    return finalUser;
}

let User = mongoose.model('User', UserSchema)

 
module.exports = {User}