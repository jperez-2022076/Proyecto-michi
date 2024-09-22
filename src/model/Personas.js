'use strict'

import { Schema,model } from "mongoose"


const personasSchema = Schema(
    {
        nombre:{
            type:String,
            required: true,
        },
        telefono:{
            type:String,
         
        },
        DPI:{
            type:String,
            required: true,
        },
        fotoP:{
            type:String,
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
export default model('Persona', personasSchema)