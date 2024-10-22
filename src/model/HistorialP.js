'use strict'
import { model, Schema } from "mongoose"

const historialP = Schema(
    {
        persona:{
            type: Schema.Types.ObjectId,
            ref: 'Persona',
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
)

export default model('HistorialP', historialP)
