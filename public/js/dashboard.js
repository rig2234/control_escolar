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

// MODAL UNIFICADO DE ELIMINACIÓN
const modalEliminar = document.getElementById('modalConfirmarEliminar') || document.getElementById('modalEliminarEstudiante');
const btnCerrarModalEliminar = document.getElementById('btnCerrarModalEliminar');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
const nombreItemEliminar = document.getElementById('nombreItemEliminar') || document.getElementById('nombreEstudianteEliminar');
const textoModalEliminar = document.getElementById('textoModalEliminar');
const textoBtnConfirmarEliminar = document.getElementById('textoBtnConfirmarEliminar');

// Modal Ciclos Escolares
const btnAgregarCiclo = document.getElementById('btnAgregarCiclo');
const modalAgregarCiclo = document.getElementById('modalAgregarCiclo');
const btnCerrarModalCiclo = document.getElementById('btnCerrarModalCiclo');
const btnCancelarCiclo = document.getElementById('btnCancelarCiclo');
const formAgregarCiclo = document.getElementById('formAgregarCiclo');
const cicloError = document.getElementById('cicloError');
const cicloSuccess = document.getElementById('cicloSuccess');
const ciclosBody = document.getElementById('ciclosBody');

// Modal Materias / Cursos (courses)
const btnAgregarMateria = document.getElementById('btnAgregarMateria');
const modalAgregarMateria = document.getElementById('modalAgregarMateria');
const btnCerrarModalMateria = document.getElementById('btnCerrarModalMateria');
const btnCancelarMateria = document.getElementById('btnCancelarMateria');
const formAgregarMateria = document.getElementById('formAgregarMateria');
const materiaError = document.getElementById('materiaError');
const materiaSuccess = document.getElementById('materiaSuccess');
const materiasBody = document.getElementById('materiasBody');

// ==========================================
// ESTADO GLOBAL
// ==========================================
let elementoAEliminar = { id: null, tipo: null };
let editandoEstudianteId = null;
let editandoCicloId = null;
let editandoMateriaId = null;

// Estado para Navegación Progresiva en Ciclos
let cicloSeleccionado = null;
let carreraSeleccionada = null;

// ==========================================
// MODAL INSCRIBIR ESTUDIANTE A CICLO / CARRERA
// ==========================================
const btnInscribirEstudianteCiclo = document.getElementById('btnInscribirEstudianteCiclo');
const modalInscribirEstudianteCiclo = document.getElementById('modalInscribirEstudianteCiclo');
const btnCerrarModalInscribir = document.getElementById('btnCerrarModalInscribir');
const btnCancelarInscribir = document.getElementById('btnCancelarInscribir');
const formInscribirEstudianteCiclo = document.getElementById('formInscribirEstudianteCiclo');
const inscripcionError = document.getElementById('inscripcionError');
const inscripcionSuccess = document.getElementById('inscripcionSuccess');

function cerrarModalInscribir() {
    if (modalInscribirEstudianteCiclo) modalInscribirEstudianteCiclo.classList.add('hidden');
    if (formInscribirEstudianteCiclo) formInscribirEstudianteCiclo.reset();
    if (inscripcionError) { inscripcionError.textContent = ''; inscripcionError.classList.remove('show'); }
    if (inscripcionSuccess) { inscripcionSuccess.textContent = ''; inscripcionSuccess.classList.remove('show'); }
}

async function abrirModalInscribir() {
    if (!cicloSeleccionado || !carreraSeleccionada) {
        alert('Por favor, asegúrate de seleccionar un ciclo y una carrera primero.');
        return;
    }

    document.getElementById('inscripcionCicloNombre').value = cicloSeleccionado.name;
    document.getElementById('inscripcionCarreraNombre').value = carreraSeleccionada.name;

    // Cargar la lista general de estudiantes disponibles
    const selectEstudiante = document.getElementById('inscripcionEstudianteSelect');
    selectEstudiante.innerHTML = '<option value="">Cargando estudiantes...</option>';

    try {
        const response = await fetch('/api/estudiantes');
        const estudiantes = await response.json();

        if (response.ok && estudiantes.length) {
            selectEstudiante.innerHTML = '<option value="">Seleccionar estudiante...</option>' +
                estudiantes.map(e => `<option value="${e.id}">${escaparHtml(nombreEstudiante(e))}</option>`).join('');
        } else {
            selectEstudiante.innerHTML = '<option value="">No hay estudiantes disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        selectEstudiante.innerHTML = '<option value="">Error al cargar la lista</option>';
    }

    if (modalInscribirEstudianteCiclo) {
        modalInscribirEstudianteCiclo.classList.remove('hidden');
    }
}

// Listeners para abrir y cerrar el modal
if (btnInscribirEstudianteCiclo) btnInscribirEstudianteCiclo.addEventListener('click', abrirModalInscribir);
if (btnCerrarModalInscribir) btnCerrarModalInscribir.addEventListener('click', cerrarModalInscribir);
if (btnCancelarInscribir) btnCancelarInscribir.addEventListener('click', cerrarModalInscribir);

if (modalInscribirEstudianteCiclo) {
    modalInscribirEstudianteCiclo.addEventListener('click', (e) => {
        if (e.target === modalInscribirEstudianteCiclo) cerrarModalInscribir();
    });
}

// Guardar la inscripción enviando a la API
if (formInscribirEstudianteCiclo) {
    formInscribirEstudianteCiclo.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectEstudiante = document.getElementById('inscripcionEstudianteSelect');
        const idEstudiante = selectEstudiante ? selectEstudiante.value : null;

        // Validaciones en Frontend
        if (!cicloSeleccionado || !cicloSeleccionado.id) {
            if (inscripcionError) {
                inscripcionError.textContent = 'Por favor selecciona un ciclo escolar válido.';
                inscripcionError.classList.add('show');
            }
            return;
        }

        if (!carreraSeleccionada || !carreraSeleccionada.id) {
            if (inscripcionError) {
                inscripcionError.textContent = 'Debe seleccionar una materia/carrera del ciclo.';
                inscripcionError.classList.add('show');
            }
            return;
        }

        if (!idEstudiante) {
            if (inscripcionError) {
                inscripcionError.textContent = 'Por favor selecciona un estudiante.';
                inscripcionError.classList.add('show');
            }
            return;
        }

        // Construir el payload adaptado al controlador (idstudent, idcycle, idgrade)
        const datosInscripcion = {
            idstudent: parseInt(idEstudiante, 10),
            idcycle: parseInt(cicloSeleccionado.id, 10),
            idgrade: parseInt(carreraSeleccionada.id, 10) // <--- CAMBIO AQUÍ: Usar idgrade
        };

        try {
            const response = await fetch('/api/inscripciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosInscripcion)
            });

            const data = await response.json();

            if (response.ok) {
                if (inscripcionSuccess) {
                    inscripcionSuccess.textContent = '¡Estudiante inscrito con éxito!';
                    inscripcionSuccess.classList.add('show');
                }
                if (inscripcionError) {
                    inscripcionError.textContent = '';
                    inscripcionError.classList.remove('show');
                }
                setTimeout(() => {
                    cerrarModalInscribir();
                    cargarEstudiantesCicloCarrera(cicloSeleccionado.id, carreraSeleccionada.id);
                }, 1200);
            } else {
                if (inscripcionError) {
                    inscripcionError.textContent = data.error || 'Error al inscribir al estudiante.';
                    inscripcionError.classList.add('show');
                }
            }
        } catch (error) {
            console.error('Error al guardar inscripción:', error);
            if (inscripcionError) {
                inscripcionError.textContent = 'Error de conexión con el servidor.';
                inscripcionError.classList.add('show');
            }
        }
    });
}

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
// NAVEGACIÓN PROGRESIVA EN CICLOS ESCOLARES
// ==========================================

// Paso 1 -> Paso 2: Seleccionar un Ciclo Escolar
window.seleccionarCiclo = async function(idCiclo, nombreCiclo) {
    cicloSeleccionado = { id: idCiclo, name: nombreCiclo };
    
    const labelCiclo = document.getElementById('selectedCicloText');
    if (labelCiclo) labelCiclo.textContent = nombreCiclo;
    
    const pasoCiclos = document.getElementById('pasoCiclos');
    const pasoCarreras = document.getElementById('pasoCarreras');
    if (pasoCiclos) { pasoCiclos.classList.remove('active'); pasoCiclos.classList.add('hidden'); }
    if (pasoCarreras) { pasoCarreras.classList.remove('hidden'); pasoCarreras.classList.add('active'); }

    const step1Btn = document.getElementById('step1Btn');
    const step2Btn = document.getElementById('step2Btn');
    if (step1Btn) step1Btn.classList.remove('active');
    if (step2Btn) { step2Btn.classList.remove('disabled'); step2Btn.classList.add('active'); }

    await cargarCarrerasDelCiclo(idCiclo);
};

// Cargar Materias/Cursos desde la tabla "courses" para el Paso 2
async function cargarCarrerasDelCiclo(idCiclo) {
    const container = document.getElementById('carrerasCicloContainer');
    if (!container) return;
    container.innerHTML = '<p>Cargando materias/cursos...</p>';

    try {
        const response = await fetch('/api/materias');
        const materias = await response.json();

        if (!response.ok || !materias.length) {
            container.innerHTML = '<p>No hay materias disponibles.</p>';
            return;
        }

        container.innerHTML = materias.map(m => `
            <div class="carrera-card-select" onclick="seleccionarCarrera(${m.id}, '${escaparHtml(m.name)}')">
                <h4 style="color: var(--primary); font-size: 16px; margin-bottom: 6px;">${escaparHtml(m.name)}</h4>
                <p style="font-size: 13px; color: var(--text-light);">${escaparHtml(m.description || 'Sin descripción')}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar materias:', error);
        container.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
}

// Paso 2 -> Paso 3: Seleccionar una Materia/Curso
window.seleccionarCarrera = async function(idCarrera, nombreCarrera) {
    carreraSeleccionada = { id: idCarrera, name: nombreCarrera };
    
    const labelCarrera = document.getElementById('selectedCarreraText');
    if (labelCarrera) labelCarrera.textContent = nombreCarrera;

    const pasoCarreras = document.getElementById('pasoCarreras');
    const pasoEstudiantes = document.getElementById('pasoEstudiantes');
    if (pasoCarreras) { pasoCarreras.classList.remove('active'); pasoCarreras.classList.add('hidden'); }
    if (pasoEstudiantes) { pasoEstudiantes.classList.remove('hidden'); pasoEstudiantes.classList.add('active'); }

    const step2Btn = document.getElementById('step2Btn');
    const step3Btn = document.getElementById('step3Btn');
    if (step2Btn) step2Btn.classList.remove('active');
    if (step3Btn) { step3Btn.classList.remove('disabled'); step3Btn.classList.add('active'); }

    await cargarEstudiantesCicloCarrera(cicloSeleccionado.id, carreraSeleccionada.id);
};

// Cargar alumnos inscritos para el Paso 3
async function cargarEstudiantesCicloCarrera(idCiclo, idCarrera) {
    const body = document.getElementById('estudiantesCicloBody');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="5">Cargando alumnos inscritos...</td></tr>';

    try {
        const response = await fetch(`/api/estudiantes?ciclo=${idCiclo}&carrera=${idCarrera}`);
        const estudiantes = await response.json();

        if (!response.ok || !estudiantes.length) {
            body.innerHTML = '<tr><td colspan="5">No hay estudiantes inscritos en esta materia para el ciclo seleccionado.</td></tr>';
            return;
        }

        body.innerHTML = estudiantes.map(est => `
            <tr>
                <td>#${escaparHtml(est.id)}</td>
                <td>${escaparHtml(nombreEstudiante(est))}</td>
                <td>${escaparHtml(est.CURP || 'N/A')}</td>
                <td><span class="badge badge-success">Inscrito</span></td>
                <td>
                    <button class="btn-sm btn-info" onclick="abrirModalVer(${est.id})">Ver</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        body.innerHTML = '<tr><td colspan="5">Error al cargar la lista de estudiantes.</td></tr>';
    }
}

// Control de retroceso en el Stepper
window.volverPaso = function(paso) {
    const pasoCiclos = document.getElementById('pasoCiclos');
    const pasoCarreras = document.getElementById('pasoCarreras');
    const pasoEstudiantes = document.getElementById('pasoEstudiantes');
    const step1Btn = document.getElementById('step1Btn');
    const step2Btn = document.getElementById('step2Btn');
    const step3Btn = document.getElementById('step3Btn');

    if (paso === 1) {
        cicloSeleccionado = null;
        carreraSeleccionada = null;
        
        const labelCiclo = document.getElementById('selectedCicloText');
        const labelCarrera = document.getElementById('selectedCarreraText');
        if (labelCiclo) labelCiclo.textContent = 'Ninguno';
        if (labelCarrera) labelCarrera.textContent = 'Ninguna';

        if (pasoCarreras) { pasoCarreras.classList.remove('active'); pasoCarreras.classList.add('hidden'); }
        if (pasoEstudiantes) { pasoEstudiantes.classList.remove('active'); pasoEstudiantes.classList.add('hidden'); }
        if (pasoCiclos) { pasoCiclos.classList.remove('hidden'); pasoCiclos.classList.add('active'); }

        if (step1Btn) step1Btn.classList.add('active');
        if (step2Btn) { step2Btn.classList.remove('active'); step2Btn.classList.add('disabled'); }
        if (step3Btn) { step3Btn.classList.remove('active'); step3Btn.classList.add('disabled'); }
    } else if (paso === 2 && cicloSeleccionado) {
        carreraSeleccionada = null;
        
        const labelCarrera = document.getElementById('selectedCarreraText');
        if (labelCarrera) labelCarrera.textContent = 'Ninguna';

        if (pasoEstudiantes) { pasoEstudiantes.classList.remove('active'); pasoEstudiantes.classList.add('hidden'); }
        if (pasoCarreras) { pasoCarreras.classList.remove('hidden'); pasoCarreras.classList.add('active'); }

        if (step2Btn) step2Btn.classList.add('active');
        if (step3Btn) { step3Btn.classList.remove('active'); step3Btn.classList.add('disabled'); }
    }
};

// ==========================================
// CONTROL DEL MODAL UNIFICADO DE ELIMINACIÓN
// ==========================================
function mostrarModalEliminar(id, tipo, nombreMostrar = '') {
    elementoAEliminar = { id, tipo };

    const titulosUnidades = {
        estudiantes: 'estudiante',
        ciclos: 'ciclo escolar',
        materias: 'materia'
    };

    const unidadTexto = titulosUnidades[tipo] || 'registro';

    if (textoModalEliminar) {
        textoModalEliminar.textContent = `¿Estás seguro de que deseas eliminar este ${unidadTexto}?`;
    }
    if (nombreItemEliminar) {
        nombreItemEliminar.textContent = nombreMostrar || `#${id}`;
    }
    if (textoBtnConfirmarEliminar) {
        textoBtnConfirmarEliminar.textContent = `Eliminar ${unidadTexto.charAt(0).toUpperCase() + unidadTexto.slice(1)}`;
    }

    if (modalEliminar) {
        modalEliminar.classList.remove('hidden');
    }
}

function cerrarModalEliminar() {
    if (modalEliminar) modalEliminar.classList.add('hidden');
    elementoAEliminar = { id: null, tipo: null };
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
        const { id, tipo } = elementoAEliminar;
        if (!id || !tipo) return;

        try {
            const response = await fetch(`/api/${tipo}/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                cerrarModalEliminar();
                if (tipo === 'estudiantes') cargarEstudiantes();
                else if (tipo === 'ciclos') cargarCiclos();
                else if (tipo === 'materias') cargarMaterias();
            } else {
                alert(`Error: ${data.error || 'No se pudo eliminar el registro'}`);
            }
        } catch (error) {
            console.error(`Error al eliminar ${tipo}:`, error);
            alert('Ocurrió un error de conexión al intentar eliminar.');
        }
    });
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
            <td>${escaparHtml(estudiante.gradeName || estudiante.idgrade || '-')}</td>
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
            <td><strong>${escaparHtml(ciclo.name)}</strong></td>
            <td>${fechaInicio}</td>
            <td>${fechaFin}</td>
            <td><span class="badge ${ciclo.status ? 'badge-success' : 'badge-warning'}">
                ${ciclo.status ? 'Activo' : 'Inactivo'}
            </span></td>
            <td>
                <button class="btn-sm btn-primary" type="button" onclick="seleccionarCiclo(${ciclo.id}, '${escaparHtml(ciclo.name)}')">Seleccionar →</button>
                <button class="btn-sm btn-warning" type="button" onclick="abrirModalEditarCiclo(${ciclo.id})">Editar</button>
                <button class="btn-sm btn-danger" type="button" onclick="abrirModalEliminarCiclo(${ciclo.id})">Eliminar</button>
            </td>
        </tr>`;
    }).join('');
}

function renderizarMaterias(materias) {
    if (!materiasBody) return;
    if (!materias || !materias.length) {
        materiasBody.innerHTML = '<tr><td colspan="5">No hay materias registradas.</td></tr>';
        return;
    }

    materiasBody.innerHTML = materias.map(materia => `
        <tr>
            <td>#${escaparHtml(materia.id)}</td>
            <td>${escaparHtml(materia.name)}</td>
            <td>${escaparHtml(materia.description || '-')}</td>
            <td><span class="badge ${materia.status === 1 || materia.status === true ? 'badge-success' : 'badge-warning'}">
                ${materia.status === 1 || materia.status === true ? 'Activa' : 'Inactiva'}
            </span></td>
            <td>
                <button class="btn-sm btn-warning" type="button" onclick="abrirModalEditarMateria(${materia.id})">Editar</button>
                <button class="btn-sm btn-danger" type="button" onclick="abrirModalEliminarMateria(${materia.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// ==========================================
// PETICIONES A LA API (CARGA DE DATOS)
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

async function cargarMaterias() {
    try {
        const response = await fetch('/api/materias');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al cargar materias');
        renderizarMaterias(data);
    } catch (error) {
        console.error('Error al cargar materias:', error);
        if (materiasBody) {
            materiasBody.innerHTML = '<tr><td colspan="5">No se pudieron cargar las materias.</td></tr>';
        }
    }
}

// ==========================================
// ACCIONES DE ELIMINACIÓN POR MÓDULO
// ==========================================
window.abrirModalEliminar = async function(id) {
    let nombre = `#${id}`;
    try {
        const response = await fetch(`/api/estudiantes/${id}`);
        const estudiante = await response.json();
        if (response.ok) nombre = nombreEstudiante(estudiante);
    } catch (e) {}
    mostrarModalEliminar(id, 'estudiantes', nombre);
};

window.abrirModalEliminarCiclo = async function(id) {
    let nombre = `#${id}`;
    try {
        const response = await fetch(`/api/ciclos/${id}`);
        const ciclo = await response.json();
        if (response.ok) nombre = ciclo.name;
    } catch (e) {}
    mostrarModalEliminar(id, 'ciclos', nombre);
};

window.abrirModalEliminarMateria = async function(id) {
    let nombre = `#${id}`;
    try {
        const response = await fetch(`/api/materias/${id}`);
        const materia = await response.json();
        if (response.ok) nombre = materia.name;
    } catch (e) {}
    mostrarModalEliminar(id, 'materias', nombre);
};

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
        document.getElementById('verGrado').textContent = estudiante.gradeName || estudiante.idgrade || 'No asignado';
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

async function abrirModalCrear() {
    cerrarModalEstudiante();
    await cargarGradosEnSelect();
    if (modalEstudianteTitulo) modalEstudianteTitulo.textContent = 'Agregar Estudiante';
    if (modalAgregarEstudiante) modalAgregarEstudiante.classList.remove('hidden');
}

let gradosCache = null;
async function cargarGradosEnSelect() {
    const select = document.getElementById('estGrado');
    if (!select) return;

    try {
        if (!gradosCache) {
            const response = await fetch('/api/grados');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al cargar grados');
            gradosCache = Array.isArray(data) ? data : [];
        }

        const valorActual = select.value;
        select.innerHTML = '<option value="">Seleccionar grado...</option>' +
            gradosCache.map(g => `<option value="${escaparHtml(g.id)}">${escaparHtml(g.name)}</option>`).join('');
        select.value = valorActual;
    } catch (error) {
        console.error('Error al cargar grados en el select:', error);
    }
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
        await cargarGradosEnSelect();
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
// MODAL CREAR / EDITAR MATERIA (courses)
// ==========================================
function cerrarModalMateria() {
    if (modalAgregarMateria) modalAgregarMateria.classList.add('hidden');
    if (formAgregarMateria) formAgregarMateria.reset();
    editandoMateriaId = null;
    if (materiaError) { materiaError.textContent = ''; materiaError.classList.remove('show'); }
    if (materiaSuccess) { materiaSuccess.textContent = ''; materiaSuccess.classList.remove('show'); }
}

function abrirModalCrearMateria() {
    cerrarModalMateria();
    if (modalAgregarMateria) {
        const titulo = modalAgregarMateria.querySelector('h3');
        if (titulo) titulo.textContent = 'Agregar Materia';
        modalAgregarMateria.classList.remove('hidden');
    }
}

window.abrirModalEditarMateria = async function(id) {
    try {
        const response = await fetch(`/api/materias/${id}`);
        const materia = await response.json();

        if (!response.ok) {
            alert(materia.error || 'No se pudieron obtener los datos de la materia');
            return;
        }

        editandoMateriaId = id;
        document.getElementById('materiaNombre').value = materia.name || '';
        
        const descEl = document.getElementById('materiaDescripcion');
        if (descEl) descEl.value = materia.description || '';

        if (modalAgregarMateria) {
            const titulo = modalAgregarMateria.querySelector('h3');
            if (titulo) titulo.textContent = 'Editar Materia';
            modalAgregarMateria.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al obtener materia:', error);
        alert('Error de conexión al cargar la materia');
    }
};

if (btnAgregarMateria) btnAgregarMateria.addEventListener('click', abrirModalCrearMateria);
if (btnCerrarModalMateria) btnCerrarModalMateria.addEventListener('click', cerrarModalMateria);
if (btnCancelarMateria) btnCancelarMateria.addEventListener('click', cerrarModalMateria);
if (modalAgregarMateria) {
    modalAgregarMateria.addEventListener('click', (e) => {
        if (e.target === modalAgregarMateria) cerrarModalMateria();
    });
}

if (formAgregarMateria) {
    formAgregarMateria.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('materiaNombre').value.trim();
        const descEl = document.getElementById('materiaDescripcion');
        const descripcion = descEl ? descEl.value.trim() : '';

        if (!nombre) {
            materiaError.textContent = 'El nombre de la materia es requerido';
            materiaError.classList.add('show');
            return;
        }

        const datosMateria = { 
            name: nombre,
            description: descripcion 
        };

        const url = editandoMateriaId ? `/api/materias/${editandoMateriaId}` : '/api/materias';
        const metodo = editandoMateriaId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosMateria)
            });
            const data = await response.json();

            if (response.ok) {
                materiaSuccess.textContent = editandoMateriaId ? '¡Materia actualizada con éxito!' : '¡Materia registrada con éxito!';
                materiaSuccess.classList.add('show');
                setTimeout(() => {
                    cerrarModalMateria();
                    cargarMaterias();
                }, 1200);
            } else {
                materiaError.textContent = data.error || 'Error al guardar la materia';
                materiaError.classList.add('show');
            }
        } catch (error) {
            console.error('Error:', error);
            materiaError.textContent = 'Error de conexión con el servidor';
            materiaError.classList.add('show');
        }
    });
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
                volverPaso(1);
                cargarCiclos();
            } else if (sectionId === 'materias') {
                cargarMaterias();
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