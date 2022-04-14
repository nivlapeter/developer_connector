const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI") //get the db value from the json file

//async await to connect to db
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser : true
            // useCreateIndex : true,
            // useFindAndModify : false
        }) // returns a promise hence an await
    } catch (error) {
        console.error(error.message);
        // exit process
        process.exit(1);
        
    }
}

module.exports = connectDB //exports the function





