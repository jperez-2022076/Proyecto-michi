import { Router } from 'express';
import { 
  addVehiculo, 
  getVehiculos, 
  getVehiculoById, 
  updateVehiculo, 
  deleteVehiculo,
  exportToExcel,
  exportToPDF
} from '../controllers/VehiculosController.js';

const api = Router();

api.post('/agregar', addVehiculo); // Crear un vehículo
api.get('/lista', getVehiculos); // Obtener todos los vehículos
api.get('/buscar/:id', getVehiculoById); // Obtener un vehículo por ID
api.put('/actualizar/:id', updateVehiculo); // Actualizar un vehículo
api.delete('/eliminar/:id', deleteVehiculo); // Eliminar un vehículo
api.get('/exportar/excel', exportToExcel); // Exportar datos a Excel
api.get('/exportar/pdf', exportToPDF); // Exportar datos a PDF

export default api;
