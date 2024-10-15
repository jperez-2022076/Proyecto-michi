import Usuario from "../model/Usuario.js";
import { encrypt, checkPassword } from '../helpers/validator.js';
import { generateJwt } from '../helpers/jwt.js';
import { sortedUniq } from "pdf-lib";

// Crear un usuario nuevo
export const addUser = async (req, res) => {
  try {
    let data = req.body;
    data.password = await encrypt(data.password); // Encriptar contraseña
    let user = new Usuario(data);
    await user.save();
    return res.status(200).send({ message: 'Usuario creado con éxito' });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Error al crear usuario' });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    let id = req.params.id;
    let data = req.body;

    if(data.password == null){
      delete data.password;
    }else{
      if (data.password) {
        data.password = await encrypt(data.password);
      }
    }
    let updatedUser = await Usuario.findByIdAndUpdate(id, data, { new: true });
    if (!updatedUser) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }
    return res.status(200).send({ message: 'Usuario actualizado', updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Error al actualizar usuario' });
  }
};

// Listar todos los usuarios
export const listUsers = async (req, res) => {
  try {
    let users = await Usuario.find({ estado: true });
    return res.status(200).send({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Error al listar usuarios' });
  }
};

// Eliminar usuario (borrado lógico)
export const deleteUser = async (req, res) => {
  try {
    let { id } = req.params;
    let deletedUser = await Usuario.findByIdAndUpdate(id, { estado: false }, { new: true });
    if (!deletedUser) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }
    return res.status(200).send({ message: 'Usuario eliminado con éxito' });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Error al eliminar usuario' });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    let { id } = req.params;
    let user = await Usuario.findById(id);
    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }
    return res.status(200).send({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Error al obtener usuario' });
  }
};

// Crear usuarios por defecto (un admin y un guardián)
export const createDefaultUsers = async () => {
  try {
    // Crear usuario Admin si no existe
    let adminUser = await Usuario.findOne({ usuario: 'admin' });
    if (!adminUser) {
      let adminData = {
        usuario: 'admin',
        nombre: 'Administrador',
        password: await encrypt('admin123'),
        rol: 'ADMIN',
      };
      let admin = new Usuario(adminData);
      await admin.save();
      console.log('Usuario Admin creado con éxito');
    }

    // Crear usuario Guardián si no existe
    let guardianUser = await Usuario.findOne({ usuario: 'guardian' });
    if (!guardianUser) {
      let guardianData = {
        usuario: 'guardian',
        nombre: 'Guardián',
        password: await encrypt('guardian123'),
        rol: 'GUARDIAN',
      };
      let guardian = new Usuario(guardianData);
      await guardian.save();
      console.log('Usuario Guardián creado con éxito');
    }
  } catch (err) {
    console.error('Error al crear usuarios por defecto:', err);
  }
};

// Iniciar sesión
export const login = async (req, res) => {
  try {
    let { usuario, password } = req.body;
    // Buscar usuario por nombre de usuario
    let user = await Usuario.findOne({usuario: usuario });

    if (!user || user.estado === false) {
      return res.status(404).send({ message: 'Usuario no encontrado o inactivo' });
    }

    // Verificar la contraseña
    if (!(await checkPassword(password, user.password))) {
      return res.status(401).send({ message: 'Contraseña incorrecta' });
    }

    // Generar JWT
    let token = await generateJwt({ uid: user._id, rol: user.rol, usuario: user.usuario });

    return res.status(200).send({
      message: `Bienvenido ${user.usuario}`,
      user: {
        uid: user._id,
        nombre: user.nombre,
        rol: user.rol,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Error al iniciar sesión' });
  }
};
