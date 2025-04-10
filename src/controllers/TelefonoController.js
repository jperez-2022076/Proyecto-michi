import Telefono from '../model/Telefono.js';

export const createTelefono = async (req, res) => {
  try {
    const telefono = new Telefono(req.body);
    await telefono.save();
    res.status(201).json({ message: 'Teléfono creado con éxito', telefono });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear teléfono', error: err.message });
  }
};
