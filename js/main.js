/* =========================================================
   Evidencia GA7-220501096-AA5-EV01
   Archivo : js/main.js
   Descripción: lógica del lado del cliente. Valida los datos
   ingresados y consume los servicios web PHP de registro e
   inicio de sesión (api/login.php y api/registro.php).

   Incluye:
     - Botón "ojito" para mostrar u ocultar la contraseña.
     - Medidor de fuerza (débil / media / fuerte) con colores.
     - Verificación en vivo de los requisitos de la contraseña.

   Índice de secciones:
     1. Configuración y referencias al DOM
     2. Alternancia entre formularios
     3. Botones "ojito" (ver contraseña)
     4. Medidor de fuerza y requisitos
     5. Envío del formulario de inicio de sesión
     6. Envío del formulario de registro
     7. Funciones auxiliares
========================================================= */

/* ============ 1. Configuración y referencias al DOM ============ */

// Rutas de los servicios web (endpoints PHP)
const SERVICIOS = {
    login: 'api/login.php',
    registro: 'api/registro.php'
};

// Longitud mínima exigida a la contraseña
const LONGITUD_MINIMA = 8;

const tarjeta = document.getElementById('tarjeta');
const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const btnAlternar = document.getElementById('btnAlternar');
const textoCambio = document.getElementById('textoCambio');
const titulo = document.getElementById('titulo');
const subtitulo = document.getElementById('subtitulo');
const notificacion = document.getElementById('notificacion');
const notifMensaje = document.getElementById('notificacionMensaje');
const notifIcono = document.getElementById('notificacionIcono');

// Elementos del medidor de fuerza
const medidorFuerza = document.getElementById('medidorFuerza');
const fuerzaEtiqueta = document.getElementById('fuerzaEtiqueta');
const listaRequisitos = document.getElementById('requisitos');

// Controla qué formulario está visible (false = login, true = registro)
let mostrandoRegistro = false;

// Temporizador para ocultar la notificación automáticamente
let temporizadorNotificacion = null;

/* ============ 2. Alternancia entre formularios ============ */
// Al hacer clic en "Regístrate" / "Inicia sesión" se cambia el
// formulario visible con una animación de deslizamiento.
btnAlternar.addEventListener('click', () => {
    mostrandoRegistro = !mostrandoRegistro;

    // Activar un formulario y ocultar el otro
    formLogin.classList.toggle('activo', !mostrandoRegistro);
    formRegistro.classList.toggle('activo', mostrandoRegistro);

    // Animación lateral: el login entra por un lado y el registro por otro
    formLogin.classList.toggle('izquierda', true);
    formRegistro.classList.toggle('izquierda', false);

    // Actualizar los textos de la tarjeta
    textoCambio.textContent = mostrandoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
    btnAlternar.textContent = mostrandoRegistro ? 'Inicia sesión' : 'Regístrate';
    titulo.textContent = mostrandoRegistro ? 'Crear cuenta' : 'Iniciar sesión';
    subtitulo.textContent = mostrandoRegistro
        ? 'Solo te tomará un momento'
        : 'Bienvenido de nuevo';

    ocultarNotificacion();
});

/* ============ 3. Botones "ojito" (ver contraseña) ============ */
// Cada botón .ojo tiene un atributo data-objetivo con el id del
// campo de contraseña que debe mostrar u ocultar.
document.querySelectorAll('.ojo').forEach((boton) => {
    boton.addEventListener('click', () => {
        const campo = document.getElementById(boton.dataset.objetivo);
        if (!campo) return;

        // Alternar el tipo del input entre password y text
        const oculto = campo.type === 'password';
        campo.type = oculto ? 'text' : 'password';

        // Alternar el icono del ojo (abierto / tachado)
        boton.classList.toggle('visible', oculto);

        // Accesibilidad: actualizar la etiqueta del botón
        const accion = oculto ? 'Ocultar contraseña' : 'Mostrar contraseña';
        boton.setAttribute('aria-label', accion);
        boton.setAttribute('title', accion);

        // Devolver el foco al campo para seguir escribiendo cómodamente
        campo.focus();
    });
});

/* ============ 4. Medidor de fuerza y requisitos ============ */

// Reglas que debe cumplir una contraseña segura
const REGLAS = {
    longitud: (clave) => clave.length >= LONGITUD_MINIMA,
    mayuscula: (clave) => /[A-Z]/.test(clave),
    minuscula: (clave) => /[a-z]/.test(clave),
    numero: (clave) => /[0-9]/.test(clave),
    simbolo: (clave) => /[^A-Za-z0-9]/.test(clave)
};

// Etiquetas que se muestran según el puntaje obtenido
const ETIQUETAS_FUERZA = ['Escribe tu contraseña', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];

// Evaluamos la contraseña cada vez que el usuario escribe
document.getElementById('regClave').addEventListener('input', (evento) => {
    evaluarFuerza(evento.target.value);
});

/**
 * Analiza la contraseña, marca los requisitos cumplidos y
 * actualiza el medidor de fuerza.
 * @param {string} clave - Contraseña ingresada por el usuario.
 */
function evaluarFuerza(clave) {
    let cumplidas = 0;

    // Recorremos cada regla y marcamos la viñeta correspondiente
    Object.entries(REGLAS).forEach(([nombre, prueba]) => {
        const item = listaRequisitos.querySelector(`li[data-regla="${nombre}"]`);
        const ok = prueba(clave);
        if (ok) cumplidas++;
        item.classList.toggle('cumple', ok);
    });

    // Sin contraseña no se muestra ningún nivel
    let nivel = 0;

    if (clave.length > 0) {
        // Un nivel por cada requisito cumplido (máximo 4 en el medidor)
        nivel = cumplidas;

        // Penalización: una contraseña demasiado corta nunca es "muy fuerte"
        if (clave.length < LONGITUD_MINIMA && nivel > 2) nivel = 2;
    }

    // Actualizar el medidor y su etiqueta
    medidorFuerza.dataset.nivel = String(nivel);
    medidorFuerza.classList.toggle('activo', clave.length > 0);
    fuerzaEtiqueta.textContent = ETIQUETAS_FUERZA[nivel];
}

/**
 * Indica si la contraseña cumple TODOS los requisitos de seguridad.
 * @param {string} clave - Contraseña a verificar.
 * @returns {boolean}
 */
function claveEsSegura(clave) {
    return Object.values(REGLAS).every((prueba) => prueba(clave));
}

/* ============ 5. Envío del formulario de inicio de sesión ============ */
formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault(); // Evita el envío tradicional de la página

    // Leer los valores ingresados por el usuario
    const usuario = formLogin.elements['usuario'].value.trim();
    const clave = formLogin.elements['clave'].value;

    // Validación básica en el cliente
    if (!usuario || !clave) {
        mostrarNotificacion('error', 'Error en la autenticación: completa todos los campos.');
        sacudirTarjeta();
        return;
    }

    // Llamar al servicio web de inicio de sesión
    const exito = await enviarPeticion(
        SERVICIOS.login,
        { usuario, clave },
        document.getElementById('botonLogin')
    );

    if (exito) {
        // Autenticación satisfactoria: resaltar la tarjeta y
        // redirigir a la página de bienvenida (protegida por sesión)
        tarjeta.classList.add('exito');
        setTimeout(() => {
            window.location.href = 'bienvenida.php';
        }, 1400);
    }
});

/* ============ 6. Envío del formulario de registro ============ */
formRegistro.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    // Leer los valores ingresados
    const usuario = formRegistro.elements['usuario'].value.trim();
    const correo = formRegistro.elements['correo'].value.trim();
    const clave = formRegistro.elements['clave'].value;
    const clave2 = formRegistro.elements['clave2'].value;

    // Validaciones básicas en el cliente
    if (!usuario || !correo || !clave || !clave2) {
        mostrarNotificacion('error', 'Completa todos los campos del registro.');
        sacudirTarjeta();
        return;
    }
    if (usuario.length < 3) {
        mostrarNotificacion('error', 'El usuario debe tener al menos 3 caracteres.');
        sacudirTarjeta();
        return;
    }
    if (!validarCorreo(correo)) {
        mostrarNotificacion('error', 'El correo electrónico no es válido.');
        sacudirTarjeta();
        return;
    }

    // Regla de seguridad: mínimo 8 caracteres entre mayúsculas,
    // minúsculas, números y símbolos.
    if (!claveEsSegura(clave)) {
        mostrarNotificacion(
            'error',
            `La contraseña debe tener mínimo ${LONGITUD_MINIMA} caracteres e incluir mayúscula, minúscula, número y símbolo.`
        );
        sacudirTarjeta();
        return;
    }
    if (clave !== clave2) {
        mostrarNotificacion('error', 'Las contraseñas no coinciden.');
        sacudirTarjeta();
        return;
    }

    // Llamar al servicio web de registro
    const exito = await enviarPeticion(
        SERVICIOS.registro,
        { usuario, correo, clave, clave2 },
        document.getElementById('botonRegistro')
    );

    // Si el registro fue correcto, volvemos al formulario de
    // inicio de sesión para que el usuario se autentique.
    if (exito) {
        formRegistro.reset();
        evaluarFuerza(''); // Reiniciar el medidor de fuerza
        setTimeout(() => btnAlternar.click(), 900);
    }
});

/* ============ 7. Funciones auxiliares ============ */

/**
 * Envía una petición POST en JSON al servicio web indicado.
 * @param {string}  ruta   - Ruta del endpoint PHP.
 * @param {object}  datos  - Datos a enviar (usuario, clave, etc.).
 * @param {HTMLElement} boton - Botón que mostrará el estado de carga.
 * @returns {Promise<boolean>} true si el servicio respondió "ok".
 */
async function enviarPeticion(ruta, datos, boton) {
    // Activar el estado de carga del botón
    boton.classList.add('cargando');
    boton.disabled = true;

    try {
        // Petición HTTP al servicio web
        const respuesta = await fetch(ruta, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        // El servicio responde siempre en formato JSON con
        // las claves "estado" (ok | error) y "mensaje".
        const resultado = await respuesta.json();

        if (resultado.estado === 'ok') {
            mostrarNotificacion('ok', resultado.mensaje);
            return true;
        }

        // Autenticación / registro con error
        mostrarNotificacion('error', resultado.mensaje);
        sacudirTarjeta();
        return false;

    } catch (error) {
        // Error de conexión con el servidor (p. ej. Apache apagado)
        mostrarNotificacion('error', 'No se pudo conectar con el servicio web. Verifica que XAMPP esté activo.');
        return false;

    } finally {
        // Quitar el estado de carga del botón
        boton.classList.remove('cargando');
        boton.disabled = false;
    }
}

/**
 * Muestra la notificación flotante con el mensaje indicado.
 * @param {'ok'|'error'} tipo - Tipo de mensaje.
 * @param {string} mensaje - Texto a mostrar.
 */
function mostrarNotificacion(tipo, mensaje) {
    notifMensaje.textContent = mensaje;
    notifIcono.textContent = tipo === 'ok' ? '✓' : '✕';
    notificacion.classList.toggle('error', tipo === 'error');
    notificacion.classList.add('visible');

    // Ocultar automáticamente a los 4 segundos
    clearTimeout(temporizadorNotificacion);
    temporizadorNotificacion = setTimeout(ocultarNotificacion, 4000);
}

/** Oculta la notificación flotante. */
function ocultarNotificacion() {
    notificacion.classList.remove('visible');
}

/** Aplica la animación de sacudida a la tarjeta (efecto de error). */
function sacudirTarjeta() {
    tarjeta.classList.remove('sacudir');
    // Reiniciar la animación eliminando y volviendo a añadir la clase
    void tarjeta.offsetWidth;
    tarjeta.classList.add('sacudir');
}

/**
 * Valida un correo electrónico con una expresión regular simple.
 * @param {string} correo - Correo a validar.
 * @returns {boolean}
 */
function validarCorreo(correo) {
    const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresion.test(correo);
}
