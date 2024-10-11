'use strict';
import historalPV  from '../model/HistorialPV.js' // Ajusta la ruta si es necesario
import moment from 'moment';
import PDFDocument from 'pdfkit';
import exceljs from 'exceljs';

// Crear un nuevo historial de vehículo
export const addHistorialPV = async (req, res) => {
    try {
        const { persona, vehiculo, usuario, fecha, hora,DPI,nombre,placa } = req.body; // Asegúrate de incluir fecha y hora

        // Buscar el último registro de historial del vehículo
        const ultimoHistorial = await historalPV.findOne({ vehiculo })
            .sort({ fecha: -1, hora: -1 }); // Ordenar por la fecha y hora más recientes

        let nuevoEstado = 'E'; // Por defecto, el primer estado es 'E' (Entrada)

        // Si hay un historial previo, alternar entre 'E' y 'S'
        if (ultimoHistorial && ultimoHistorial.estado === 'E') {
            nuevoEstado = 'S'; // Cambia a 'S' si la última acción fue 'E'
        }

        // Crear un nuevo historial con la fecha, hora y estado actual
        const nuevoHistorial = new historalPV({
            persona,
            vehiculo,
            nombre,
            DPI,
            placa,
            usuario,
            estado: nuevoEstado, // Estado alternado ('E' o 'S')
            fecha, // Usa la fecha proporcionada o la actual
            hora // Usa la hora proporcionada o la actual
        });

        // Guardar el nuevo historial
        await nuevoHistorial.save();
        return res.status(201).json({ message: 'Historial creado con éxito', historial: nuevoHistorial });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear historial', error: error.message });
    }
};
// Obtener historial entre fecha de inicio y fecha final
export const getHistorialPVByFecha = async (req, res) => {
    try {
        const { fechaInicio, fechaFinal } = req.body;

        // Ajustar las fechas de inicio y fin
        const fechaInicioParsed = fechaInicio ? moment(fechaInicio).startOf('day').toDate() : moment().startOf('day').toDate();
        const fechaFinalParsed = fechaFinal ? moment(fechaFinal).endOf('day').toDate() : moment().endOf('day').toDate();

        // Filtrar por rango de fechas
        const historial = await historalPV.find({
            fecha: {
                $gte: fechaInicioParsed,
                $lte: fechaFinalParsed
            }
        }).populate('persona vehiculo usuario');

        if (!historial.length) return res.status(404).json({ message: 'No se encontraron registros en el rango de fechas especificado' });
        
        return res.status(200).json(historial);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el historial', error: error.message });
    }
};


const PAGE_SIZE = 300;

// Función para exportar historial a Excel con paginación
export const exportHistorialPVToExcelPaginated = async (req, res) => {
    try {
        const { fechaInicio, fechaFinal } = req.params;

        const fechaInicioParsed = fechaInicio ? moment(fechaInicio).startOf('day').toDate() : moment().startOf('day').toDate();
        const fechaFinalParsed = fechaFinal ? moment(fechaFinal).endOf('day').toDate() : moment().endOf('day').toDate();

        // Crear un archivo Excel vacío
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Historial');

        // Definir columnas
        worksheet.columns = [
            { header: 'ID', key: '_id', width: 25 },
            { header: 'Persona', key: 'persona', width: 25 },
            { header: 'Vehículo', key: 'vehiculo', width: 25 },
            { header: 'Usuario', key: 'usuario', width: 25 },
            { header: 'Estado', key: 'estado', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 20 },
            { header: 'Hora', key: 'hora', width: 10 }
        ];

        // Variable para controlar el paginado
        let currentPage = 0;
        let hasMoreRecords = true;

        // Mientras haya registros
        while (hasMoreRecords) {
            const skip = currentPage * PAGE_SIZE;

            // Obtener registros paginados
            const historial = await historalPV.find({
                fecha: {
                    $gte: fechaInicioParsed,
                    $lte: fechaFinalParsed
                }
            })
            .populate('persona vehiculo usuario')
            .limit(PAGE_SIZE)
            .skip(skip);

            if (!historial.length) {
                hasMoreRecords = false;
                break;
            }

            // Agregar cada registro al Excel
            historial.forEach(item => {
                worksheet.addRow({
                    _id: item._id,
                    persona: item.persona.nombre,
                    vehiculo: item.vehiculo.modelo,
                    usuario: item.usuario.nombre,
                    estado: item.estado,
                    fecha: moment(item.fecha).format('YYYY-MM-DD'),
                    hora: item.hora
                });
            });

            // Pasar a la siguiente página
            currentPage++;
        }

        // Enviar archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=historial_paginated.xlsx');

        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al exportar a Excel', error: error.message });
    }
};



// Función para exportar historial a PDF con paginación
export const exportHistorialPVToPDFPaginated = async (req, res) => {
    try {
        const { fechaInicio, fechaFinal } = req.params;

        // Ajustar el rango de fechas
        const fechaInicioParsed = fechaInicio ? moment(fechaInicio).startOf('day').toDate() : moment().startOf('day').toDate();
        const fechaFinalParsed = fechaFinal ? moment(fechaFinal).endOf('day').toDate() : moment().endOf('day').toDate();

        // Crear un documento PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        // Enviar PDF como descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=historial_paginated.pdf');

        // Conectar el documento a la respuesta
        doc.pipe(res);

        // Definir un estilo inicial para el documento
        doc.fontSize(20).text('Historial de Vehículos', { align: 'center' }).moveDown(1);

        // Variables de control de paginación
        let currentPage = 0;
        let hasMoreRecords = true;
        let recordIndex = 1;

        // Mientras haya registros
        while (hasMoreRecords) {
            const skip = currentPage * PAGE_SIZE;

            // Obtener registros paginados
            const historial = await historalPV.find({
                fecha: {
                    $gte: fechaInicioParsed,
                    $lte: fechaFinalParsed
                }
            })
            .populate('persona vehiculo usuario')
            .limit(PAGE_SIZE)
            .skip(skip);

            if (!historial.length) {
                hasMoreRecords = false;
                break;
            }

            // Añadir los registros al PDF
            historial.forEach((item) => {
                doc.fontSize(12).text(`\nHistorial #${recordIndex}`);
                doc.text(`ID: ${item._id}`);
                doc.text(`Persona: ${item.persona.nombre}`);
                doc.text(`Vehículo: ${item.vehiculo.placa}`);
                doc.text(`Usuario: ${item.usuario.nombre}`);
                doc.text(`Estado: ${item.estado}`);
                doc.text(`Fecha: ${moment(item.fecha).format('YYYY-MM-DD')}`);
                doc.text(`Hora: ${item.hora}`);
                recordIndex++;
            });

            // Verificar si estamos al final de la página
            if (recordIndex % PAGE_SIZE === 0) {
                doc.addPage(); // Añadir una nueva página
                doc.fontSize(20).text('Historial de Vehículos', { align: 'center' }).moveDown(1);
            }

            // Pasar a la siguiente página de datos
            currentPage++;
        }

        // Terminar el documento PDF
        doc.end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al exportar a PDF', error: error.message });
    }
};
