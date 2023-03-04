const User = require('../models/User')
const crypto = require('crypto')

const createUser = async(req, res) => {
    
    try {
        
        const user = await User.findOne({ email: req.body.email })

        if(user){
            throw new Error('Email in use!')
        }

        //* Guardar info en nuestra base de datos
        //* añadir criptografia de contraseñas
        // const salt = crypto.randomBytes(6).toString('hex')
        // const hash = crypto.pbkdf2Sync(req.body.password, salt, 5000, 10, 'sha512').toString('hex')
        
        //*1 solucion para agregar la password encripatad y se almacene en la abse de datos
        // const {firstname, lastname, email, age, password, newsletter, favoriteProducts } = req.body
        // const newUser = new User({
        //     firstname,
        //     lastname,
        //     email,
        //     age,
        //     password: hash,
        // })

        //* 2 solucion mas optima

        // const newUser = new User({...req.body, password: hash, salt});
        const newUser = new User(req.body);
        newUser.hashPassword(req.body.password);
        
        await newUser.save() //* guarda en mongo atlas
        res.json({
            success: true, 
            message: "User created successfully!", 
            id: newUser._id,
            token: newUser.generateToken()
        }) 

    } catch (error) {
        res.json({ success: false, message: error.message })
    }  
}

const getUsers = async(req, res) => {
    try {
        const users = await User.find().populate('favoriteProducts');
        res.json({ success: true, users })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }   
}

const deleteUser = async(req, res) => {
    try {
        console.log(req.params)
        const { id } = req.params;
        const result = await User.findByIdAndDelete(id);

        if(!result){
            throw new Error("Usuario no existe, imposible de eliminar!")
        }

        res.json({success: true, message: "Usuario Eliminado!!!"})


    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const editUser = async(req, res) => {
    try {
        const { id } = req.params;
        const result = await User.findByIdAndUpdate(id, req.body, {new: true});
        console.log(result)
        if(!result){
            throw new Error("Usuario no existe, imposible de editar!")
        }
        res.json({success: true, message: "Usuario editado con exito!!"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const signIn = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })
        console.log(user.password)
        console.log(password)
        console.log(user.salt)
        if(!user){
            throw new Error('User not register!')
        }

        // const hash = crypto.pbkdf2Sync(password ,user.salt, 5000, 10, 'sha512').toString('hex')
        const validate = user.hashValidation(password, user.salt, user.password);
       

        if (!validate) {
            throw new Error('Contraseña incorrecta!')
        }
        
        res.json({success: true, message: "YOUR ACCOUNT IS LOGIN", token: user.generateToken()})
        


        // if(user.password !== hash){
        //     throw new Error('Contraseña incorrecta!')
        // }

       // hay que comparar las contraseñas
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

module.exports = { createUser, getUsers, deleteUser, editUser, signIn }