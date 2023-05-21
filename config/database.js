const mangoose = require('mongoose');

const {MONGO_URI} = process.env;

exports.connect = () => {
    mangoose
    .connect(MONGO_URI, {
    })
    .then(() =>{
        console.log('successfully connected to database')
    })
    .catch((err) =>{
        console.log("database connection failed. existing now...");
        console.error(err);
        process.exit(1);
    })
}