const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt-nodejs')

const Usuario = new Schema(
  {
    nombre: String,
    apellido: String,
    correo: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    uoc: {
      type: String,
      required: true,
    },
    programa: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ['Jefe de Programa', 'Estudiante', 'Profesor', 'Monitor'],
      default: 'Estudiante',
    },
  },
  {
    toJSON: { virtuals: true },
  },
)

Usuario.pre('save', function(next) {
  const user = this,
    SALT_FACTOR = 5

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

Usuario.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err)
    }

    cb(null, isMatch)
  })
}

Usuario.virtual('nombreCompleto').get(function() {
  return this.nombre + ' ' + this.apellido
})

module.exports = mongoose.model('Usuario', Usuario)
