const mongoose = require('mongoose');
const db = mongoose.connect(process.env.DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

module.exports = db;