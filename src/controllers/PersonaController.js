
import Persona from '../model/Personas.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import stream from 'stream';

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
        const personas = await Persona.find();
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

export const exportPersonasToExcel = async (req, res) => {
    try {
        const personas = await Persona.find();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Personas');
        worksheet.columns = [
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 15 },
            { header: 'DPI', key: 'DPI', width: 20 },
            { header: 'Foto', key: 'fotoP', width: 30 },
            { header: 'Estado', key: 'estado', width: 10 },
        ];

        personas.forEach(persona => {
            worksheet.addRow(persona);
        });

        res.setHeader('Content-Disposition', 'attachment; filename=personas.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: 'Error al exportar a Excel', error: err.message });
    }
};

export const exportPersonasToPDF = async (req, res) => {
    try {
        const personas = await Persona.find();

        const doc = new PDFDocument();
        const pdfStream = doc.pipe(new stream.PassThrough());

        doc.fontSize(18).text('Personas', { align: 'center' });
        doc.moveDown();

        personas.forEach(persona => {
            doc.fontSize(12)
               .text(`Nombre: ${persona.nombre}`, { continued: true })
               .text(`Teléfono: ${persona.telefono}`, { continued: true })
               .text(`DPI: ${persona.DPI}`, { continued: true })
               .text(`Foto: ${persona.fotoP}`, { continued: true })
               .text(`Estado: ${persona.estado ? 'Activo' : 'Inactivo'}`);
            doc.moveDown();
        });

        res.setHeader('Content-Disposition', 'attachment; filename=personas.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        pdfStream.pipe(res);
        doc.end();
    } catch (err) {
        res.status(500).json({ message: 'Error al exportar a PDF', error: err.message });
    }
};
