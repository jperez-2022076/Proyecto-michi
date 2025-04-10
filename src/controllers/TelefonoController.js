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


export const getTelefonoById = async (req, res) => {
  try {
    const { id } = req.params;

    const telefono = await Telefono.findById(id)
    .populate('datos.persona')
    .populate('datos.vehiculo')
    .populate('datos.usuario');

    if (!telefono) {
      return res.status(404).json({ message: 'Teléfono no encontrado' });
    }

    res.status(200).json(telefono);
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar teléfono', error: err.message });
  }
};


export const eliminarDatoDeTelefono = async (req, res) => {
  try {
    const { idTelefono, idDato } = req.params;

    const telefono = await Telefono.findByIdAndUpdate(
      idTelefono,
      { $pull: { datos: { _id: idDato } } }, // elimina del array el que tenga ese _id
      { new: true }
    )
      .populate('datos.persona')
      .populate('datos.vehiculo')
      .populate('datos.usuario');

    if (!telefono) {
      return res.status(404).json({ message: 'Teléfono no encontrado' });
    }

    res.status(200).json({ message: 'Dato eliminado con éxito', telefono });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar dato', error: err.message });
  }
};
