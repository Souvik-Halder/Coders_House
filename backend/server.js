
//Dotenv configuration
require('dotenv').config();
const PORT=process.env.PORT||5500;
const express=require('express');
const app=express();
const routes=require('./routes');
const DbConnect=require('./database')
const cors=require('cors')
const cookieParser=require('cookie-parser')
//To get the json data at server Json Middleware
app.use(express.json({limit:'8mb'}))
app.use(cookieParser());

    
//Cors middlware
const corsOption={
    origin:['http://localhost:3000'],
    credentials:true,
}
app.use(cors(corsOption))
//To make the storage folder static so that we can easily see the images by the url
app.use('/storage',express.static('storage'))
//Data Base connection
DbConnect();
app.get('/',(req,res)=>{
res.send("Hello from Express js")
})

app.use('/api/',routes);

app.listen(PORT,()=>{
    console.log(`Server Listening on port ${PORT}`)
})

process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  
    process.exit(1)
  });

  //Handling Uncaught Exception
process.on('uncaughtException',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server");
    process.exit(1)
  })