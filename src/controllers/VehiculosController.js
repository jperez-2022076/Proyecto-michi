'use strict'

import PDFDocument from 'pdfkit';
import Vehiculo from "../model/Vehiculo.js";
import exceljs from 'exceljs';
import fs from 'fs';
import path from 'path';


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
      const vehiculos = await Vehiculo.find({ estado: true });
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
      const vehiculo = await Vehiculo.findOne({ _id: id, estado: true });
      
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
        const vehiculos = await Vehiculo.find({estado: true });

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
  
  export const exportToPDF = async (req, res) => {
    try {
      const vehiculos = await Vehiculo.find({ estado: true });
      const doc = new PDFDocument({ size: 'A4' });
  
      // Enviar PDF como descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=vehiculos.pdf');
  
      // Iniciar el PDF
      doc.pipe(res);
  
      // Función para dibujar la imagen de fondo
      const drawBackgroundImage = () => {
        const imagePath = path.join('src/img', 'fondoPDF.png');
        doc.image(imagePath, 0, 0, { width: doc.page.width, height: doc.page.height });
      };
  
      // Función para dibujar los encabezados de la tabla
      const drawTableHeaders = () => {
        doc.font('Helvetica-Bold').fontSize(16).text('Placa', 50, 150); // Tamaño 16 para encabezados
        doc.text('Pagado', 200, 150);
        doc.text('Fecha de pago', 400, 150);
      };
  
      // Función para configurar una nueva página con el fondo y encabezados
      const setupNewPage = () => {
        doc.addPage(); // Añadir una nueva página
        drawBackgroundImage(); // Dibujar la imagen de fondo
        drawTableHeaders(); // Dibujar los encabezados de la tabla
        doc.font('Helvetica').fontSize(15); // Restablecer la fuente normal para los datos
      };
  
      // Configurar la primera página
      drawBackgroundImage(); // Dibujar la imagen de fondo en la primera página
      doc.fontSize(20).text('Listado de Vehículos', { align: 'center', underline: true });
      doc.moveDown(2);
      drawTableHeaders();
  
      // Asegurarse de cambiar la fuente a normal después de los encabezados en la primera página
      doc.font('Helvetica').fontSize(15);
  
      // Espaciado después del encabezado de la tabla
      const tableTop = 150;
      const itemMargin = 20;
      const maxRowsPerPage = 25;  // Máximo de registros por página
      let rowsCount = 0;  // Contador de filas para manejar el salto de página
      let positionY = tableTop + itemMargin;
  
      // Crear fila para cada vehículo
      vehiculos.forEach((vehiculo, index) => {
        const formattedDate = vehiculo.fecha ? vehiculo.fecha.toLocaleDateString() : 'N/A';
  
        // Dibujar datos de la tabla
        doc.text(vehiculo.placa, 50, positionY);
        doc.text(vehiculo.pagado ? 'Sí' : 'No', 200, positionY);
        doc.text(formattedDate, 400, positionY);
  
        positionY += itemMargin;
        rowsCount++;
  
        // Si alcanzamos el máximo de filas, agregar una nueva página
        if (rowsCount >= maxRowsPerPage) {
          setupNewPage(); // Configurar la nueva página
          positionY = tableTop + itemMargin;  // Reiniciar la posición en la nueva página
          rowsCount = 0;  // Reiniciar el contador de filas
        }
      });
  
      // Finalizar el documento
      doc.end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al exportar a PDF' });
    }
  };
  