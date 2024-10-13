import { Router } from "express";
import { addHistorialP, exportHistorialToPDFPaginated, exportHistorialToExcelPaginated, getHistorialPByFecha, getHistorialByPersona } from "../controllers/HistorialPController.js";



const api = Router();

api.post('/agregar', addHistorialP)
api.post('/lista', getHistorialPByFecha)
api.get('/exportar/pdf/:fechaInicio/:fechaFinall',exportHistorialToPDFPaginated)
api.get('/exportar/excel/:fechaInicio/:fechaFinal', exportHistorialToExcelPaginated)
api.get('/buscarP/:personaId',getHistorialByPersona)

export default  api;