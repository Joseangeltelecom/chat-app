const express = require("express")
const app = express()
const cors = require("cors")
const compression = require("compression")
const path = require("path")
const port = 5000

// General settings
app.set("port", process.env.PORT || port) // to set the port where our app will listen to it will first pick the port set up in our "env" is not avilable it will take "port"
require("dotenv").config() // this helps us to be abel to read the envoriment variables.
// require("./config/database") // importing the database configuration.

// Base de datos:
const mongoose = require("mongoose")
const Message = require('./Message')

/**
 * -------------- DATABASE ----------------
 */
const mongoDb = process.env.MONGODB_URI

mongoose.connect(mongoDb, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})

const db = mongoose.connection
db.on("error", (error) => console.log(error))

db.once("open", () => {
  console.log("Database is connected")
})

app.set("port", process.env.PORT || port)
/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 *
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 * DB_STRING_PROD=<your production database string>
 */

// Middlewares: with app.use() you can run a global function or global midleware.
// Express will runn all the global middlewares and then the specific middlewares.
// middleware error hanler: goes at the end of our app after all our routes and middlewares.
// the reason is becouse once express finds an error it will skip all the routes and middlewares and send it to the error handler.

/* evertime we load a page this passport.initialize() and passport.session() will run
and they will check if the property passport: { user: '61c4339731d30871f4914c63' } is not null. 
si existe entonces agarra ense id y lo envia a el deserializeUser

si assport: { user: '61c4339731d30871f4914c63' } is null the user is not logged in. and does not grab the user form the session.
and the req.user is not papulated. */

app.use(passport.initialize())
app.use(cors()) // to run 2 development servers ( client and Backend)
app.use(express.json()) // Now expresss is abel to parse the in coming data req.body to recognize Json Object.
app.use(express.urlencoded({ extended: false })) // to recognize the incoming Request Object as strings or arrays.
app.use(compression()) //Compress all routes
// app.use(helmet()) // secure our endpoints
app.use(express.static(path.join(__dirname, "client", "build")))


io.on('connection', (socket) => {

  // Get the last 10 messages from the database.
  Message.find().sort({createdAt: -1}).limit(10).exec((err, messages) => {
    if (err) return console.error(err);

    // Send the last messages to the user.
    socket.emit('init', messages);
  });

  // Listen to connected users for a new message.
  socket.on('message', (msg) => {
    // Create a message with the content and the name of the user.
    const message = new Message({
      content: msg.content,
      name: msg.name,
    });

    // Save the message to the database.
    message.save((err) => {
      if (err) return console.error(err);
    });

    // Notify all other users about a new message.
    socket.broadcast.emit('push', msg);
  });
});


/* express.static exposes a directory or a file to a particular URL so it's contents can be publicly accessed.

From your example:
app.use('/assets', express.static(__dirname + '/assets'));
Assuming the /assets directory contains 2 images, foo.jpg and bar.jpg then you can simply access them at:

http://your-domain.com/assets/foo.jpg
http://your-domain.com/assets/bar.jpg
There's nothing more to it. */

// routes:
// app.use(require("./routes")) // It will look for the index (Telecom) file that is routes

// Right before your app.listen(), add this:
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"))
})

// this is an async function since we need to wait for our server to connect to the database.
async function main() {
  await app.listen(app.get("port")) // the app will listen on the predefined "port". The way we get the port It's with app.get("port")
  console.log("Server listening on port", app.get("port")) // to show on the console where my app is listening to.
}

main() // calling the main() function

module.exports = app // exporting the app express
