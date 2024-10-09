'use strict'

import PDFDocument from 'pdfkit';
import Vehiculo from "../model/Vehiculo.js";
import exceljs from 'exceljs';
export const addVehiculo = async (req, res) => {
    try {
      const vehiculoData = req.body;
      const newVehiculo = new Vehiculo(vehiculoData);
      await newVehiculo.save();
      return res.status(200).json({ message: 'Vehículo creado con éxito', newVehiculo });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al crear vehículo' });
    }
  };
  
  export const getVehiculos = async (req, res) => {
    try {
      const vehiculos = await Vehiculo.find();
      return res.status(200).json(vehiculos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al obtener vehículos' });
    }
  };
  // Leer un vehículo por ID
export const getVehiculoById = async (req, res) => {
    try {
      const { id } = req.params;
      const vehiculo = await Vehiculo.findById(id);
      if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
      return res.status(200).json(vehiculo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al obtener vehículo' });
    }
  };
// Buscar un vehículo por su ID
export const searchVehiculoById = async (req, res) => {
  try {
      const { id } = req.params; // Obtener el ID de los parámetros de la URL
      
      // Buscar el vehículo por su ID en la base de datos
      const vehiculo = await Vehiculo.findById(id);
      
      // Si no encuentra el vehículo, retornar un error 404
      if (!vehiculo) {
          return res.status(404).json({ message: 'Vehículo no encontrado' });
      }

      // Si se encuentra, retornar el vehículo
      return res.status(200).json(vehiculo);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al buscar vehículo por ID', error: error.message });
  }
};


  export const updateVehiculo = async (req, res) => {
    try {
      const { id } = req.params;
      const vehiculoData = req.body;
      const updatedVehiculo = await Vehiculo.findByIdAndUpdate(id, vehiculoData, { new: true });
      if (!updatedVehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
      return res.status(200).json({ message: 'Vehículo actualizado con éxito', updatedVehiculo });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al actualizar vehículo' });
    }
  };
  export const deleteVehiculo = async (req, res) => {
    try {
      const vehiculo = await Vehiculo.findByIdAndUpdate(req.params.id, { estado: false }, { new: true });
      if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
      res.status(200).json({ message: 'Vehículo eliminado', vehiculo });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar vehículo', error: err.message });
    }
  };
  
  export const searchVehiculosByPlaca = async (req, res) => {
    try {
        const { placa } = req.body;

        // Normalizar la placa (eliminar tildes si hubiera y manejar mayúsculas/minúsculas)
        const normalizedPlaca = placa.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

        // Crear expresión regular insensible a mayúsculas/minúsculas
        const regex = new RegExp(normalizedPlaca, 'i');

        // Obtener todos los vehículos
        const vehiculos = await Vehiculo.find({});

        // Filtrar los vehículos que coincidan con la placa normalizada
        const filteredVehiculos = vehiculos.filter(vehiculo =>
            vehiculo.placa.normalize('NFD').replace(/[\u0300-\u036f]/g, "").match(regex)
        );

        res.status(200).json(filteredVehiculos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al buscar vehículos por placa', error: error.message });
    }
};




// Exportar a Excel
export const exportToExcel = async (req, res) => {
    try {
      const vehiculos = await Vehiculo.find();
      
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Vehículos');
      
      // Definir encabezados de la tabla
      worksheet.columns = [
        { header: 'ID', key: '_id', width: 25 },
        { header: 'Placa', key: 'placa', width: 15 },
        { header: 'Foto', key: 'fotoV', width: 20 },
        { header: 'Pagado', key: 'pagado', width: 10 },
        { header: 'Estado', key: 'estado', width: 10 },
      ];
      
      // Añadir filas con los datos
      vehiculos.forEach(vehiculo => {
        worksheet.addRow(vehiculo);
      });
  
      // Enviar archivo Excel
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=vehiculos.xlsx');
  
      return workbook.xlsx.write(res).then(() => {
        res.status(200).end();
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al exportar a Excel' });
    }
  };
  
  // Exportar a PDF
  export const exportToPDF = async (req, res) => {
    try {
      const vehiculos = await Vehiculo.find();
      const doc = new PDFDocument();
  
      // Enviar PDF como descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=vehiculos.pdf');
  
      doc.pipe(res);
  
      doc.fontSize(20).text('Listado de Vehículos', { align: 'center' });
  
      // Crear una tabla de los vehículos
      vehiculos.forEach((vehiculo, index) => {
        doc.fontSize(12).text(`\nVehículo #${index + 1}`);
        doc.text(`ID: ${vehiculo._id}`);
        doc.text(`Placa: ${vehiculo.placa}`);
        doc.text(`Foto: ${vehiculo.fotoV}`);
        doc.text(`Pagado: ${vehiculo.pagado}`);
        doc.text(`Estado: ${vehiculo.estado ? 'Activo' : 'Inactivo'}`);
      });
  
      doc.end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al exportar a PDF' });
    }
  };