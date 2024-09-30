'use strict';

import { Router } from 'express';
import {
  addUser,
  updateUser,
  listUsers,
  deleteUser,
  getUserById,
  createDefaultUsers,
  login,
} from '../controllers/UsuarioController.js';
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js';

const api = Router();

// Crear un usuario nuevo
api.post('/addUser',[validateJwt,isAdmin] ,addUser);

// Actualizar usuario por ID
api.put('/updateUser/:id',[validateJwt,isAdmin] , updateUser);

// Listar todos los usuarios
api.get('/listarUsuarios',[validateJwt,isAdmin] , listUsers);

// Eliminar usuario por ID (borrado lógico)
api.delete('/deleteUser/:id',[validateJwt,isAdmin] , deleteUser);

// Obtener usuario por ID
api.get('/getUserById/:id',[validateJwt,isAdmin] , getUserById);

// Iniciar sesión
api.post('/login', login);

// Crear usuarios por defecto (Admin y Guardián)
api.post('/createDefaultUsers', createDefaultUsers);

export default api;
