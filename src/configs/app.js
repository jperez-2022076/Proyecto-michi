import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import {config} from 'dotenv'


const app = express();
config();
const port = 3200;
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))


export const initServer = () => {
    app.listen(port);
    console.log(`Server HTTP running in port ${port}`);
  };

