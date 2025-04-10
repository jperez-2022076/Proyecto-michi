'use strict'

import PDFDocument from 'pdfkit';
import Vehiculo from "../model/Vehiculo.js";
import exceljs from 'exceljs';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { promisify } from 'util';
import QRCode from 'qrcode';
import Telefono from '../model/Telefono.js';


export const addVehiculo = async (req, res) => {
    try {
      const vehiculoData = req.body;
      const newVehiculo = new Vehiculo(vehiculoData);
      await newVehiculo.save();
      await Telefono.updateMany(
        {},
        {
          $push: {
            datos: {
              tipo: 'V',
              accion: 'A',
              vehiculo: newVehiculo._id,
            }
          }
        }
      );
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
      await Telefono.updateMany(
        {},
        {
          $push: {
            datos: {
              tipo: 'V',
              accion: 'U',
              vehiculo: updatedVehiculo._id,
            }
          }
        }
      );
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
      await Telefono.updateMany(
        {},
        {
          $push: {
            datos: {
              tipo: 'V',
              accion: 'D',
              vehiculo: vehiculo._id,
            }
          }
        }
      );
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




export const exportToExcel = async (req, res) => {
  try {
      const vehiculos = await Vehiculo.find({ estado: true });

      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Vehículos');
      
      // Configurar los encabezados
      worksheet.columns = [
  
          { header: 'Placa', key: 'placa', width: 15 },
          { header: 'Código', key: 'codigo', width: 15 },
          { header: 'Pagado', key: 'pagado', width: 10 },
          { header: 'Fecha', key: 'fecha', width: 10 },
   
      ];

      // Establecer estilo en los encabezados (negrita y centrado)
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Agregar las filas de datos a partir de la segunda fila
      vehiculos.forEach(vehiculo => {
          worksheet.addRow({
              placa: vehiculo.placa,
              codigo: vehiculo.codigo ? vehiculo.codigo : 'Sin código',
              pagado: vehiculo.pagado ? 'Sí' : 'No', 
              fecha: vehiculo.fecha ? moment(vehiculo.fecha).format('YYYY-MM-DD') : '' // Verificar si hay fecha, si no dejar en blanco
          });
      });

      // Ajustar automáticamente el ancho de las columnas
      worksheet.columns.forEach((column) => {
          let maxLength = column.header.length; // Iniciar con la longitud del encabezado
          column.eachCell({ includeEmpty: true }, (cell) => {
              const cellLength = cell.value ? cell.value.toString().length : 10;
              if (cellLength > maxLength) {
                  maxLength = cellLength;
              }
          });
          column.width = maxLength < 10 ? 10 : maxLength; // Asignar un mínimo de 10 si el contenido es pequeño
      });

      // Configurar las cabeceras para la descarga
      res.setHeader('Content-Disposition', 'attachment; filename=vehiculos.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Escribir el archivo y finalizar la respuesta
      await workbook.xlsx.write(res);
      res.end();
  } catch (err) {
      res.status(500).json({ message: 'Error al exportar a Excel', error: err.message });
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
      const imagePath = path.resolve('src/img/fondoPDF.png'); // Ruta absoluta
      doc.image(imagePath, 0, 0, { width: doc.page.width, height: doc.page.height });
    };

    // Función para dibujar los encabezados de la tabla
    const drawTableHeaders = () => {
      doc.font('Helvetica-Bold').fontSize(16).text('Placa', 50, 150);
      doc.text('Código', 150, 150);
      doc.text('Pagado', 300, 150);
      doc.text('Fecha de pago', 400, 150);
    };

    // Función para configurar una nueva página con el fondo y encabezados
    const setupNewPage = () => {
      doc.addPage();
      drawBackgroundImage();
      drawTableHeaders();
      doc.font('Helvetica').fontSize(15);
    };

    // Configurar la primera página
    drawBackgroundImage();
    doc.fontSize(20).text('Listado de Vehículos', { align: 'center', underline: true });
    doc.moveDown(2);
    drawTableHeaders();

    // Asegurarse de cambiar la fuente a normal después de los encabezados
    doc.font('Helvetica').fontSize(15);

    // Espaciado después del encabezado de la tabla
    const tableTop = 150;
    const itemMargin = 20;
    const maxRowsPerPage = 25;
    let rowsCount = 0;
    let positionY = tableTop + itemMargin;

    // Crear fila para cada vehículo
    vehiculos.forEach((vehiculo) => {
      const formattedDate = vehiculo.fecha ? vehiculo.fecha.toLocaleDateString() : 'N/A';

      // Limitar el ancho del texto para el código y hacer que se corte si es muy largo
      const codigoHeight = doc.heightOfString(vehiculo.codigo || 'Sin código', { width: 140 });
      const rowHeight = Math.max(codigoHeight, itemMargin); // Altura de la fila basada en el contenido

      // Dibujar los datos de la tabla con ajuste automático para el código
      doc.text(vehiculo.placa, 50, positionY);
      doc.text(vehiculo.codigo || 'Sin código', 150, positionY, { width: 140 }); // Limitar el ancho a 120 para que se corte
      doc.text(vehiculo.pagado ? 'Sí' : 'No', 300, positionY);
      doc.text(formattedDate, 400, positionY);

      positionY += rowHeight; // Ajustar la posición Y según la altura de la fila
      rowsCount++;

      // Si alcanzamos el máximo de filas, agregar una nueva página
      if (rowsCount >= maxRowsPerPage) {
        setupNewPage();
        positionY = tableTop + itemMargin;
        rowsCount = 0;
      }
    });

    // Finalizar el documento
    doc.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al exportar a PDF' });
  }
};


export const createPDFWithVehiculos = async (req, res) => {
  try {
      const vehiculos = await Vehiculo.find({ estado: true }); // Buscar todos los vehículos activos

      if (!vehiculos || vehiculos.length === 0) {
          return res.status(404).json({ message: 'No se encontraron vehículos activos' });
      }

      // Crear un nuevo documento PDF
      const doc = new PDFDocument({ size: 'LETTER', margin: 10 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=vehiculos_plantillas.pdf');
      doc.pipe(res); // Enviar el PDF al cliente

      const plantillaPath = path.resolve('src/img/plantilla.png'); // Ruta de la imagen de la plantilla
      const qrCodeToDataURL = promisify(QRCode.toDataURL);

      // Configuración para las plantillas en el PDF
      const numRows = 3; // Número de filas por página
      const numCols = 3; // Número de columnas por página (3 para ajustarlo)
      const plantillaWidth = 150; // Ancho de cada plantilla ajustado a 5.3 cm (150 puntos)
      const plantillaHeight = 240; // Altura de cada plantilla (8.5 cm en puntos PDF)
      const marginX = 15; // Margen horizontal reducido entre plantillas
      const marginY = 10; // Margen vertical entre plantillas
      const startX = 20; // Posición inicial en X (ajustado)
      const startY = 30; // Posición inicial en Y
      const borderThickness = 3; // Grosor del borde negro

      let currentX = startX;
      let currentY = startY;
      let count = 0;

      for (const vehiculo of vehiculos) {
          // Si se llenan las plantillas en la página, agregar una nueva página
          if (count > 0 && count % (numRows * numCols) === 0) {
              doc.addPage();
              currentX = startX;
              currentY = startY;
          }

          // Dibujar el rectángulo negro pegado a la imagen de la plantilla
          doc.lineWidth(borderThickness)
              .rect(currentX, currentY, plantillaWidth, plantillaHeight)
              .strokeColor('black')
              .stroke();

          // Colocar la imagen de fondo para la plantilla (sin dejar margen entre la imagen y el borde)
          doc.image(plantillaPath, currentX, currentY, { width: plantillaWidth, height: plantillaHeight });

          // Colocar la placa del vehículo en la parte superior (sobre la imagen de fondo)
          doc.fontSize(12).fillColor('black').text(vehiculo.placa, currentX + 10, currentY + 40, { width: plantillaWidth - 25, align: 'center' });

          // Generar el código QR con información del ID del vehículo
          const qrCodeDataURL = await qrCodeToDataURL(vehiculo._id.toString()); // Usando el ID del vehículo como dato en el QR

          // Convertir la URL en un buffer y luego agregarla al PDF en la parte inferior de la plantilla
          doc.image(qrCodeDataURL, currentX + (plantillaWidth / 2) - 30, currentY + plantillaHeight - 80, { width: 60, height: 60 });

          // Mover la posición de la siguiente plantilla en la página
          count++;
          if (count % numCols === 0) {
              currentX = startX;
              currentY += plantillaHeight + marginY; // Pasar a la siguiente fila
          } else {
              currentX += plantillaWidth + marginX; // Pasar a la siguiente columna
          }
      }

      // Finalizar el documento PDF
      doc.end();
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al crear el PDF', error: err.message });
  }
};

export const exportVehiculoToJson = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.find({ estado: true }).lean();
   
        if (!vehiculo.length) {
            return res.status(404).json({ message: 'No hay vehiculos registradas' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(vehiculo);

    } catch (err) {
        res.status(500).json({ message: 'Error al exportar JSON', error: err.message });
    }
};
