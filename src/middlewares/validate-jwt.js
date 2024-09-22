import jwt from "jsonwebtoken";
import Usuario from "../model/Usuario.js";


export const validateJwt = async (req, res, next) => {
    try {
      let secretKey = process.env.SECRET_KEY;
      let { token } = req.headers;
  
      // Verificar si el token fue proporcionado
      if (!token) {
        return res.status(401).send({ message: 'No estás autorizado' });
      }
  
      // Verificar el token y extraer el UID (identificador de usuario)
      let { uid } = jwt.verify(token, secretKey);
  
      // Buscar el usuario en la base de datos utilizando el UID
      let user = await Usuario.findOne({ _id: uid });
      if (!user) {
        return res
          .status(404)
          .send({ message: 'Usuario no encontrado - sin autorización' });
      }
  
      // Añadir el usuario al objeto de la solicitud para usarlo en los siguientes middlewares
      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).send({ message: 'Token inválido o expirado' });
    }
  };
  
  export const isAdmin = async (req, res, next) => {
    try {
      // Obtener el rol, nombre y usuario del objeto de solicitud (req.user)
      let { rol, nombre, usuario } = req.user;
  
      // Verificar si el rol es ADMIN
      if (!rol || rol !== 'ADMIN') {
        return res.status(401).send({ message: `No tienes acceso, ${usuario}` });
      }
  
      // Si el rol es ADMIN, proceder al siguiente middleware
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).send({ message: 'Rol sin autorización' });
    }
  };