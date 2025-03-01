'use strict';
import historalPV  from '../model/HistorialPV.js' // Ajusta la ruta si es necesario
import moment from 'moment';
import PDFDocument from 'pdfkit';
import exceljs from 'exceljs';
import path from 'path';

// Crear un nuevo historial de vehículo
export const addHistorialPV = async (req, res) => {
    try {
        const { persona, vehiculo, usuario, fecha, hora,DPI,nombre,placa,cliente } = req.body; // Asegúrate de incluir fecha y hora

        // Buscar el último registro de historial del vehículo
        const ultimoHistorial = await historalPV.findOne({ vehiculo })
            .sort({ fecha: -1, hora: -1 }); // Ordenar por la fecha y hora más recientes

        let nuevoEstado = 'S'; // Por defecto, el primer estado es 'E' (Entrada)

        // Si hay un historial previo, alternar entre 'E' y 'S'
        if (ultimoHistorial && ultimoHistorial.estado === 'S') {
            nuevoEstado = 'E'; // Cambia a 'S' si la última acción fue 'E'
        }

        // Crear un nuevo historial con la fecha, hora y estado actual
        const nuevoHistorial = new historalPV({
            persona,
            vehiculo,
            nombre,
            DPI,
            placa,
            cliente,
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


// Obtener historial por vehículo
export const getHistorialPVByVehiculo = async (req, res) => {
    try {
        const { vehiculo } = req.params; // Obtener el vehículo de los parámetros de la solicitud

        // Buscar el historial filtrando por el vehículo proporcionado
        const historial = await historalPV.find({ vehiculo })
            .populate('persona vehiculo usuario'); // Asegúrate de que los campos estén correctamente poblados

        if (!historial.length) {
            return res.status(404).json({ message: 'No se encontraron registros para el vehículo especificado' });
        }
        
        return res.status(200).json(historial);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el historial por vehículo', error: error.message });
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


export const exportHistorialPVToExcelPaginated = async (req, res) => {
    try {
        const { fechaInicio, fechaFinal } = req.params;

        // Parsear las fechas
        const fechaInicioParsed = fechaInicio ? moment(fechaInicio, 'YYYY-MM-DD').startOf('day').toDate() : moment().startOf('day').toDate();
        const fechaFinalParsed = fechaFinal ? moment(fechaFinal, 'YYYY-MM-DD').endOf('day').toDate() : moment().endOf('day').toDate();

        // Crear un archivo Excel vacío
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Historial');

        // Definir columnas
        worksheet.columns = [
            { header: 'Persona', key: 'persona', width: 25 },
            { header: 'DPI', key: 'DPI', width: 25 },
            { header: 'Placa', key: 'vehiculo', width: 25 },
            { header: 'Código', key: 'codigo', width: 25 },
            { header: 'Guardian', key: 'usuario', width: 25 },
            { header: 'Estado', key: 'estado', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 20 },
            { header: 'Hora', key: 'hora', width: 10 }
        ];

        // Establecer estilo en los encabezados (negrita y centrado)
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Variable para controlar la paginación
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
                    persona: item.persona ? item.persona.nombre : "Invitado: "+item.nombre, 
                    DPI: item.persona ? item.persona.DPI :  item.DPI,  // Validar si hay persona
                    vehiculo: item.vehiculo ? item.vehiculo.placa : item.placa, 
                    vehiculo: item.vehiculo.codigo ? item.vehiculo.codigo : "Sin Código",// Validar si hay vehículo
                    usuario: item.usuario ? item.usuario.nombre : 'Desconocido',  // Validar si hay usuario
                    estado: item.estado === 'S' ? 'Salió' : item.estado === 'E' ? 'Entró' : 'Desconocido', // Validar estado
                    fecha: item.fecha ? moment(item.fecha).format('YYYY-MM-DD') : '', // Validar fecha
                    hora: item.hora || '' 
                });
            });
            currentPage++;
        }

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

        // Configurar las cabeceras para la descarga del archivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=historial_vehiculo.xlsx');

        // Escribir el archivo y finalizar la respuesta
        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al exportar a Excel', error: error.message });
    }
};
export const exportHistorialPVToPDFPaginated = async (req, res) => {
    try {
        const { fechaInicio, fechaFinal } = req.params;

        // Ajustar el rango de fechas
        const fechaInicioParsed = fechaInicio ? moment(fechaInicio, 'YYYY-MM-DD').startOf('day').toDate() : moment().startOf('day').toDate();
        const fechaFinalParsed = fechaFinal ? moment(fechaFinal, 'YYYY-MM-DD').endOf('day').toDate() : moment().endOf('day').toDate();

        // Obtener registros del historial
        const historial = await historalPV.find({
            fecha: {
                $gte: fechaInicioParsed,
                $lte: fechaFinalParsed
            }
        }).populate('persona vehiculo usuario');

        // Crear un documento PDF
        const doc = new PDFDocument({ size: 'A4' });

        // Enviar PDF como descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=historial_paginated.pdf');

        // Iniciar el PDF
        doc.pipe(res);

        // Función para dibujar la imagen de fondo
        const drawBackgroundImage = () => {
            const imagePath = path.resolve('src/img/fondoPDF.png'); // Ruta absoluta de la imagen de fondo
            doc.image(imagePath, 0, 0, { width: doc.page.width, height: doc.page.height });
        };

        // Función para dibujar los encabezados de la tabla
        const drawTableHeaders = () => {
            const columnWidths = [90, 90, 100,100, 80, 120]; // Anchos ajustados de las columnas
            doc.font('Helvetica-Bold').fontSize(14);
            doc.text('Nombre', 20, 150, { width: columnWidths[0], ellipsis: true });
            doc.text('DPI', 110, 150, { width: columnWidths[1], ellipsis: true });
            doc.text('Placa', 200, 150, { width: columnWidths[2], ellipsis: true });
            doc.text('Código', 275, 150, { width: columnWidths[3], ellipsis: true });
            doc.text('Guardian', 360, 150, { width: columnWidths[4], ellipsis: true });
            doc.text('Fecha y Hora', 440, 150, { width: columnWidths[5], ellipsis: true });
        };

        // Función para configurar una nueva página con el fondo y encabezados
        const setupNewPage = () => {
            doc.addPage();
            drawBackgroundImage(); // Dibujar la imagen de fondo
            drawTableHeaders(); // Dibujar los encabezados de la tabla
            doc.font('Helvetica').fontSize(12); // Restablecer la fuente normal para los datos
        };

        // Configurar la primera página
        drawBackgroundImage(); // Dibujar la imagen de fondo en la primera página
        doc.fontSize(20).text('Historial de Vehículos', { align: 'center', underline: true });
        doc.moveDown(2);
        drawTableHeaders();

        // Asegurarse de cambiar la fuente a normal después de los encabezados en la primera página
        doc.font('Helvetica').fontSize(12);

        // Espaciado después del encabezado de la tabla
        const tableTop = 150;
        const itemMargin = 20; // Espacio entre filas
        const maxRowsPerPage = 14; // Registros por página
        let rowsCount = 0; // Contador de filas para manejar el salto de página
        let positionY = tableTop + itemMargin;

        // Variables de paginación
        let currentPage = 0;
        let hasMoreRecords = true;
        const PAGE_SIZE = 20;

        while (hasMoreRecords) {
            const skip = currentPage * PAGE_SIZE;

            // Obtener registros paginados
            const paginatedHistorial = await historalPV.find({
                fecha: {
                    $gte: fechaInicioParsed,
                    $lte: fechaFinalParsed
                }
            })
            .populate('persona vehiculo usuario')
            .limit(PAGE_SIZE)
            .skip(skip);

            if (!paginatedHistorial.length) {
                hasMoreRecords = false;
                break;
            }

            paginatedHistorial.forEach((item) => {
                const columnWidths = [90, 100,100, 85, 90, 120]; // Anchos ajustados de las columnas
                const nombre = item.persona?.nombre ||"Invitado: "+ item.nombre;
                const dpi = item.persona?.DPI || item.DPI;
                const vehiculo = item.vehiculo?.placa || item.placa;
                const codigo = item.vehiculo?.codigo || "Sin código";
                const guardian = item.usuario?.nombre || 'N/A';
                const fechaHora = `${moment(item.fecha).format('YYYY-MM-DD')} ${item.hora || 'N/A'}`;

                // Ajuste de texto para cortar si es muy largo
                const nombreHeight = doc.heightOfString(nombre, { width: columnWidths[0] });
                const guardianHeight = doc.heightOfString(guardian, { width: columnWidths[4] });
                const codigonHeight = doc.heightOfString(codigo, { width: columnWidths[3] });
                const rowHeight = Math.max(nombreHeight, guardianHeight,codigonHeight, itemMargin);

                doc.text(nombre, 20, positionY, { width: columnWidths[0], ellipsis: true });
                doc.text(dpi, 110, positionY, { width: columnWidths[1], ellipsis: true });
                doc.text(vehiculo, 200, positionY, { width: columnWidths[2], ellipsis: true });
                doc.text(codigo, 275, positionY, { width: columnWidths[3], ellipsis: true });
                doc.text(guardian, 360, positionY, { width: columnWidths[4], ellipsis: true });
                doc.text(fechaHora, 440, positionY, { width: columnWidths[5], ellipsis: true });

                positionY += rowHeight;
                rowsCount++;

                if (rowsCount >= maxRowsPerPage) {
                    setupNewPage();
                    positionY = tableTop + itemMargin;
                    rowsCount = 0;
                }
            });

            currentPage++;
        }

        // Finalizar el documento
        doc.end();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Error al exportar a PDF', error: error.message });
        }
    }
};
