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
const estudiantesBody = document.getElementById('estudiantesBody');

// Elementos del Modal de Agregar / Editar Estudiante
const btnAgregarEstudiante = document.getElementById('btnAgregarEstudiante');
const modalAgregarEstudiante = document.getElementById('modalAgregarEstudiante');
const modalEstudianteTitulo = document.getElementById('modalEstudianteTitulo') || document.getElementById('modalAgregarEstudianteTitulo');
const btnCerrarModalEstudiante = document.getElementById('btnCerrarModalEstudiante');
const btnCancelarEstudiante = document.getElementById('btnCancelarEstudiante');
const formAgregarEstudiante = document.getElementById('formAgregarEstudiante');
const estError = document.getElementById('estError');
const estSuccess = document.getElementById('estSuccess');

// Elementos del Modal de Eliminación
const modalEliminar = document.getElementById('modalEliminarEstudiante');
const btnCerrarModalEliminar = document.getElementById('btnCerrarModalEliminar');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
const nombreEstudianteEliminar = document.getElementById('nombreEstudianteEliminar');

// Variables globales de estado
let estudianteIdAEliminar = null;
let editandoId = null; // Controla si guardamos vía POST (crear) o PUT (editar)

function escaparHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function nombreEstudiante(estudiante) {
    return [estudiante.name, estudiante.firstlastname, estudiante.secondlastname]
        .filter(Boolean)
        .join(' ');
}

// Renderizar tabla de estudiantes
function renderizarEstudiantes(estudiantes) {
    if (!estudiantes || !estudiantes.length) {
        estudiantesBody.innerHTML = '<tr><td colspan="6">No hay estudiantes registrados.</td></tr>';
        return;
    }

    estudiantesBody.innerHTML = estudiantes.map(estudiante => {
        const nombreComp = nombreEstudiante(estudiante);
        return `
        <tr>
            <td>#${escaparHtml(estudiante.id)}</td>
            <td>${escaparHtml(nombreComp)}</td>
            <td>${escaparHtml(estudiante.sex || '-')}</td>
            <td>${escaparHtml(estudiante.idgrade || '-')}</td>
            <td><span class="badge ${estudiante.status ? 'badge-success' : 'badge-warning'}">
                ${estudiante.status ? 'Activo' : 'Inactivo'}
            </span></td>
            
<td>
    <button class="btn-sm btn-info" type="button" onclick="abrirModalVer(${estudiante.id})">Ver</button>
    <button class="btn-sm btn-warning" type="button" onclick="abrirModalEditar(${estudiante.id})">Editar</button>
    <button class="btn-sm btn-danger" type="button" onclick="abrirModalEliminar(${estudiante.id}, '${escaparHtml(nombreComp)}')">
        Eliminar
    </button>
</td>
        </tr>
    `}).join('');
}

// Cargar la lista de estudiantes desde la API
async function cargarEstudiantes() {
    try {
        const response = await fetch('/api/estudiantes');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'No se pudieron cargar los estudiantes');
        }

        renderizarEstudiantes(data);
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        estudiantesBody.innerHTML = '<tr><td colspan="6">No se pudieron cargar los estudiantes.</td></tr>';
    }
}

// --- MODAL ELIMINAR ---
function abrirModalEliminar(id, nombreCompleto) {
    estudianteIdAEliminar = id;
    if (nombreEstudianteEliminar) nombreEstudianteEliminar.textContent = nombreCompleto;
    if (modalEliminar) modalEliminar.classList.remove('hidden');
}

function cerrarModalEliminar() {
    if (modalEliminar) modalEliminar.classList.add('hidden');
    estudianteIdAEliminar = null;
}

if (btnCerrarModalEliminar) btnCerrarModalEliminar.addEventListener('click', cerrarModalEliminar);
if (btnCancelarEliminar) btnCancelarEliminar.addEventListener('click', cerrarModalEliminar);
if (modalEliminar) {
    modalEliminar.addEventListener('click', (e) => {
        if (e.target === modalEliminar) cerrarModalEliminar();
    });
}

if (btnConfirmarEliminar) {
    btnConfirmarEliminar.addEventListener('click', async () => {
        if (!estudianteIdAEliminar) return;

        try {
            const response = await fetch(`/api/estudiantes/${estudianteIdAEliminar}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                cerrarModalEliminar();
                cargarEstudiantes();
            } else {
                alert(`Error: ${data.error || 'No se pudo eliminar el estudiante'}`);
            }
        } catch (error) {
            console.error('Error al eliminar estudiante:', error);
            alert('Ocurrió un error de conexión al intentar eliminar.');
        }
    });
}

// --- MODAL CREAR / EDITAR ESTUDIANTE ---
function cerrarModalEstudiante() {
    if (modalAgregarEstudiante) modalAgregarEstudiante.classList.add('hidden');
    if (formAgregarEstudiante) formAgregarEstudiante.reset();
    editandoId = null;
    if (estError) { estError.textContent = ''; estError.classList.remove('show'); }
    if (estSuccess) { estSuccess.textContent = ''; estSuccess.classList.remove('show'); }
}

function abrirModalCrear() {
    cerrarModalEstudiante();
    if (modalEstudianteTitulo) modalEstudianteTitulo.textContent = 'Agregar Estudiante';
    if (modalAgregarEstudiante) modalAgregarEstudiante.classList.remove('hidden');
}

if (btnAgregarEstudiante) btnAgregarEstudiante.addEventListener('click', abrirModalCrear);
if (btnCerrarModalEstudiante) btnCerrarModalEstudiante.addEventListener('click', cerrarModalEstudiante);
if (btnCancelarEstudiante) btnCancelarEstudiante.addEventListener('click', cerrarModalEstudiante);
if (modalAgregarEstudiante) {
    modalAgregarEstudiante.addEventListener('click', (e) => {
        if (e.target === modalAgregarEstudiante) cerrarModalEstudiante();
    });
}

// Abrir el modal rellenando los campos traídos de la BD
async function abrirModalEditar(id) {
    try {
        const response = await fetch(`/api/estudiantes/${id}`);
        const estudiante = await response.json();

        if (!response.ok) {
            alert(estudiante.error || 'No se pudieron obtener los datos del estudiante');
            return;
        }

        editandoId = id;

        // Rellenar los inputs usando los IDs est*
        document.getElementById('estNombre').value = estudiante.name || '';
        document.getElementById('estPrimerApellido').value = estudiante.firstlastname || '';
        document.getElementById('estSegundoApellido').value = estudiante.secondlastname || '';
        document.getElementById('estSexo').value = estudiante.sex || '';
        document.getElementById('estGrado').value = estudiante.idgrade || '';
        document.getElementById('estCURP').value = estudiante.CURP || '';
        document.getElementById('estRFC').value = estudiante.RFC || '';

        if (modalEstudianteTitulo) modalEstudianteTitulo.textContent = 'Editar Estudiante';
        if (modalAgregarEstudiante) modalAgregarEstudiante.classList.remove('hidden');
    } catch (error) {
        console.error('Error al obtener estudiante:', error);
        alert('Error de conexión al cargar el estudiante');
    }
}

// Guardar datos (POST si es nuevo, PUT si editandoId tiene valor)
if (formAgregarEstudiante) {
    formAgregarEstudiante.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosEstudiante = {
            name: document.getElementById('estNombre').value.trim(),
            firstlastname: document.getElementById('estPrimerApellido').value.trim(),
            secondlastname: document.getElementById('estSegundoApellido').value.trim(),
            sex: document.getElementById('estSexo').value,
            idgrade: document.getElementById('estGrado').value,
            CURP: document.getElementById('estCURP').value.trim(),
            RFC: document.getElementById('estRFC').value.trim()
        };

        const url = editandoId ? `/api/estudiantes/${editandoId}` : '/api/estudiantes';
        const metodo = editandoId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosEstudiante)
            });

            const data = await response.json();

            if (response.ok) {
                if (estSuccess) {
                    estSuccess.textContent = editandoId ? '¡Estudiante actualizado con éxito!' : '¡Estudiante registrado con éxito!';
                    estSuccess.classList.add('show');
                }

                setTimeout(() => {
                    cerrarModalEstudiante();
                    cargarEstudiantes();
                }, 1200);
            } else {
                if (estError) {
                    estError.textContent = data.error || 'Error al guardar los datos del estudiante';
                    estError.classList.add('show');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            if (estError) {
                estError.textContent = 'Error de conexión con el servidor';
                estError.classList.add('show');
            }
        }
    });
}

// --- SESIÓN Y NAVEGACIÓN ---
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

function mostrarDatosUsuario(usuario) {
    const userInitial = usuario.login.charAt(0).toUpperCase();
    const userRole = usuario.iduser === 0 ? 'Estudiante' : 'Docente';

    document.getElementById('userInitial').textContent = userInitial;
    document.getElementById('userName').textContent = usuario.login;
    document.getElementById('userRole').textContent = userRole;
    document.getElementById('welcomeName').textContent = usuario.login;

    document.getElementById('profileLogin').textContent = usuario.login;
    document.getElementById('profileId').textContent = usuario.id;
    document.getElementById('profileStatus').textContent = usuario.status === 1 ? 'Activo' : 'Inactivo';
}

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        sections.forEach(section => section.classList.remove('active'));

        const sectionId = link.dataset.section;
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');

            if (sectionId === 'estudiantes') {
                cargarEstudiantes();
            }

            document.getElementById('pageTitle').textContent =
                link.textContent.trim().toUpperCase();
        }

        sidebar.classList.remove('active');
    });
});

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('usuarioActual');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    });
}

// --- MODAL CAMBIAR CONTRASEÑA ---
if (btnCambiarContraseña) {
    btnCambiarContraseña.addEventListener('click', () => {
        modal.classList.remove('hidden');
        limpiarFormulario();
    });
}

if (btnCerrarModal) btnCerrarModal.addEventListener('click', () => modal.classList.add('hidden'));
if (btnCancelar) btnCancelar.addEventListener('click', () => modal.classList.add('hidden'));

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

const passwordActualInput = document.getElementById('passwordActual');
const passwordNuevaInput = document.getElementById('passwordNueva');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordActualError = document.getElementById('passwordActualError');
const passwordNuevaError = document.getElementById('passwordNuevaError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const formError = document.getElementById('formError');
const successMessage = document.getElementById('successMessage');

function limpiarFormulario() {
    if (formCambiarContraseña) formCambiarContraseña.reset();
    [passwordActualError, passwordNuevaError, confirmPasswordError, formError, successMessage].forEach(el => {
        if (el) {
            el.textContent = '';
            el.classList.remove('show');
        }
    });
}

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

if (formCambiarContraseña) {
    formCambiarContraseña.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validarFormularioCambiarContraseña()) return;

        try {
            const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

            const response = await fetch(`/api/usuarios/${usuario.id}/cambiar-contraseña`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
}

// Elementos del Modal Ver Estudiante
const modalVerEstudiante = document.getElementById('modalVerEstudiante');
const btnCerrarModalVer = document.getElementById('btnCerrarModalVer');
const btnCerrarVer = document.getElementById('btnCerrarVer');

function cerrarModalVer() {
    if (modalVerEstudiante) modalVerEstudiante.classList.add('hidden');
}

if (btnCerrarModalVer) btnCerrarModalVer.addEventListener('click', cerrarModalVer);
if (btnCerrarVer) btnCerrarVer.addEventListener('click', cerrarModalVer);
if (modalVerEstudiante) {
    modalVerEstudiante.addEventListener('click', (e) => {
        if (e.target === modalVerEstudiante) cerrarModalVer();
    });
}

// Función para consultar la API y poblar el modal
async function abrirModalVer(id) {
    try {
        const response = await fetch(`/api/estudiantes/${id}`);
        const estudiante = await response.json();

        if (!response.ok) {
            alert(estudiante.error || 'No se pudieron obtener los datos del estudiante');
            return;
        }

        // Asignar los datos recibidos a los spans del modal
        document.getElementById('verId').textContent = `#${estudiante.id}`;
        document.getElementById('verNombre').textContent = nombreEstudiante(estudiante) || 'Sin nombre';
        document.getElementById('verSexo').textContent = estudiante.sex || 'No especificado';
        document.getElementById('verGrado').textContent = estudiante.idgrade || 'No asignado';
        document.getElementById('verCURP').textContent = estudiante.CURP || 'N/A';
        document.getElementById('verRFC').textContent = estudiante.RFC || 'N/A';
        document.getElementById('verEstado').textContent = estudiante.status ? 'Activo' : 'Inactivo';

        if (modalVerEstudiante) modalVerEstudiante.classList.remove('hidden');
    } catch (error) {
        console.error('Error al obtener estudiante para ver:', error);
        alert('Error de conexión al cargar la información del estudiante');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
});