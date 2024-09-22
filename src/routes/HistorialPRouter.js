import { Router } from "express";
import { addHistorialP, exportHistorialToPDFPaginated, exportHistorialToExcelPaginated, getHistorialPByFecha } from "../controllers/HistorialPController.js";



const api = Router();

api.post('/agregar', addHistorialP)
api.post('/lista', getHistorialPByFecha)
api.post('/exportar/pdf',exportHistorialToPDFPaginated)
api.post('/exportar/excel', exportHistorialToExcelPaginated)

export default  api;