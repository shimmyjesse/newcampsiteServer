const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Favorite', favoriteSchema);


// "_id" : ObjectId("5f1e33c9856a6710511c22a5")

// "_id" : ObjectId("5f1e33dc856a6710511c22a6")

// "_id" : ObjectId("5f1e33dc856a6710511c22a7")