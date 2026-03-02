const express=require('express');
const dotenv=require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB=require('./config/db');

dotenv.config({path:'./config/config.env'});

connectDB();

const app=express();

app.set('query parser','extended');
app.use(express.json());
app.use(cookieParser());

const restaurants=require('./routes/restaurants');
const auth=require('./routes/auth');
const reservations=require('./routes/reservations');

app.use('/api/v1/restaurants',restaurants);
app.use('/api/v1/auth',auth);
app.use('/api/v1/reservations',reservations);

const PORT=process.env.PORT || 5000;

const server=app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV,' mode on port ', PORT));

process.on('unhandledRejection',(err,promise)=>{
  console.log(`Error: ${err.message}`);
  server.close(()=>process.exit(1));
});