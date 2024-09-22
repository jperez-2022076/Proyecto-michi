'use strict'

import { Router } from "express"
import { createPersona, deletePersona, exportPersonasToExcel, exportPersonasToPDF, listPersonas, updatePersona } from "../controllers/PersonaController.js";

const api = Router();

api.post('/agregar',createPersona)
api.get('/lista',listPersonas)
api.put('/actualizar/:id',updatePersona)
api.delete('/eliminar/:id',deletePersona)
api.get('/exportar/excel', exportPersonasToExcel);
api.get('/exportar/pdf', exportPersonasToPDF);
export default api;