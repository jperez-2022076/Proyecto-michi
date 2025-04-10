'use strict'

import { Router } from "express"
import { createTelefono } from "../controllers/TelefonoController.js";

const api = Router();

api.post('/agregar' ,createTelefono)

export default api;