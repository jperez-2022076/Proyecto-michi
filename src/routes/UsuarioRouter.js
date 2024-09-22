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

const api = Router();

// Crear un usuario nuevo
api.post('/addUser', addUser);

// Actualizar usuario por ID
api.put('/updateUser/:id', updateUser);

// Listar todos los usuarios
api.get('/listarUsuarios', listUsers);

// Eliminar usuario por ID (borrado lógico)
api.delete('/deleteUser/:id', deleteUser);

// Obtener usuario por ID
api.get('/getUserById/:id', getUserById);

// Iniciar sesión
api.post('/login', login);

// Crear usuarios por defecto (Admin y Guardián)
api.post('/createDefaultUsers', createDefaultUsers);

export default api;
