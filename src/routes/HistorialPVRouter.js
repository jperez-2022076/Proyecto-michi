'use strict'

import { Router } from "express"
import { addHistorialPV, exportHistorialPVToExcelPaginated, exportHistorialPVToPDFPaginated, getHistorialPVByFecha } from "../controllers/HistorialPVControler.js"


const app =Router()

app.post('/agregar',addHistorialPV)
app.post('/listar', getHistorialPVByFecha)
app.post('/exportar/excel', exportHistorialPVToExcelPaginated)
app.post('/exportar/pdf',exportHistorialPVToPDFPaginated)

export default app