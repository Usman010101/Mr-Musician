import express from 'express';
import connectDB from './MongoDbConnection/mongodbconnection.js';
import authRoutes from './routes/authRoutes.js';
import uploadSongRoutes from './routes/uploadSongRoutes.js'
import streamsong from './routes/streamSong.js'
import cors from 'cors'



const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',  // Your frontend's URL
  credentials: true,               // Allow cookies to be sent along with requests
}));
// Connect to MongoDB
connectDB();

// Routes and other middleware here
app.use('/api/auth',authRoutes)

//full api to upload song : http://localhost:5000/api/upload/song
app.use('/api/upload',uploadSongRoutes)

app.use('api/stream',streamsong)

app.listen(5000, () => {
  console.log('Server running on port 5000');
});


