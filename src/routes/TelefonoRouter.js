'use strict'

import { Router } from "express"
import { createTelefono, getTelefonoById } from "../controllers/TelefonoController.js";

const api = Router();

api.post('/agregar' ,createTelefono)
api.get('/listar/:id', getTelefonoById); 

export default api;