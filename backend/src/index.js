import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(cookieParser());
const port = process.env.PORT || 8000;
app.listen(port,() => {
    console.log(`Server is running on port ${port}...`);
});
