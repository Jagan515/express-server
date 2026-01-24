const express = require('express'); 
// require() is used to import dependencies in CommonJS (Node.js).
// It loads only what is needed, helping keep applications lightweight.
const authRoutes=require('./src/routes/authRouter')

const app = express();

// Middleware to parse incoming JSON requests into JavaScript objects
app.use(express.json());


app.use('/auth',authRoutes);



app.listen(5001, () => {
    console.log('Server is running on port 5001');
});

