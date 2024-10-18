'use strict';
import HistorialP from '../model/HistorialP.js';
import PDFDocument from 'pdfkit';
import exceljs from 'exceljs';
import moment from 'moment'; // Usaremos moment para facilitar el manejo de fechas
import path from 'path';

// Crear un nuevo historial con alternancia de entrada y salida
export const addHistorialP = async (req, res) => {
    try {
        const { persona, usuario, fecha, hora } = req.body; // Asegúrate de incluir fecha y hora

        // Buscar el último registro de historial de la persona
        const ultimoHistorial = await HistorialP.findOne({ persona })
            .sort({ fecha: -1, hora: -1 }); // Ordenar por la fecha y hora más recientes

        let nuevoEstado = 'E'; // Por defecto, el primer estado es 'E' (Entrada)

        // Si hay un historial previo, alternar entre 'E' y 'S'
        if (ultimoHistorial && ultimoHistorial.estado === 'E') {
            nuevoEstado = 'S'; // Cambia a 'S' si la última acción fue 'E'
        }

        // Crear un nuevo historial con la fecha, hora y estado actual
        const nuevoHistorial = new HistorialP({
            persona,
            usuario,
            estado: nuevoEstado, // Estado alternado ('E' o 'S')
            fecha, // Usa la fecha proporcionada
            hora // Usa la hora proporcionada
        });

        // Guardar el nuevo historial
        await nuevoHistorial.save();
        return res.status(201).json({ message: 'Historial creado con éxito', historial: nuevoHistorial });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear historial', error: error.message });
    }
};

// Obtener historial por persona
export const getHistorialByPersona = async (req, res) => {
    try {
        const { personaId } = req.params; // Suponiendo que el ID de la persona se pasa como parámetro

        // Buscar historial por persona
        const historial = await HistorialP.find({ persona: personaId })
            .populate('persona usuario');

        if (!historial.length) {
            return res.status(404).json({ message: 'No se encontraron registros para esta persona' });
        }

        return res.status(200).json(historial);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el historial', error: error.message });
    }
};



// Obtener historial entre fecha de inicio y fecha final
export const getHistorialPByFecha = async (req, res) => {
    try {
        const { fechaInicio, fechaFinal } = req.body;

        // Ajustar las fechas de inicio y fin
        const fechaInicioParsed = fechaInicio ? moment(fechaInicio).startOf('day').toDate() : moment().startOf('day').toDate();
        const fechaFinalParsed = fechaFinal ? moment(fechaFinal).endOf('day').toDate() : moment().endOf('day').toDate();

        // Filtrar por rango de fechas
        const historial = await HistorialP.find({
            fecha: {
                $gte: fechaInicioParsed,
                $lte: fechaFinalParsed
            }
        }).populate('persona usuario');

        if (!historial.length) return res.status(404).json({ message: 'No se encontraron registros en el rango de fechas especificado' });
        
        return res.status(200).json(historial);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el historial', error: error.message });
    }
};

const PAGE_SIZE = 300;
// Función para exportar historial a Excel con paginación
export const exportHistorialToExcelPaginated = async (req, res) => {
    try {
        const { fechaInicio, fechaFinal } = req.params;

        const fechaInicioParsed = fechaInicio ? new Date(fechaInicio) : moment().startOf('day').toDate();
        const fechaFinalParsed = fechaFinal ? new Date(fechaFinal) : moment().endOf('day').toDate();

        // Crear un archivo Excel vacío
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Historial');

        // Definir columnas
        worksheet.columns = [
            { header: 'ID', key: '_id', width: 25 },
            { header: 'Persona', key: 'persona', width: 25 },
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
            const historial = await HistorialP.find({
                fecha: {
                    $gte: fechaInicioParsed,
                    $lte: fechaFinalParsed
                }
            })
            .populate('persona usuario')
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

export const exportHistorialToPDFPaginated = async (req, res) => {
    try {
        const { fechaInicio, fechaFinal } = req.params;

        // Ajustar el rango de fechas
        const fechaInicioParsed = fechaInicio ? moment(fechaInicio, 'YYYY-MM-DD').startOf('day').toDate() : moment().startOf('day').toDate();
        const fechaFinalParsed = fechaFinal ? moment(fechaFinal, 'YYYY-MM-DD').endOf('day').toDate() : moment().endOf('day').toDate();

        // Obtener registros del historial
        const historial = await HistorialP.find({
            fecha: {
                $gte: fechaInicioParsed,
                $lte: fechaFinalParsed
            }
        }).populate('persona usuario'); // Asegurar que se obtienen los datos relacionados

        // Crear un documento PDF
        const doc = new PDFDocument({ size: 'A4' });

        // Enviar PDF como descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=historial.pdf');

        // Iniciar el PDF
        doc.pipe(res);

        // Función para dibujar la imagen de fondo
        const drawBackgroundImage = () => {
            const imagePath = path.resolve('src/img/fondoPDF.png'); // Ruta absoluta
            doc.image(imagePath, 0, 0, { width: doc.page.width, height: doc.page.height });
        };

        const drawTableHeaders = () => {
            const columnWidths = [100, 80, 90, 90, 120]; // Anchos de columna ajustados
            doc.font('Helvetica-Bold').fontSize(14);
            doc.text('Nombre', 40, 150, { width: columnWidths[0] });
            doc.text('DPI', 140, 150, { width: columnWidths[1] }); // Mantiene la alineación
            doc.text('Usuario', 240, 150, { width: columnWidths[2] }); // Mantiene la alineación
            doc.text('Movimiento', 340, 150, { width: columnWidths[3] }); // Mantiene la alineación
            doc.text('Fecha y Hora', 430, 150, { width: columnWidths[4] }); // Cambia a 400 para que esté alineado
        };

        // Función para configurar una nueva página con el fondo y encabezados
        const setupNewPage = () => {
            doc.addPage(); // Añadir una nueva página
            drawBackgroundImage(); // Dibujar la imagen de fondo
            drawTableHeaders(); // Dibujar los encabezados de la tabla
            doc.font('Helvetica').fontSize(12); // Restablecer la fuente normal para los datos
        };

        // Configurar la primera página
        drawBackgroundImage(); // Dibujar la imagen de fondo en la primera página
        doc.fontSize(20).text('Historial de Personas', { align: 'center', underline: true });
        doc.moveDown(2);
        drawTableHeaders();

        // Asegurarse de cambiar la fuente a normal después de los encabezados en la primera página
        doc.font('Helvetica').fontSize(12);

        // Espaciado después del encabezado de la tabla
        const tableTop = 150;
        const itemMargin = 20; // Espacio entre filas
        const maxRowsPerPage = 20; // Ajustamos a más registros por página
        let rowsCount = 0; // Contador de filas para manejar el salto de página
        let positionY = tableTop + itemMargin;

        historial.forEach((item) => {
            const nombreHeight = doc.heightOfString(item.persona.nombre, { width: 100 });
            const rowHeight = Math.max(nombreHeight, itemMargin);
        
            // Dibujar los datos de la tabla con nuevos anchos de columna
            const columnWidths = [100, 90, 90, 60, 120]; // Anchos de columna ajustados
            doc.text(item.persona.nombre, 40, positionY, { width: columnWidths[0] });
            doc.text(item.persona.DPI || 'N/A', 140, positionY, { width: columnWidths[1] }); // Mantiene la alineación
            doc.text(item.usuario.nombre, 240, positionY, { width: columnWidths[2] }); // Mantiene la alineación
            doc.text(item.estado === 'E' ? 'Entrada' : 'Salida', 340, positionY, { width: columnWidths[3] }); // Mantiene la alineación
            doc.text(moment(item.fecha).format('YYYY-MM-DD') + ' ' + item.hora, 430, positionY, { width: columnWidths[4] }); // Cambia a 400 para que esté alineado
        
            positionY += rowHeight;
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
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al exportar a PDF', error: err.message });
    }
};
