'use strict'

import { Schema, model } from "mongoose"

const vehiculoSchema = Schema(
    {
        
        placa:{
            type:String,
            required: true,
        },
        fotoV:{
            type:String,
        },
        pagado:{
            type:Boolean,
            default:false,
        },
        fecha: {
            type: Date,
            required: true
        },
        estado:{
            type:Boolean,
            default:true
        },
    
    },
    {
        versionKey: false, // Aquí es donde debe ir
    }
)

export default model('Vehiculo', vehiculoSchema)