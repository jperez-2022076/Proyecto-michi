'use strict'

import { Router } from "express"
import { createPersona, deletePersona, exportPersonasToExcel, exportPersonasToPDF, listPersonas, searchPersonaById, searchPersonasByName, updatePersona } from "../controllers/PersonaController.js";
import { isAdmin, validateJwt } from "../middlewares/validate-jwt.js";

const api = Router();

api.post('/agregar',[validateJwt,isAdmin] ,createPersona)
api.get('/lista',[validateJwt,isAdmin] ,listPersonas)
api.put('/actualizar/:id',[validateJwt,isAdmin] ,updatePersona)
api.delete('/eliminar/:id',[validateJwt,isAdmin] ,deletePersona)
api.post('/buscar',searchPersonasByName)
api.get('/buscarid/:id',searchPersonaById)
api.get('/exportar/excel', exportPersonasToExcel);
api.get('/exportar/pdf' , exportPersonasToPDF);
export default api;