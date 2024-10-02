import { Router } from "express";
import { addHistorialP, exportHistorialToPDFPaginated, exportHistorialToExcelPaginated, getHistorialPByFecha } from "../controllers/HistorialPController.js";



const api = Router();

api.post('/agregar', addHistorialP)
api.post('/lista', getHistorialPByFecha)
api.get('/exportar/pdf/:fechaInicio/:fechaFinall',exportHistorialToPDFPaginated)
api.get('/exportar/excel/:fechaInicio/:fechaFinal', exportHistorialToExcelPaginated)

export default  api;