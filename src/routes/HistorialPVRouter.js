'use strict'

import { Router } from "express"
import { addHistorialPV, exportHistorialPVToExcelPaginated, exportHistorialPVToPDFPaginated, getHistorialPVByFecha, getHistorialPVByVehiculo } from "../controllers/HistorialPVControler.js"


const app =Router()

app.post('/agregar',addHistorialPV)
app.post('/listar', getHistorialPVByFecha)
app.get('/exportar/excel/:fechaInicio/:fechaFinal', exportHistorialPVToExcelPaginated)
app.get('/exportar/pdf/:fechaInicio/:fechaFinall',exportHistorialPVToPDFPaginated)
app.get('/buscarV/:vehiculo',getHistorialPVByVehiculo)

export default app