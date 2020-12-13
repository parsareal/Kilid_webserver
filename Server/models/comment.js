var mongoose = require('mongoose');

let Comment = mongoose.model('Comment', {
    statement: {
        type: String
    },

    houseid: {
        type: mongoose.Schema.Types.ObjectId
    },

    commentDate: {
        type: Number,
        default: +new Date() + 7*24*60*60*1000
    }
})

// let newUser = new User({
//     name: 'parsa'
// })

// newUser.save().then((doc) => {
//     console.log('Saved user', doc);
// }, (e) => {
//     console.log('Not saved');
// })

module.exports = {Comment}