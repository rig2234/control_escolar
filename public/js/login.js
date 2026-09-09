// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const recuerdameInput = document.getElementById('recuerdame');
const loginBtn = document.getElementById('loginBtn');
const loader = document.getElementById('loader');

const loginError = document.getElementById('loginError');
const passwordError = document.getElementById('passwordError');
const formError = document.getElementById('formError');
const successMessage = document.getElementById('successMessage');

// Mostrar/Ocultar contraseña
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.style.color = type === 'text' ? '#0f766e' : '#94a3b8';
});

// Limpiar mensajes
function limpiarMensajes() {
    loginError.textContent = '';
    passwordError.textContent = '';
    formError.textContent = '';
    successMessage.textContent = '';
    
    loginError.classList.remove('show');
    passwordError.classList.remove('show');
    formError.classList.remove('show');
    successMessage.classList.remove('show');
}

// Validar formulario
function validarFormulario() {
    limpiarMensajes();
    let esValido = true;

    // Validar login
    if (!loginInput.value.trim()) {
        loginError.textContent = 'El usuario es requerido';
        loginError.classList.add('show');
        esValido = false;
    }

    // Validar contraseña
    if (!passwordInput.value) {
        passwordError.textContent = 'La contraseña es requerida';
        passwordError.classList.add('show');
        esValido = false;
    }

    return esValido;
}

// Manejar el envío del formulario
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    try {
        // Mostrar loader
        loginBtn.disabled = true;
        loader.classList.remove('hidden');
        loginBtn.querySelector('span').style.display = 'none';

        // Enviar petición al servidor
        const response = await fetch('/api/usuarios/autenticar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: loginInput.value.trim(),
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Mostrar mensaje de éxito
            successMessage.textContent = '¡Autenticación exitosa! Redirigiendo...';
            successMessage.classList.add('show');

            // Guardar datos en localStorage si recuérdame está marcado
            if (recuerdameInput.checked) {
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
            }

            // Guardar token o datos de sesión
            localStorage.setItem('usuarioActual', JSON.stringify(data.usuario));

            // Redirigir después de 1.5 segundos
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            // Mostrar error
            formError.textContent = data.error || 'Error al iniciar sesión';
            formError.classList.add('show');
        }
    } catch (error) {
        console.error('Error:', error);
        formError.textContent = 'Error de conexión. Intenta de nuevo.';
        formError.classList.add('show');
    } finally {
        // Ocultar loader
        loginBtn.disabled = false;
        loader.classList.add('hidden');
        loginBtn.querySelector('span').style.display = 'inline';
    }
});

// Limpiar errores al escribir
loginInput.addEventListener('input', () => {
    if (loginError.classList.contains('show')) {
        loginError.classList.remove('show');
    }
});

passwordInput.addEventListener('input', () => {
    if (passwordError.classList.contains('show')) {
        passwordError.classList.remove('show');
    }
});

// Cargar usuario guardado si existe
window.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
        try {
            const usuario = JSON.parse(usuarioGuardado);
            loginInput.value = usuario.login || '';
            recuerdameInput.checked = true;
        } catch (error) {
            console.error('Error al cargar usuario guardado:', error);
        }
    }
});







