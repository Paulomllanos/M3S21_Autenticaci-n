const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        default: "Nombre no señalado",
        trim: true,
        lowercase: true
    },
    lastname: {
        type: String,
        required: true,
        default: "Apellido no señalado",
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/],
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 16,
        max: 90,
        required: true
    },
    newsletter: {
        type: Boolean,
    },
    favoriteProducts: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'product' 
        }
    ],
    password: {
        type: String,
        required: true,
        match: [/^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{8,}$/gm]
    },
    salt: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    }
})
//* Guardar hash automaticamente en base de datos
//* this hace referencia a todo mi modelo
userSchema.methods.hashPassword = function(password) {
    this.salt = crypto.randomBytes(6).toString('hex')   
    this.password = crypto.pbkdf2Sync(password, this.salt, 5000, 20, 'sha512').toString('hex');
}

userSchema.methods.hashValidation = function(password, salt, passwordDB) {
    const hash = crypto.pbkdf2Sync(password , salt, 5000, 20, 'sha512').toString('hex');
    return hash === passwordDB
}

userSchema.methods.generateToken = function() {
    const token = jwt.sign({ id: this._id }, process.env.SECRET);
    return token;
}



const User = mongoose.model('user', userSchema);

module.exports = User;
