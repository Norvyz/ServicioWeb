/* =========================================================
   Evidencia GA7-220501096-AA5-EV01
   Archivo : js/main.js
   Descripción: lógica del lado del cliente. Valida los datos
   ingresados y consume los servicios web PHP de registro e
   inicio de sesión (api/login.php y api/registro.php).

   Índice de secciones:
     1. Configuración de rutas
     2. Referencias al DOM
     3. Alternancia entre formularios
     4. Envío del formulario de inicio de sesión
     5. Envío del formulario de registro
     6. Funciones auxiliares
========================================================= */

/* ============ 1. Configuración de rutas ============ */
// Rutas de los servicios web (endpoints PHP)
const SERVICIOS = {
    login: 'api/login.php',
    registro: 'api/registro.php'
};

/* ============ 2. Referencias al DOM ============ */
const tarjeta = document.getElementById('tarjeta');
const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const btnAlternar = document.getElementById('btnAlternar');
const textoCambio = document.getElementById('textoCambio');
const subtitulo = document.getElementById('subtitulo');
const notificacion = document.getElementById('notificacion');
const notifMensaje = document.getElementById('notificacionMensaje');
const notifIcono = document.getElementById('notificacionIcono');

// Controla qué formulario está visible (false = login, true = registro)
let mostrandoRegistro = false;

// Temporizador para ocultar la notificación automáticamente
let temporizadorNotificacion = null;

/* ============ 3. Alternancia entre formularios ============ */
// Al hacer clic en "Regístrate" / "Inicia sesión" se cambia
// el formulario visible con una animación de aparición.
btnAlternar.addEventListener('click', () => {
    mostrandoRegistro = !mostrandoRegistro;

    // Activar un formulario y ocultar el otro
    formLogin.classList.toggle('activo', !mostrandoRegistro);
    formRegistro.classList.toggle('activo', mostrandoRegistro);

    // Actualizar los textos de la tarjeta
    textoCambio.textContent = mostrandoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
    btnAlternar.textContent = mostrandoRegistro ? 'Inicia sesión' : 'Regístrate';
    subtitulo.textContent = mostrandoRegistro
        ? 'Crea tu cuenta en segundos'
        : 'Inicia sesión para continuar';

    // Ocultar cualquier mensaje pendiente
    ocultarNotificacion();
});

/* ============ 4. Envío del formulario de inicio de sesión ============ */
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
    const exito = await enviarPeticion(SERVICIOS.login, { usuario, clave }, document.getElementById('botonLogin'));

    if (exito) {
        // Autenticación satisfactoria: resaltar la tarjeta y
        // redirigir a la página de bienvenida (protegida por sesión)
        tarjeta.classList.add('exito');
        setTimeout(() => {
            window.location.href = 'bienvenida.php';
        }, 1400);
    }
});

/* ============ 5. Envío del formulario de registro ============ */
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
    if (clave.length < 6) {
        mostrarNotificacion('error', 'La contraseña debe tener al menos 6 caracteres.');
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
        setTimeout(() => btnAlternar.click(), 900);
    }
});

/* ============ 6. Funciones auxiliares ============ */

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
