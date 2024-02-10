const express = require("express");
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["POST", "GET"],
    credentials: true
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Refreg12',
    database: 'escuela2',
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});


// Ruta para verificar el usuario al iniciar sesión
app.post('/usuarios/verificar', (req, res) => {
    const { nombre_usuario, clave } = req.body;

    // Consultar la base de datos para verificar al usuario
    const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ? AND clave = ?';
    db.query(query, [nombre_usuario, clave], (err, resultados) => {
        if (err) {
            console.error('Error al realizar la consulta:', err);
            return res.status(500).send('Error interno del servidor');
        }

        if (resultados.length > 0) {
            // Crear un token de autenticación
            const token = jwt.sign({ name: nombre_usuario }, "our.jsonwebtoken-secret-key", { expiresIn: '1d' });

            // Enviar el token como cookie con la opción secure: false
            res.cookie('token', token, { secure: false });

            res.json({ usuarioValido: true });
        } else {
            res.json({ usuarioValido: false });
        }
    });
});
// Ruta para obtener la cantidad de valores en una tabla
app.get('/profesor', (req, res) => {
    console.log('Solicitud a /pasajeros recibida');
    const sql = 'SELECT * FROM profesor';
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        console.log('Datos de profesores enviados:', data);
        res.json({ profesor: data });
    });
});
// Ruta para insertar valores en la tabla horarios
app.post('/insertar-registro', (req, res) => {
    const {  id_salon, capacidad, cursos, ubicacion, profesor_id, id_limpieza } = req.body;
    const sql = "INSERT INTO salon (id_salon, capacidad, cursos, ubicacion, profesor_id, id_limpieza) VALUES (?,?,?,?,?,?)";
    db.query(sql, [id_salon, capacidad, cursos, ubicacion, profesor_id, id_limpieza], (err, result) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        console.log('Datos insertados correctamente en la tabla de registro');
        return res.json({ status: 'Success', message: 'Datos insertados correctamente' });
    });
});

// Puerto de escucha
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});