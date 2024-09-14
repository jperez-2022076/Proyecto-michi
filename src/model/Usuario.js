'use strict'

import { model, Schema } from "mongoose"


const usuarioSchema = Schema(
    {
        usuario:{
            type:String,
            required: true,
        },
        nombre:{
            type:String,
            required: true,
        },
        telefono:{
            type:String,
          
        },
        contraseña:{
            type:String,
            required: true,
        },
        versionkey: false, 
    },
)

export default model('Usuario', usuarioSchema)