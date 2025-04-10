'use strict'

import { Router } from "express"
import { createTelefono, eliminarDatoDeTelefono, getTelefonoById } from "../controllers/TelefonoController.js";

const api = Router();

api.post('/agregar' ,createTelefono)
api.get('/listar/:id', getTelefonoById); 
api.delete('/eliminar/:idTelefono/:idDato', eliminarDatoDeTelefono);


export default api;