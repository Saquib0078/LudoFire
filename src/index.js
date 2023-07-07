const express = require('express')
const route = require('./route/route.js')
const app = express()


app.use(express.json())
app.use(express.urlencoded({extended: true}))




app.use('/', route)
app.use(function(req, res){
    return res.status(400).send({status: false, message: "Path Not Found"})
})


app.listen(process.env.PORT || 3000, function(){
    console.log("Express app running on Port " + (process.env.PORT || 3000))
})

