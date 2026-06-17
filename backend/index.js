import express from 'express';
import connectDB from './MongoDbConnection/mongodbconnection.js';
import authRoutes from './routes/authRoutes.js';
import uploadSongRoutes from './routes/uploadSongRoutes.js'
import streamsong from './routes/streamSong.js'
import  detectSong  from './routes/detectSong.js'
import updateSongs from './routes/getSongs.js'
import artistInfo from './routes/artistInfo.js'
import artistSSettings from './routes/artistSettings.js'
import albums from './routes/albums.js'
import logout from './routes/logout.js'
import listener from './routes/listeners.js'

import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'
import cookieParser from 'cookie-parser';



const app = express();
app.use(cookieParser());



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from public/songs directory
app.use(express.static('public'));
app.use('/songs', express.static(path.join(__dirname, 'public', 'songs')));
app.use('/profiles', express.static(path.join(__dirname, 'public', 'artistProfiles')));
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


//full api to get songs : http://localhost:5000/api/getSongs/artist/songs
app.use('/api/updateSongs',updateSongs)
app.use('/api/detection',detectSong)
app.use('api/stream',streamsong)


// albums

app.use('/api/albums',albums)   // create , get , update, delete albums


//artist specific endpoints

//artist data getpoint
app.use('/api/artist',artistInfo)  //for user kind without token



app.use('/api/settings',artistSSettings)




app.use('/api/logout',logout)

app.use('/api/listeners',listener)



app.listen(5000, () => {
  console.log('Server running on port 5000');
});


