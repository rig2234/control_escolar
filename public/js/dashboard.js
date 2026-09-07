// Elementos del DOM
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const logoutBtn = document.getElementById('logoutBtn');
const btnCambiarContraseña = document.getElementById('btnCambiarContraseña');
const modal = document.getElementById('modalCambiarContraseña');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const btnCancelar = document.getElementById('btnCancelar');
const formCambiarContraseña = document.getElementById('formCambiarContraseña');

// Verificar si el usuario está logueado
function verificarSesion() {
    const usuarioActual = localStorage.getItem('usuarioActual');
    if (!usuarioActual) {
        window.location.href = '/login';
        return;
    }
    
    try {
        const usuario = JSON.parse(usuarioActual);
        mostrarDatosUsuario(usuario);
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        window.location.href = '/login';
    }
}

// Mostrar datos del usuario
function mostrarDatosUsuario(usuario) {
    const userInitial = usuario.login.charAt(0).toUpperCase();
    const userRole = usuario.iduser === 0 ? 'Estudiante' : 'Docente';

    document.getElementById('userInitial').textContent = userInitial;
    document.getElementById('userName').textContent = usuario.login;
    document.getElementById('userRole').textContent = userRole;
    document.getElementById('welcomeName').textContent = usuario.login;
    
    // Datos en configuración
    document.getElementById('profileLogin').textContent = usuario.login;
    document.getElementById('profileId').textContent = usuario.id;
    document.getElementById('profileStatus').textContent = usuario.status === 1 ? 'Activo' : 'Inactivo';
}

// Toggle sidebar en móvil
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Navegar entre secciones
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover clase active de todos los links
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Ocultar todas las secciones
        sections.forEach(section => section.classList.remove('active'));
        
        // Mostrar sección seleccionada
        const sectionId = link.dataset.section;
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
            
            // Actualizar título
            document.getElementById('pageTitle').textContent = 
                link.textContent.trim().toUpperCase();
        }
        
        // Cerrar sidebar en móvil
        sidebar.classList.remove('active');
    });
});

// Cerrar sesión
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
});

// MODAL - Cambiar contraseña
btnCambiarContraseña.addEventListener('click', () => {
    modal.classList.remove('hidden');
    limpiarFormulario();
});

btnCerrarModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

btnCancelar.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Cerrar modal al hacer click fuera
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// Elementos del formulario
const passwordActualInput = document.getElementById('passwordActual');
const passwordNuevaInput = document.getElementById('passwordNueva');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordActualError = document.getElementById('passwordActualError');
const passwordNuevaError = document.getElementById('passwordNuevaError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const formError = document.getElementById('formError');
const successMessage = document.getElementById('successMessage');

// Limpiar formulario
function limpiarFormulario() {
    formCambiarContraseña.reset();
    passwordActualError.textContent = '';
    passwordNuevaError.textContent = '';
    confirmPasswordError.textContent = '';
    formError.textContent = '';
    successMessage.textContent = '';
    
    passwordActualError.classList.remove('show');
    passwordNuevaError.classList.remove('show');
    confirmPasswordError.classList.remove('show');
    formError.classList.remove('show');
    successMessage.classList.remove('show');
}

// Validar formulario
function validarFormularioCambiarContraseña() {
    limpiarFormulario();
    let esValido = true;

    if (!passwordActualInput.value) {
        passwordActualError.textContent = 'La contraseña actual es requerida';
        passwordActualError.classList.add('show');
        esValido = false;
    }

    if (!passwordNuevaInput.value) {
        passwordNuevaError.textContent = 'La nueva contraseña es requerida';
        passwordNuevaError.classList.add('show');
        esValido = false;
    } else if (passwordNuevaInput.value.length < 6) {
        passwordNuevaError.textContent = 'La contraseña debe tener al menos 6 caracteres';
        passwordNuevaError.classList.add('show');
        esValido = false;
    }

    if (!confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Debes confirmar tu contraseña';
        confirmPasswordError.classList.add('show');
        esValido = false;
    } else if (passwordNuevaInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Las contraseñas no coinciden';
        confirmPasswordError.classList.add('show');
        esValido = false;
    }

    return esValido;
}

// Enviar formulario
formCambiarContraseña.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validarFormularioCambiarContraseña()) {
        return;
    }

    try {
        const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
        
        const response = await fetch(`/api/usuarios/${usuario.id}/cambiar-contraseña`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                passwordActual: passwordActualInput.value,
                passwordNueva: passwordNuevaInput.value,
                confirmPassword: confirmPasswordInput.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            successMessage.textContent = '¡Contraseña actualizada correctamente!';
            successMessage.classList.add('show');

            setTimeout(() => {
                modal.classList.add('hidden');
                limpiarFormulario();
            }, 2000);
        } else {
            formError.textContent = data.error || 'Error al actualizar la contraseña';
            formError.classList.add('show');
        }
    } catch (error) {
        console.error('Error:', error);
        formError.textContent = 'Error de conexión';
        formError.classList.add('show');
    }
});

// Limpiar errores al escribir
passwordActualInput.addEventListener('input', () => {
    if (passwordActualError.classList.contains('show')) {
        passwordActualError.classList.remove('show');
    }
});

passwordNuevaInput.addEventListener('input', () => {
    if (passwordNuevaError.classList.contains('show')) {
        passwordNuevaError.classList.remove('show');
    }
});

confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordError.classList.contains('show')) {
        confirmPasswordError.classList.remove('show');
    }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
});