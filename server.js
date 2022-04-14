const express = require ("express")
const connectDB = require("./config/db")

const app = express();
//connect database

connectDB() //calls the function
const PORT = process.env.PORT || 5000;

//init middleware
app.use(express.json({extended : false}))

app.get('/', (req,res) => console.log("App running")
)

//Define routes
app.use("/api/users", require("./routes/api/users"))
app.use("/api/auth", require("./routes/api/auth"))
app.use("/api/posts", require("./routes/api/posts"))
app.use("/api/profile", require("./routes/api/profile"))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)
)

// mongodb+srv://Alvin:nivla001@devconnector.dbnij.mongodb.net/test?retryWrites=true&w=majority

// "start": "node server",
// "server" : "nodemon server"