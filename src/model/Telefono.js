'use strict'
import { model, Schema } from "mongoose"

const telefonoSchema = Schema(
  {
    _id: {
      type: String,
    },
    datos: [
      {
        tipo: {
          type: String,
          enum: ['P', 'V', 'U'], // P = Persona, V = Vehículo, U = ambos
 
        },
        accion: {
          type: String,
          enum: ['A', 'U', 'D'], // A = Agregar, U = Actualizar, D = Eliminar

        },
        persona: {
          type: Schema.Types.ObjectId,
          ref: 'Persona'
        },
        vehiculo: {
          type: Schema.Types.ObjectId,
          ref: 'Vehiculo'
        },
        usuario: {
          type: Schema.Types.ObjectId,
          ref: 'Usuario',
        },
      }
    ]
  },
  {
    versionKey: false
  }
)

export default model('Telefono', telefonoSchema)
