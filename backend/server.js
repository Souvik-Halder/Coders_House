
//Dotenv configuration
require('dotenv').config();
const PORT=process.env.PORT||5500;
const express=require('express');
const app=express();
const routes=require('./routes');
const DbConnect=require('./database')
const cors=require('cors')
//To get the json data at server Json Middleware
app.use(express.json())


//Cors middlware
const corsOption={
    origin:['http://localhost:3000']
}
app.use(cors(corsOption)) 

//Data Base connection
DbConnect();
app.get('/',(req,res)=>{
res.send("Hello from Express js")
})

app.use('/api/',routes);

app.listen(PORT,()=>{
    console.log(`Server Listening on port ${PORT}`)
})