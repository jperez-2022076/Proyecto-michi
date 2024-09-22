'use strict'

import { model, Schema } from "mongoose"

const historalPV = Schema(
    {
        persona:{
            type: Schema.Types.ObjectId,
            ref: 'Persona',
            required: true
        },
        vehiculo:{
            type: Schema.Types.ObjectId,
            ref: 'Vehiculo',
            required: true
        },
        usuario:{
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
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
)

export default model('HistorialPV', historalPV)
