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
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js';

const api = Router();

api.post('/agregar',[validateJwt,isAdmin] , addVehiculo); // Crear un vehículo
api.get('/lista',[validateJwt,isAdmin] , getVehiculos); // Obtener todos los vehículos
api.get('/buscar/:id',[validateJwt,isAdmin] , getVehiculoById); // Obtener un vehículo por ID
api.put('/actualizar/:id',[validateJwt,isAdmin] , updateVehiculo); // Actualizar un vehículo
api.delete('/eliminar/:id',[validateJwt,isAdmin] , deleteVehiculo); // Eliminar un vehículo
api.get('/exportar/excel' , exportToExcel); // Exportar datos a Excel
api.get('/exportar/pdf' , exportToPDF); // Exportar datos a PDF

export default api;
