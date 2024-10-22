import { Router } from 'express';
import { 
  addVehiculo, 
  getVehiculos, 
  getVehiculoById, 
  updateVehiculo, 
  deleteVehiculo,
  exportToExcel,
  exportToPDF,
  searchVehiculosByPlaca,
  searchVehiculoById,
  createPDFWithVehiculos
} from '../controllers/VehiculosController.js';
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js';


const api = Router();

api.post('/agregar',[validateJwt,isAdmin] , addVehiculo); // Crear un vehículo
api.get('/lista',[validateJwt,isAdmin] , getVehiculos); // Obtener todos los vehículos
api.put('/actualizar/:id',[validateJwt,isAdmin] , updateVehiculo); // Actualizar un vehículo
api.delete('/eliminar/:id',[validateJwt,isAdmin] , deleteVehiculo); // Eliminar un vehículo
api.post('/buscar',searchVehiculosByPlaca)
api.get('/buscarId/:id',searchVehiculoById)
api.get('/exportar/excel' , exportToExcel); // Exportar datos a Excel
api.get('/exportar/pdf' , exportToPDF); // Exportar datos a PDF
api.get('/plantilla',createPDFWithVehiculos)

export default api;
  

