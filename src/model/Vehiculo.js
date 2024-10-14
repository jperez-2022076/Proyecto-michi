import { Schema, model } from "mongoose";
import moment from 'moment'; // Usamos moment para manipular fechas

const vehiculoSchema = new Schema(
  {
    placa: {
      type: String,
      required: true,
    },
    fotoV: {
      type: String,
    },
    pagado: {
      type: Boolean,
      default: false,
    },
    fecha: {
      type: Date,
  
    },
    estado: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false, 
  }
);

// Middleware para actualizar 'pagado' si ya han pasado más de 30 días al consultar
vehiculoSchema.pre('find', async function(next) {
  const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

  // Actualizamos todos los vehículos cuya fecha es mayor a 30 días y 'pagado' es true
  await this.model.updateMany(
    { pagado: true, fecha: { $lt: thirtyDaysAgo } },
    { pagado: false }
  );

  next();
});

vehiculoSchema.pre('findOne', async function(next) {
  const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

  // Actualizamos el vehículo si ya pasaron 30 días
  await this.model.updateOne(
    { pagado: true, fecha: { $lt: thirtyDaysAgo } },
    { pagado: false }
  );

  next();
});

export default model('Vehiculo', vehiculoSchema);
