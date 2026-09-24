const express = require('express');
const session = require('express-session'); // <--- Importar express-session
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Configuración de Sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave_secreta_control_escolar', // Usar una clave en .env o por defecto
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Protege contra ataques XSS
        secure: process.env.NODE_ENV === 'production', // true solo si usas HTTPS en producción
        maxAge: 1000 * 60 * 60 * 8 // La sesión dura 8 horas
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Importar conexión a la base de datos y rutas
const pool = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const cycleRoutes = require('./routes/cycleRoutes');
const masterRoutes = require('./routes/masteryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const cycleCourseRoutes = require('./routes/cycleCourseRoutes');
const careerEnrollmentRoutes = require('./routes/careerEnrollmentRoutes');

// Rutas API
app.use('/api/usuarios', userRoutes);
app.use('/api/estudiantes', studentRoutes);
app.use('/api/ciclos', cycleRoutes);
app.use('/api/maestrias', masterRoutes);
app.use('/api/materias', courseRoutes);
app.use('/api/grados', gradeRoutes);
app.use('/api/ciclomaterias', cycleCourseRoutes);
app.use('/api/enrollment', careerEnrollmentRoutes);

// Rutas de vistas
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor asegurando la conexión previa a SQL Server
const PORT = process.env.PORT || 5000;

async function iniciarServidor() {
    try {
        // Espera a que el pool de SQL Server se conecte
        if (pool.connect) {
            await pool.connect();
        } else {
            await pool; // Por si exportas poolPromise desde database.js
        }
        console.log('Conectado a SQL Server exitosamente');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        process.exit(1);
    }
}

iniciarServidor();