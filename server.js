require('dotenv').config(); // npm install dotenv 

const express = require('express'); 
// require() is used to import dependencies in CommonJS (Node.js).
// It loads only what is needed, helping keep applications lightweight.
const mongoose=require('mongoose');
const authRoutes=require('./src/routes/authRoutes');
const groupRoutes=require('./src/routes/groupRoutes');
const cookieParser = require('cookie-parser');
const expenseRoutes = require('./src/routes/expenseRoutes');



const cors=require('cors');
const rbacRoutes = require('./src/routes/rbacRoutes');


mongoose.connect(process.env.MONGO_DB_CONNECTION_URL) // mongoose 27017 default port
.then(()=> console.log('MongoDB Connected'))
.catch((error)=> console.log('Could not connect MongoDB..',error));

const corsOption={
    origin:process.env.CLIENT_URL,
    credentials:true
};





const app = express();


app.use(cors(corsOption));


// Middleware to parse incoming JSON requests into JavaScript objects
app.use(express.json());// middleware
app.use(cookieParser());//Middleware


app.use('/auth',authRoutes);
app.use('/groups',groupRoutes);
app.use('/users', rbacRoutes);
app.use('/expenses', expenseRoutes);




app.listen(5001, () => {
    console.log('Server is running on port 5001');
});

