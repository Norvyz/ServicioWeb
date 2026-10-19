<?php
/* =========================================================
   Evidencia GA7-220501096-AA5-EV01
   Archivo : api/login.php
   Servicio web: INICIO DE SESIÓN
   Descripción: recibe un usuario y una contraseña; si la
   autenticación es correcta responde "Autenticación
   satisfactoria", en caso contrario devuelve
   "Error en la autenticación".
========================================================= */

// Se inicia la sesión PHP para mantener al usuario autenticado
session_start();

// Cargamos las funciones auxiliares de conexión y respuesta
require_once __DIR__ . '/conexion.php';

/* ---- 1. Validar el método de la petición ---- */
// Este servicio solo acepta peticiones de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder('error', 'Error en la autenticación: método no permitido, use POST.', 405);
}

/* ---- 2. Obtener los datos enviados por el cliente ---- */
$peticion = leerPeticion();
$usuario = trim($peticion['usuario'] ?? '');
$clave   = $peticion['clave'] ?? '';

/* ---- 3. Validar que los campos no estén vacíos ---- */
if ($usuario === '' || $clave === '') {
    responder('error', 'Error en la autenticación: el usuario y la contraseña son obligatorios.', 400);
}

/* ---- 4. Buscar al usuario en la "base de datos" ---- */
$usuarios = obtenerUsuarios();
$encontrado = null;

foreach ($usuarios as $u) {
    // Comparación sin distinguir mayúsculas/minúsculas
    if (strcasecmp($u['usuario'], $usuario) === 0) {
        $encontrado = $u;
        break;
    }
}

/* ---- 5. Verificar la contraseña ---- */
// password_verify compara la contraseña ingresada contra el
// hash guardado durante el registro (nunca se guarda en texto plano).
if ($encontrado === null || !password_verify($clave, $encontrado['clave'])) {
    responder('error', 'Error en la autenticación: usuario o contraseña incorrectos.', 401);
}

/* ---- 6. Autenticación correcta: crear la sesión ---- */
$_SESSION['usuario'] = $encontrado['usuario'];
$_SESSION['correo']  = $encontrado['correo'];
$_SESSION['hora']    = date('d/m/Y H:i:s');

/* ---- 7. Respuesta de autenticación satisfactoria ---- */
responder('ok', 'Autenticación satisfactoria. ¡Bienvenido ' . $encontrado['usuario'] . '!', 200, [
    'usuario' => $encontrado['usuario']
]);
