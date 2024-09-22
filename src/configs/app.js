import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import {config} from 'dotenv'
import usuariorRouter from '../routes/UsuarioRouter.js'
import personarRouter from '../routes/PersonasRouter.js'
import vehiculoRouter from '../routes/VehiculoRouter.js'
import HistorialP from '../routes/HistorialPRouter.js'
import HistorialPV from '../routes/HistorialPVRouter.js'


const app = express();
config();
const port = process.env.PORT|| 3200;
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors({
  origin: '*', // o especifica el origen de tu frontend
}));
app.use(helmet())
app.use(morgan('dev'))

app.use('/usuario',usuariorRouter)
app.use('/persona',personarRouter)
app.use('/vehiculo',vehiculoRouter)
app.use('/historialP', HistorialP)
app.use('/historialPV',HistorialPV)


export const initServer = () => {
    app.listen(port);
    console.log(`Server HTTP running in port ${port}`);
  };

