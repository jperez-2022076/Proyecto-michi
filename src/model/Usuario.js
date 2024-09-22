'use strict'

import { model, Schema } from "mongoose"


const usuarioSchema = Schema(
    {
        usuario:{
            type:String,
            required: true,
            unique: true,
        },
        nombre:{
            type:String,
            required: true,
        },
        telefono:{
            type:String,
          
        },
        password:{
            type:String,
            required: true,
        },
        rol:{
            type:String,
            enum:['ADMIN','GUARDIAN'],
            default: 'GUARDIAN'
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

export default model('Usuario', usuarioSchema)