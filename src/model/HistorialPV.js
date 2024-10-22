'use strict'

import { model, Schema } from "mongoose";

const historalPV = new Schema(
  {
    persona: {
      type: Schema.Types.ObjectId,
      ref: 'Persona',
    },
    vehiculo: {
      type: Schema.Types.ObjectId,
      ref: 'Vehiculo',
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    nombre: {
      type: String,
  
    },
    DPI: {
      type: String,
  
    },
    placa: {
      type: String,
     
    },
    estado: {
      type: String,
      enum: ['E', 'S'],
      default: 'S'
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
