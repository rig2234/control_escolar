// Elementos del DOM
const registroForm = document.getElementById('registroForm');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const terminosInput = document.getElementById('terminos');
const togglePassword1 = document.getElementById('togglePassword1');
const togglePassword2 = document.getElementById('togglePassword2');
const registroBtn = document.getElementById('registroBtn');
const loader = document.getElementById('loader');
const passwordStrength = document.getElementById('passwordStrength');

// Elementos de error
const loginError = document.getElementById('loginError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const terminosError = document.getElementById('terminosError');
const formError = document.getElementById('formError');
const successMessage = document.getElementById('successMessage');

// Mostrar/Ocultar contraseña
togglePassword1.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword1.style.color = type === 'text' ? '#0f766e' : '#94a3b8';
});

togglePassword2.addEventListener('click', () => {
    const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
    confirmPasswordInput.type = type;
    togglePassword2.style.color = type === 'text' ? '#0f766e' : '#94a3b8';
});

// Validar fortaleza de contraseña
function validarFuerzaContraseña(password) {
    let fuerza = 0;
    
    if (password.length >= 8) fuerza++;
    if (password.length >= 12) fuerza++;
    if (/[a-z]/.test(password)) fuerza++;
    if (/[A-Z]/.test(password)) fuerza++;
    if (/[0-9]/.test(password)) fuerza++;
    if (/[^a-zA-Z0-9]/.test(password)) fuerza++;

    if (fuerza <= 2) return 'debil';
    if (fuerza <= 4) return 'media';
    return 'fuerte';
}

// Mostrar indicador de fuerza
passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    
    if (password.length > 0) {
        const fuerza = validarFuerzaContraseña(password);
        passwordStrength.classList.add('show');
        passwordStrength.classList.remove('debil', 'media', 'fuerte');
        passwordStrength.classList.add(fuerza);
        
        if (passwordError.classList.contains('show')) {
            passwordError.classList.remove('show');
        }
    } else {
        passwordStrength.classList.remove('show');
    }
});

// Limpiar mensajes de error
function limpiarErrores() {
    loginError.textContent = '';
    passwordError.textContent = '';
    confirmPasswordError.textContent = '';
    terminosError.textContent = '';
    formError.textContent = '';
    successMessage.textContent = '';
    
    loginError.classList.remove('show');
    passwordError.classList.remove('show');
    confirmPasswordError.classList.remove('show');
    terminosError.classList.remove('show');
    formError.classList.remove('show');
    successMessage.classList.remove('show');
}

// Validar formulario
function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    // Validar login
    if (!loginInput.value.trim()) {
        loginError.textContent = 'El usuario es requerido';
        loginError.classList.add('show');
        esValido = false;
    } else if (loginInput.value.length < 3) {
        loginError.textContent = 'El usuario debe tener al menos 3 caracteres';
        loginError.classList.add('show');
        esValido = false;
    } else if (loginInput.value.includes(' ')) {
        loginError.textContent = 'El usuario no puede contener espacios';
        loginError.classList.add('show');
        esValido = false;
    }

    // Validar contraseña
    if (!passwordInput.value) {
        passwordError.textContent = 'La contraseña es requerida';
        passwordError.classList.add('show');
        esValido = false;
    } else if (passwordInput.value.length < 6) {
        passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres';
        passwordError.classList.add('show');
        esValido = false;
    }

    // Validar confirmación de contraseña
    if (!confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Debes confirmar tu contraseña';
        confirmPasswordError.classList.add('show');
        esValido = false;
    } else if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Las contraseñas no coinciden';
        confirmPasswordError.classList.add('show');
        esValido = false;
    }

    // Validar términos
    if (!terminosInput.checked) {
        terminosError.textContent = 'Debes aceptar los términos y condiciones';
        terminosError.classList.add('show');
        esValido = false;
    }

    return esValido;
}

// Manejar el envío del formulario
registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    try {
        // Mostrar loader
        registroBtn.disabled = true;
        loader.classList.remove('hidden');
        registroBtn.querySelector('span').style.display = 'none';

        const datosEnvio = {
            login: loginInput.value.trim(),
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value
        };

        console.log('Datos enviados:', datosEnvio); // LOG

        // Enviar petición al servidor
        const response = await fetch('/api/usuarios/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosEnvio)
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data); // LOG

        if (response.ok) {
            // Mostrar mensaje de éxito
            successMessage.textContent = '¡Registro exitoso! Redirigiendo al login...';
            successMessage.classList.add('show');

            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            // Mostrar error
            formError.textContent = data.error || 'Error al registrar. Intenta de nuevo.';
            formError.classList.add('show');
            console.error('Error del servidor:', data.error); // LOG
        }
    } catch (error) {
        console.error('Error de catch:', error);
        formError.textContent = 'Error de conexión. Intenta de nuevo.';
        formError.classList.add('show');
    } finally {
        // Ocultar loader
        registroBtn.disabled = false;
        loader.classList.add('hidden');
        registroBtn.querySelector('span').style.display = 'inline';
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

confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordError.classList.contains('show')) {
        confirmPasswordError.classList.remove('show');
    }
});

terminosInput.addEventListener('change', () => {
    if (terminosError.classList.contains('show')) {
        terminosError.classList.remove('show');
    }
});
