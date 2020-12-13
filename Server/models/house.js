var mongoose = require('mongoose');

let House = mongoose.model('House', {
    title: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        default: 0
    },

    houseType: {
        type: String,
        default: 0
    },

    area: {
        type: Number,
        default: 0
    },

    phone: {
        type: Number,
        require: true,
        minlength: 10
    },


    bedrooms: {
        type: Number,
        default: 1
    },

    parkings: {
        type: Number,
        default: 0
    },

    location: {
        type: String
    },

    created_at: {
        type: Number,
        default: +new Date() + 7*24*60*60*1000
    },

    pics: [{
        type: String
    }],

    estate: {
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        require: true
    },

    star: {
        type: Boolean,
        default: false
    }
})


module.exports = {House}