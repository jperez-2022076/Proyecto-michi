
import Persona from '../model/Personas.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import stream from 'stream';
import path from 'path';

export const createPersona = async (req, res) => {
    try {
        const persona = new Persona(req.body);
        await persona.save();
        res.status(201).json({ message: 'Persona creada con éxito', persona });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear persona', error: err.message });
    }
};

export const listPersonas = async (req, res) => {
    try {
        const personas = await Persona.find({ estado: true }); // Solo personas con estado true
        res.status(200).json(personas);
    } catch (err) {
        res.status(500).json({ message: 'Error al listar personas', error: err.message });
    }
};


export const updatePersona = async (req, res) => {
    try {
        const persona = await Persona.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!persona) return res.status(404).json({ message: 'Persona no encontrada' });
        res.status(200).json({ message: 'Persona actualizada', persona });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar persona', error: err.message });
    }
};
export const deletePersona = async (req, res) => {
    try {
        const persona = await Persona.findByIdAndUpdate(req.params.id, { estado: false }, { new: true });
        if (!persona) return res.status(404).json({ message: 'Persona no encontrada' });
        res.status(200).json({ message: 'Persona eliminada', persona });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar persona', error: err.message });
    }
};



export const searchPersonasByName = async (req, res) => {
    try {
        const { nombre } = req.body;

        // Normalizar el nombre del usuario (eliminar tildes)
        const normalizedNombre = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

        // Crear expresión regular insensible a mayúsculas/minúsculas
        const regex = new RegExp(normalizedNombre, 'i');

        // Obtener todas las personas
        const personas = await Persona.find({ estado: true });

        // Filtrar personas que coincidan con el nombre normalizado
        const filteredPersonas = personas.filter(persona =>
            persona.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, "").match(regex)
        );

        res.status(200).json(filteredPersonas);
    } catch (err) {
        res.status(500).json({ message: 'Error al buscar personas por nombre', error: err.message });
    }
};

export const searchPersonaById = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID de los parámetros de la URL

        // Buscar la persona por su ID y estado true
        const persona = await Persona.findOne({ _id: id, estado: true });

        // Si no encuentra la persona, devolver un error 404
        if (!persona) {
            return res.status(404).json({ message: 'Persona no encontrada o inactiva' });
        }

        // Si encuentra la persona, devolver la información
        res.status(200).json(persona);
    } catch (err) {
        res.status(500).json({ message: 'Error al buscar persona por ID', error: err.message });
    }
};

export const exportPersonasToExcel = async (req, res) => {
    try {
        const personas = await Persona.find({  estado: true });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Personas');
        
       
        
        // Configurar los encabezados en la segunda fila
        worksheet.columns = [
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 20 },
            { header: 'DPI', key: 'DPI', width: 20 },
        ];

        // Establecer estilo en los encabezados (negrita y centrado)
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Agregar las filas de datos a partir de la tercera fila
        personas.forEach(persona => {
            worksheet.addRow({
                nombre: persona.nombre,
                telefono: persona.telefono ?persona.telefono : '',  // Asegurar que el teléfono sea tratado como texto
                DPI: persona.DPI ? persona.DPI.toString() : 'sin dpi'  // Asegurar que el DPI sea tratado como texto
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
        res.setHeader('Content-Disposition', 'attachment; filename=personas.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Escribir el archivo y finalizar la respuesta
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: 'Error al exportar a Excel', error: err.message });
    }
};


export const exportPersonasToPDF = async (req, res) => {
    try {
        const personas = await Persona.find({ estado: true });
        const doc = new PDFDocument({ size: 'A4' });

        // Enviar PDF como descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=personas.pdf');

        // Iniciar el PDF
        doc.pipe(res);

        // Función para dibujar la imagen de fondo
        const drawBackgroundImage = () => {
            const imagePath = path.resolve('src/img/fondoPDF.png'); // Ruta absoluta

            doc.image(imagePath, 0, 0, { width: doc.page.width, height: doc.page.height });
        };

        // Función para dibujar los encabezados de la tabla
        const drawTableHeaders = () => {
            doc.font('Helvetica-Bold').fontSize(16).text('Nombre', 50, 150);
            doc.text('Teléfono', 250, 150);
            doc.text('DPI', 400, 150);
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
        doc.fontSize(20).text('Listado de Personas', { align: 'center', underline: true });
        doc.moveDown(2);
        drawTableHeaders();

        // Asegurarse de cambiar la fuente a normal después de los encabezados
        doc.font('Helvetica').fontSize(15);

        // Espaciado después del encabezado de la tabla
        const tableTop = 150;
        const itemMargin = 20;
        const maxRowsPerPage = 20;
        let rowsCount = 0;
        let positionY = tableTop + itemMargin;

        // Crear fila para cada persona
        personas.forEach((persona) => {
            const nombreHeight = doc.heightOfString(persona.nombre, { width: 170 });
            const rowHeight = Math.max(nombreHeight, itemMargin);

            // Dibujar los datos de la tabla
            doc.text(persona.nombre, 50, positionY, { width: 170 });
            doc.text(persona.telefono || 'N/A', 250, positionY);
            doc.text(persona.DPI || 'N/A', 400, positionY);

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
        // Cierra el documento en caso de error para evitar intentar escribir en la respuesta
        doc.end();  // Esto asegurará que el flujo se cierre en caso de error
        return res.status(500).json({ message: 'Error al exportar a PDF', error: err.message });
    }
};
 