if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

const express = require("express")
const app = express()
const path = require("path")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const mongoose = require("mongoose")
const dbUrl = process.env.ATLASDB_URL
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require('./routes/listing.js')
const reviewRouter = require('./routes/review.js')
const userRouter = require('./routes/user.js')

const session = require('express-session')
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./Models/user.js")

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.use(methodOverride("_method"))

app.engine('ejs', ejsMate)


const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 60 * 60
})

store.on("error", () => {
    console.log("ERROR in mongo session store", err)
})

const session_options = {
    store: store,
    secret: process.env.SECRET, resave: false, saveUninitialized: true, cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true // to prevent cross-scripting attacks
    }
}

// app.get('/', (req, res) => {
//     res.send("i am root")
// })


app.use(session(
    session_options
))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user;
    next()
})

main().then(() => {
    console.log("connected to database")
}).catch(err => {
    console.log(err)
})

async function main() {
    await mongoose.connect(dbUrl);
}

app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter)

app.all('*', (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"))
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message })
})

app.listen(8080, () => {
    console.log("server is listening to port 8080")
})
