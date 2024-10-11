'use strict'

import { model, Schema } from "mongoose";

const historalPV = new Schema(
  {
    persona: {
      type: Schema.Types.ObjectId,
      ref: 'Persona',
      required: true
    },
    vehiculo: {
      type: Schema.Types.ObjectId,
      ref: 'Vehiculo',
      required: true
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    nombre: {
      type: String,
      default: null // Por defecto será null en lugar de una cadena vacía
    },
    DPI: {
      type: String,
      default: null // Por defecto será null
    },
    placa: {
      type: String,
      default: null // Por defecto será null
    },
    estado: {
      type: String,
      enum: ['E', 'S'],
      default: 'E'
    },
    fecha: {
      type: Date,
      required: true
    },
    hora: {
      type: String,
      required: true
    },
  },
  {
    versionKey: false, // Aquí es donde debe ir
  }
);

export default model('HistorialPV', historalPV);
