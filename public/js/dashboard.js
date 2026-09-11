// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
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

// Modal Estudiantes (Crear / Editar)
const btnAgregarEstudiante = document.getElementById('btnAgregarEstudiante');
const modalAgregarEstudiante = document.getElementById('modalAgregarEstudiante');
const modalEstudianteTitulo = document.getElementById('modalEstudianteTitulo') || document.getElementById('modalAgregarEstudianteTitulo');
const btnCerrarModalEstudiante = document.getElementById('btnCerrarModalEstudiante');
const btnCancelarEstudiante = document.getElementById('btnCancelarEstudiante');
const formAgregarEstudiante = document.getElementById('formAgregarEstudiante');
const estError = document.getElementById('estError');
const estSuccess = document.getElementById('estSuccess');

// Modal Estudiantes (Ver)
const modalVerEstudiante = document.getElementById('modalVerEstudiante');
const btnCerrarModalVer = document.getElementById('btnCerrarModalVer');
const btnCerrarVer = document.getElementById('btnCerrarVer');

// Modal Estudiantes (Eliminar)
const modalEliminar = document.getElementById('modalEliminarEstudiante');
const btnCerrarModalEliminar = document.getElementById('btnCerrarModalEliminar');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
const nombreEstudianteEliminar = document.getElementById('nombreEstudianteEliminar');

// Modal Ciclos Escolares
const btnAgregarCiclo = document.getElementById('btnAgregarCiclo');
const modalAgregarCiclo = document.getElementById('modalAgregarCiclo');
const btnCerrarModalCiclo = document.getElementById('btnCerrarModalCiclo');
const btnCancelarCiclo = document.getElementById('btnCancelarCiclo');
const formAgregarCiclo = document.getElementById('formAgregarCiclo');
const cicloError = document.getElementById('cicloError');
const cicloSuccess = document.getElementById('cicloSuccess');
const ciclosBody = document.getElementById('ciclosBody');

// Modal Maestrías
const btnAgregarMaestria = document.getElementById('btnAgregarMaestria');
const modalAgregarMaestria = document.getElementById('modalAgregarMaestria');
const btnCerrarModalMaestria = document.getElementById('btnCerrarModalMaestria');
const btnCancelarMaestria = document.getElementById('btnCancelarMaestria');
const formAgregarMaestria = document.getElementById('formAgregarMaestria');
const maestriaError = document.getElementById('maestriaError');
const maestriaSuccess = document.getElementById('maestriaSuccess');
const maestriasBody = document.getElementById('maestriasBody');

// ==========================================
// ESTADO GLOBAL (SEPARADO)
// ==========================================
let estudianteIdAEliminar = null;
let editandoEstudianteId = null;
let cicloIdAEliminar = null;
let editandoCicloId = null;
let editandoMaestriaId = null;

// ==========================================
// UTILIDADES Y VALIDACIONES
// ==========================================
const REGEX_NOMBRE = /^[a-záéíóúàâäãèêëìîïòôöõùûüüñçA-ZÁÉÍÓÚÀÂÄÃÈÊËÌÎÏÒÔÖÕÙÛÜÜÑÇ\s'-]{2,100}$/;

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

function validarNombre(valor, campo) {
    valor = valor.trim();
    if (!valor) return { valido: false, error: `${campo} es requerido` };
    if (valor.length < 2) return { valido: false, error: `${campo} debe tener al menos 2 caracteres` };
    if (valor.length > 100) return { valido: false, error: `${campo} no puede exceder 100 caracteres` };
    if (!REGEX_NOMBRE.test(valor)) return { valido: false, error: `${campo} contiene caracteres inválidos` };
    if (!/[a-záéíóúàâäãèêëìîïòôöõùûüüñçA-ZÁÉÍÓÚÀÂÄÃÈÊËÌÎÏÒÔÖÕÙÛÜÜÑÇ]/.test(valor)) return { valido: false, error: `${campo} debe contener al menos una letra` };
    if (/\s{2,}/.test(valor)) return { valido: false, error: `${campo} no puede contener espacios múltiples` };
    return { valido: true };
}

// ==========================================
// RENDERIZADO DE TABLAS
// ==========================================
function renderizarEstudiantes(estudiantes) {
    if (!estudiantesBody) return;
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
                <button class="btn-sm btn-danger" type="button" onclick="abrirModalEliminar(${estudiante.id})">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

function renderizarCiclos(ciclos) {
    if (!ciclosBody) return;
    if (!ciclos || !ciclos.length) {
        ciclosBody.innerHTML = '<tr><td colspan="6">No hay ciclos escolares registrados.</td></tr>';
        return;
    }

    ciclosBody.innerHTML = ciclos.map(ciclo => {
        const fechaInicio = ciclo.initialdate ? new Date(ciclo.initialdate).toLocaleDateString('es-MX') : '-';
        const fechaFin = ciclo.finaldate ? new Date(ciclo.finaldate).toLocaleDateString('es-MX') : '-';
        return `
        <tr>
            <td>#${escaparHtml(ciclo.id)}</td>
            <td>${escaparHtml(ciclo.name)}</td>
            <td>${fechaInicio}</td>
            <td>${fechaFin}</td>
            <td><span class="badge ${ciclo.status ? 'badge-success' : 'badge-warning'}">
                ${ciclo.status ? 'Activo' : 'Inactivo'}
            </span></td>
            <td>
                <button class="btn-sm btn-warning" type="button" onclick="abrirModalEditarCiclo(${ciclo.id})">Editar</button>
                <button class="btn-sm btn-danger" type="button" onclick="abrirModalEliminarCiclo(${ciclo.id})">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

function renderizarMaestrias(maestrias) {
    if (!maestriasBody) return;
    if (!maestrias || !maestrias.length) {
        maestriasBody.innerHTML = '<tr><td colspan="6">No hay maestrías registradas.</td></tr>';
        return;
    }

    maestriasBody.innerHTML = maestrias.map(maestria => {
        const duracion = maestria.duration
            ? `${escaparHtml(maestria.duration)} semestre${maestria.duration == 1 ? '' : 's'}`
            : '-';
        return `
        <tr>
            <td>#${escaparHtml(maestria.id)}</td>
            <td>${escaparHtml(maestria.name)}</td>
            <td>${escaparHtml(maestria.description || '-')}</td>
            <td>${duracion}</td>
            <td><span class="badge ${maestria.status ? 'badge-success' : 'badge-warning'}">
                ${maestria.status ? 'Activo' : 'Inactivo'}
            </span></td>
            <td>
                <button class="btn-sm btn-warning" type="button" onclick="abrirModalEditarMaestria(${maestria.id})">Editar</button>
                <button class="btn-sm btn-danger" type="button" onclick="abrirModalEliminarMaestria(${maestria.id})">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

// ==========================================
// PETICIONES A LA API (CARGA)
// ==========================================
async function cargarEstudiantes() {
    try {
        const response = await fetch('/api/estudiantes');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al cargar estudiantes');
        renderizarEstudiantes(data);
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        if (estudiantesBody) {
            estudiantesBody.innerHTML = '<tr><td colspan="6">No se pudieron cargar los estudiantes.</td></tr>';
        }
    }
}

async function cargarCiclos() {
    try {
        const response = await fetch('/api/ciclos');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al cargar ciclos');
        renderizarCiclos(data);
    } catch (error) {
        console.error('Error al cargar ciclos:', error);
        if (ciclosBody) {
            ciclosBody.innerHTML = '<tr><td colspan="6">No se pudieron cargar los ciclos escolares.</td></tr>';
        }
    }
}

async function cargarMaestrias() {
    try {
        const response = await fetch('/api/maestrias');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al cargar maestrías');
        renderizarMaestrias(data);
    } catch (error) {
        console.error('Error al cargar maestrías:', error);
        if (maestriasBody) {
            maestriasBody.innerHTML = '<tr><td colspan="6">No se pudieron cargar las maestrías.</td></tr>';
        }
    }
}

// ==========================================
// MODAL VER ESTUDIANTE
// ==========================================
window.abrirModalVer = async function(id) {
    try {
        const response = await fetch(`/api/estudiantes/${id}`);
        const estudiante = await response.json();

        if (!response.ok) {
            alert(estudiante.error || 'No se pudieron obtener los datos');
            return;
        }

        document.getElementById('verId').textContent = `#${estudiante.id}`;
        document.getElementById('verNombre').textContent = nombreEstudiante(estudiante) || 'Sin nombre';
        document.getElementById('verSexo').textContent = estudiante.sex || 'No especificado';
        document.getElementById('verGrado').textContent = estudiante.idgrade || 'No asignado';
        document.getElementById('verCURP').textContent = estudiante.CURP || 'N/A';
        document.getElementById('verRFC').textContent = estudiante.RFC || 'N/A';
        document.getElementById('verEstado').textContent = estudiante.status ? 'Activo' : 'Inactivo';

        if (modalVerEstudiante) modalVerEstudiante.classList.remove('hidden');
    } catch (error) {
        console.error('Error al obtener estudiante:', error);
        alert('Error de conexión al cargar la información');
    }
};

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

// ==========================================
// MODAL CREAR / EDITAR ESTUDIANTE
// ==========================================
function cerrarModalEstudiante() {
    if (modalAgregarEstudiante) modalAgregarEstudiante.classList.add('hidden');
    if (formAgregarEstudiante) formAgregarEstudiante.reset();
    editandoEstudianteId = null;
    if (estError) { estError.textContent = ''; estError.classList.remove('show'); }
    if (estSuccess) { estSuccess.textContent = ''; estSuccess.classList.remove('show'); }
}

function abrirModalCrear() {
    cerrarModalEstudiante();
    if (modalEstudianteTitulo) modalEstudianteTitulo.textContent = 'Agregar Estudiante';
    if (modalAgregarEstudiante) modalAgregarEstudiante.classList.remove('hidden');
}

window.abrirModalEditar = async function(id) {
    try {
        const response = await fetch(`/api/estudiantes/${id}`);
        const estudiante = await response.json();

        if (!response.ok) {
            alert(estudiante.error || 'No se pudieron obtener los datos');
            return;
        }

        editandoEstudianteId = id;

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
};

if (btnAgregarEstudiante) btnAgregarEstudiante.addEventListener('click', abrirModalCrear);
if (btnCerrarModalEstudiante) btnCerrarModalEstudiante.addEventListener('click', cerrarModalEstudiante);
if (btnCancelarEstudiante) btnCancelarEstudiante.addEventListener('click', cerrarModalEstudiante);
if (modalAgregarEstudiante) {
    modalAgregarEstudiante.addEventListener('click', (e) => {
        if (e.target === modalAgregarEstudiante) cerrarModalEstudiante();
    });
}

function validarFormularioEstudiante() {
    const nombre = document.getElementById('estNombre').value;
    const primerApellido = document.getElementById('estPrimerApellido').value;
    const segundoApellido = document.getElementById('estSegundoApellido').value;

    const vNombre = validarNombre(nombre, 'El nombre');
    if (!vNombre.valido) return vNombre;

    const vPrimer = validarNombre(primerApellido, 'El primer apellido');
    if (!vPrimer.valido) return vPrimer;

    if (segundoApellido && segundoApellido.trim() !== '') {
        const vSegundo = validarNombre(segundoApellido, 'El segundo apellido');
        if (!vSegundo.valido) return vSegundo;
    }

    return { valido: true };
}

if (formAgregarEstudiante) {
    formAgregarEstudiante.addEventListener('submit', async (e) => {
        e.preventDefault();

        const validacion = validarFormularioEstudiante();
        if (!validacion.valido) {
            if (estError) {
                estError.textContent = validacion.error;
                estError.classList.add('show');
            }
            return;
        }

        const datosEstudiante = {
            name: document.getElementById('estNombre').value.trim(),
            firstlastname: document.getElementById('estPrimerApellido').value.trim(),
            secondlastname: document.getElementById('estSegundoApellido').value.trim(),
            sex: document.getElementById('estSexo').value,
            idgrade: document.getElementById('estGrado').value,
            CURP: document.getElementById('estCURP').value.trim(),
            RFC: document.getElementById('estRFC').value.trim()
        };

        const url = editandoEstudianteId ? `/api/estudiantes/${editandoEstudianteId}` : '/api/estudiantes';
        const metodo = editandoEstudianteId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosEstudiante)
            });

            const data = await response.json();

            if (response.ok) {
                if (estSuccess) {
                    estSuccess.textContent = editandoEstudianteId ? '¡Estudiante actualizado con éxito!' : '¡Estudiante registrado con éxito!';
                    estSuccess.classList.add('show');
                }
                setTimeout(() => {
                    cerrarModalEstudiante();
                    cargarEstudiantes();
                }, 1200);
            } else {
                if (estError) {
                    estError.textContent = data.error || 'Error al guardar los datos';
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

// ==========================================
// MODAL ELIMINAR ESTUDIANTE
// ==========================================
window.abrirModalEliminar = async function(id) {
    estudianteIdAEliminar = id;
    try {
        const response = await fetch(`/api/estudiantes/${id}`);
        const estudiante = await response.json();
        if (response.ok && nombreEstudianteEliminar) {
            nombreEstudianteEliminar.textContent = nombreEstudiante(estudiante);
        }
    } catch (e) {
        if (nombreEstudianteEliminar) nombreEstudianteEliminar.textContent = `#${id}`;
    }
    if (modalEliminar) modalEliminar.classList.remove('hidden');
};

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

// ==========================================
// MODAL CREAR / EDITAR CICLO ESCOLAR
// ==========================================
function cerrarModalCiclo() {
    if (modalAgregarCiclo) modalAgregarCiclo.classList.add('hidden');
    if (formAgregarCiclo) formAgregarCiclo.reset();
    editandoCicloId = null;
    if (cicloError) { cicloError.textContent = ''; cicloError.classList.remove('show'); }
    if (cicloSuccess) { cicloSuccess.textContent = ''; cicloSuccess.classList.remove('show'); }
}

function abrirModalCrearCiclo() {
    cerrarModalCiclo();
    if (modalAgregarCiclo) {
        const titulo = modalAgregarCiclo.querySelector('h3');
        if (titulo) titulo.textContent = 'Agregar Ciclo Escolar';
        modalAgregarCiclo.classList.remove('hidden');
    }
}

window.abrirModalEditarCiclo = async function(id) {
    try {
        const response = await fetch(`/api/ciclos/${id}`);
        const ciclo = await response.json();

        if (!response.ok) {
            alert(ciclo.error || 'No se pudieron obtener los datos del ciclo');
            return;
        }

        editandoCicloId = id;

        document.getElementById('cicloNombre').value = ciclo.name || '';
        if (ciclo.initialdate) document.getElementById('cicloAnioInicio').value = new Date(ciclo.initialdate).getFullYear();
        if (ciclo.finaldate) document.getElementById('cicloAnioFin').value = new Date(ciclo.finaldate).getFullYear();
        const descEl = document.getElementById('cicloDescripcion');
        if (descEl) descEl.value = ciclo.description || ciclo.descripcion || '';

        if (modalAgregarCiclo) {
            const titulo = modalAgregarCiclo.querySelector('h3');
            if (titulo) titulo.textContent = 'Editar Ciclo Escolar';
            modalAgregarCiclo.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al obtener ciclo:', error);
        alert('Error de conexión al cargar el ciclo');
    }
};

if (btnAgregarCiclo) btnAgregarCiclo.addEventListener('click', abrirModalCrearCiclo);
if (btnCerrarModalCiclo) btnCerrarModalCiclo.addEventListener('click', cerrarModalCiclo);
if (btnCancelarCiclo) btnCancelarCiclo.addEventListener('click', cerrarModalCiclo);
if (modalAgregarCiclo) {
    modalAgregarCiclo.addEventListener('click', (e) => {
        if (e.target === modalAgregarCiclo) cerrarModalCiclo();
    });
}

if (formAgregarCiclo) {
    formAgregarCiclo.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('cicloNombre').value.trim();
        const anioInicio = document.getElementById('cicloAnioInicio').value;
        const anioFin = document.getElementById('cicloAnioFin').value;
        const descEl = document.getElementById('cicloDescripcion');

        if (!nombre) {
            cicloError.textContent = 'El nombre del ciclo es requerido';
            cicloError.classList.add('show');
            return;
        }

        if (!anioInicio || !anioFin) {
            cicloError.textContent = 'Los años de inicio y fin son requeridos';
            cicloError.classList.add('show');
            return;
        }

        if (parseInt(anioFin) <= parseInt(anioInicio)) {
            cicloError.textContent = 'El año de fin debe ser mayor al año de inicio';
            cicloError.classList.add('show');
            return;
        }

        const datosCiclo = {
            name: nombre,
            initialdate: `${anioInicio}-01-01`,
            finaldate: `${anioFin}-12-31`,
            description: descEl ? descEl.value.trim() : ''
        };

        const url = editandoCicloId ? `/api/ciclos/${editandoCicloId}` : '/api/ciclos';
        const metodo = editandoCicloId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosCiclo)
            });

            const data = await response.json();

            if (response.ok) {
                cicloSuccess.textContent = editandoCicloId ? '¡Ciclo actualizado con éxito!' : '¡Ciclo registrado con éxito!';
                cicloSuccess.classList.add('show');

                setTimeout(() => {
                    cerrarModalCiclo();
                    cargarCiclos();
                }, 1200);
            } else {
                cicloError.textContent = data.error || 'Error al guardar el ciclo';
                cicloError.classList.add('show');
            }
        } catch (error) {
            console.error('Error:', error);
            cicloError.textContent = 'Error de conexión con el servidor';
            cicloError.classList.add('show');
        }
    });
}

// ==========================================
// MODAL ELIMINAR CICLO ESCOLAR
// ==========================================
window.abrirModalEliminarCiclo = async function(id) {
    cicloIdAEliminar = id;
    if (confirm(`¿Estás seguro de que deseas eliminar este ciclo escolar?`)) {
        eliminarCiclo(id);
    }
};

async function eliminarCiclo(id) {
    try {
        const response = await fetch(`/api/ciclos/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
            cargarCiclos();
        } else {
            alert(`Error: ${data.error || 'No se pudo eliminar el ciclo'}`);
        }
    } catch (error) {
        console.error('Error al eliminar ciclo:', error);
        alert('Ocurrió un error de conexión al intentar eliminar.');
    }
}

// ==========================================
// MODAL CREAR / EDITAR MAESTRÍA
// ==========================================
function cerrarModalMaestria() {
    if (modalAgregarMaestria) modalAgregarMaestria.classList.add('hidden');
    if (formAgregarMaestria) formAgregarMaestria.reset();
    editandoMaestriaId = null;
    if (maestriaError) { maestriaError.textContent = ''; maestriaError.classList.remove('show'); }
    if (maestriaSuccess) { maestriaSuccess.textContent = ''; maestriaSuccess.classList.remove('show'); }
}

function abrirModalCrearMaestria() {
    cerrarModalMaestria();
    if (modalAgregarMaestria) {
        const titulo = modalAgregarMaestria.querySelector('h3');
        if (titulo) titulo.textContent = 'Agregar Maestría';
        modalAgregarMaestria.classList.remove('hidden');
    }
}

window.abrirModalEditarMaestria = async function(id) {
    try {
        const response = await fetch(`/api/maestrias/${id}`);
        const maestria = await response.json();

        if (!response.ok) {
            alert(maestria.error || 'No se pudieron obtener los datos de la maestría');
            return;
        }

        editandoMaestriaId = id;

        document.getElementById('maestriaNombre').value = maestria.name || '';
        document.getElementById('maestriaDescripcion').value = maestria.description || '';
        document.getElementById('maestriaDuracion').value = maestria.duration || '';
        const creditosEl = document.getElementById('maestriaCreditos');
        if (creditosEl) creditosEl.value = maestria.credits || '';

        if (modalAgregarMaestria) {
            const titulo = modalAgregarMaestria.querySelector('h3');
            if (titulo) titulo.textContent = 'Editar Maestría';
            modalAgregarMaestria.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al obtener maestría:', error);
        alert('Error de conexión al cargar la maestría');
    }
};

if (btnAgregarMaestria) btnAgregarMaestria.addEventListener('click', abrirModalCrearMaestria);
if (btnCerrarModalMaestria) btnCerrarModalMaestria.addEventListener('click', cerrarModalMaestria);
if (btnCancelarMaestria) btnCancelarMaestria.addEventListener('click', cerrarModalMaestria);
if (modalAgregarMaestria) {
    modalAgregarMaestria.addEventListener('click', (e) => {
        if (e.target === modalAgregarMaestria) cerrarModalMaestria();
    });
}

if (formAgregarMaestria) {
    formAgregarMaestria.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('maestriaNombre').value.trim();
        const descripcion = document.getElementById('maestriaDescripcion').value.trim();
        const duracion = document.getElementById('maestriaDuracion').value;
        const creditosEl = document.getElementById('maestriaCreditos');
        const creditos = creditosEl ? creditosEl.value : '';

        if (!nombre) {
            maestriaError.textContent = 'El nombre de la maestría es requerido';
            maestriaError.classList.add('show');
            return;
        }

        if (!duracion || parseInt(duracion, 10) < 1) {
            maestriaError.textContent = 'La duración en semestres es requerida y debe ser mayor a 0';
            maestriaError.classList.add('show');
            return;
        }

        const datosMaestria = {
            name: nombre,
            description: descripcion,
            duration: parseInt(duracion, 10),
            credits: creditos ? parseInt(creditos, 10) : null
        };

        const url = editandoMaestriaId ? `/api/maestrias/${editandoMaestriaId}` : '/api/maestrias';
        const metodo = editandoMaestriaId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosMaestria)
            });

            const data = await response.json();

            if (response.ok) {
                maestriaSuccess.textContent = editandoMaestriaId ? '¡Maestría actualizada con éxito!' : '¡Maestría registrada con éxito!';
                maestriaSuccess.classList.add('show');

                setTimeout(() => {
                    cerrarModalMaestria();
                    cargarMaestrias();
                }, 1200);
            } else {
                maestriaError.textContent = data.error || 'Error al guardar la maestría';
                maestriaError.classList.add('show');
            }
        } catch (error) {
            console.error('Error:', error);
            maestriaError.textContent = 'Error de conexión con el servidor';
            maestriaError.classList.add('show');
        }
    });
}

// ==========================================
// ELIMINAR MAESTRÍA
// ==========================================
window.abrirModalEliminarMaestria = async function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta maestría?')) {
        eliminarMaestria(id);
    }
};

async function eliminarMaestria(id) {
    try {
        const response = await fetch(`/api/maestrias/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
            cargarMaestrias();
        } else {
            alert(`Error: ${data.error || 'No se pudo eliminar la maestría'}`);
        }
    } catch (error) {
        console.error('Error al eliminar maestría:', error);
        alert('Ocurrió un error de conexión al intentar eliminar.');
    }
}

// ==========================================
// SESIÓN Y NAVEGACIÓN
// ==========================================
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
    const userInitial = (usuario.login || 'U').charAt(0).toUpperCase();
    const userRole = usuario.iduser === 0 ? 'Estudiante' : 'Docente';

    const elInitial = document.getElementById('userInitial');
    const elName = document.getElementById('userName');
    const elRole = document.getElementById('userRole');
    const elWelcome = document.getElementById('welcomeName');
    const elProfileLogin = document.getElementById('profileLogin');
    const elProfileId = document.getElementById('profileId');
    const elProfileStatus = document.getElementById('profileStatus');

    if (elInitial) elInitial.textContent = userInitial;
    if (elName) elName.textContent = usuario.login;
    if (elRole) elRole.textContent = userRole;
    if (elWelcome) elWelcome.textContent = usuario.login;
    if (elProfileLogin) elProfileLogin.textContent = usuario.login;
    if (elProfileId) elProfileId.textContent = usuario.id;
    if (elProfileStatus) elProfileStatus.textContent = usuario.status === 1 ? 'Activo' : 'Inactivo';
}

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        if (sidebar) sidebar.classList.toggle('active');
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
            } else if (sectionId === 'ciclosescolares') {
                cargarCiclos();
            } else if (sectionId === 'maestrias') {
                cargarMaestrias();
            }

            const titleEl = document.getElementById('pageTitle');
            if (titleEl) titleEl.textContent = link.textContent.trim().toUpperCase();
        }

        if (sidebar) sidebar.classList.remove('active');
    });
});

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('usuarioActual');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    });
}

// ==========================================
// MODAL CAMBIAR CONTRASEÑA
// ==========================================
if (btnCambiarContraseña) {
    btnCambiarContraseña.addEventListener('click', () => {
        if (modal) modal.classList.remove('hidden');
        limpiarFormularioPassword();
    });
}

if (btnCerrarModal) btnCerrarModal.addEventListener('click', () => modal && modal.classList.add('hidden'));
if (btnCancelar) btnCancelar.addEventListener('click', () => modal && modal.classList.add('hidden'));

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

function limpiarFormularioPassword() {
    if (formCambiarContraseña) formCambiarContraseña.reset();
    [passwordActualError, passwordNuevaError, confirmPasswordError, formError, successMessage].forEach(el => {
        if (el) {
            el.textContent = '';
            el.classList.remove('show');
        }
    });
}

function validarFormularioCambiarContraseña() {
    limpiarFormularioPassword();
    let esValido = true;

    if (!passwordActualInput || !passwordActualInput.value) {
        if (passwordActualError) { passwordActualError.textContent = 'La contraseña actual es requerida'; passwordActualError.classList.add('show'); }
        esValido = false;
    }

    if (!passwordNuevaInput || !passwordNuevaInput.value) {
        if (passwordNuevaError) { passwordNuevaError.textContent = 'La nueva contraseña es requerida'; passwordNuevaError.classList.add('show'); }
        esValido = false;
    } else if (passwordNuevaInput.value.length < 6) {
        if (passwordNuevaError) { passwordNuevaError.textContent = 'La contraseña debe tener al menos 6 caracteres'; passwordNuevaError.classList.add('show'); }
        esValido = false;
    }

    if (!confirmPasswordInput || !confirmPasswordInput.value) {
        if (confirmPasswordError) { confirmPasswordError.textContent = 'Debes confirmar tu contraseña'; confirmPasswordError.classList.add('show'); }
        esValido = false;
    } else if (passwordNuevaInput.value !== confirmPasswordInput.value) {
        if (confirmPasswordError) { confirmPasswordError.textContent = 'Las contraseñas no coinciden'; confirmPasswordError.classList.add('show'); }
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
                if (successMessage) { successMessage.textContent = '¡Contraseña actualizada correctamente!'; successMessage.classList.add('show'); }
                setTimeout(() => {
                    if (modal) modal.classList.add('hidden');
                    limpiarFormularioPassword();
                }, 2000);
            } else {
                if (formError) { formError.textContent = data.error || 'Error al actualizar la contraseña'; formError.classList.add('show'); }
            }
        } catch (error) {
            console.error('Error:', error);
            if (formError) { formError.textContent = 'Error de conexión'; formError.classList.add('show'); }
        }
    });
}

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
});
