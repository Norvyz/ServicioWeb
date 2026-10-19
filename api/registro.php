<?php
/* =========================================================
   Evidencia GA7-220501096-AA5-EV01
   Archivo : api/registro.php
   Servicio web: REGISTRO DE USUARIOS
   Descripción: recibe los datos de un nuevo usuario, valida
   la información y lo guarda con la contraseña encriptada
   (password_hash) en el archivo JSON del proyecto.
========================================================= */

// Cargamos las funciones auxiliares de conexión y respuesta
require_once __DIR__ . '/conexion.php';

/* ---- 1. Validar el método de la petición ---- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder('error', 'Método no permitido, use POST.', 405);
}

/* ---- 2. Obtener los datos enviados por el cliente ---- */
$peticion = leerPeticion();
$usuario = trim($peticion['usuario'] ?? '');
$correo  = trim($peticion['correo'] ?? '');
$clave   = $peticion['clave'] ?? '';
$clave2  = $peticion['clave2'] ?? '';

/* ---- 3. Validaciones ---- */
// 3.1 Todos los campos son obligatorios
if ($usuario === '' || $correo === '' || $clave === '' || $clave2 === '') {
    responder('error', 'Todos los campos son obligatorios.', 400);
}

// 3.2 El usuario debe tener al menos 3 caracteres
if (strlen($usuario) < 3) {
    responder('error', 'El usuario debe tener al menos 3 caracteres.', 400);
}

// 3.3 El correo debe tener un formato válido
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder('error', 'El correo electrónico no es válido.', 400);
}

// 3.4 La contraseña debe tener mínimo 8 caracteres
if (strlen($clave) < 8) {
    responder('error', 'La contraseña debe tener al menos 8 caracteres.', 400);
}

// 3.4.1 Debe contener al menos una mayúscula, una minúscula,
//       un número y un símbolo (contraseña segura).
$esSegura = preg_match('/[A-Z]/', $clave)   // al menos una mayúscula
         && preg_match('/[a-z]/', $clave)   // al menos una minúscula
         && preg_match('/[0-9]/', $clave)   // al menos un número
         && preg_match('/[^A-Za-z0-9]/', $clave); // al menos un símbolo

if (!$esSegura) {
    responder(
        'error',
        'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un símbolo.',
        400
    );
}

// 3.5 Ambas contraseñas deben coincidir
if ($clave !== $clave2) {
    responder('error', 'Las contraseñas no coinciden.', 400);
}

/* ---- 4. Verificar que el usuario no exista ---- */
$usuarios = obtenerUsuarios();

foreach ($usuarios as $u) {
    if (strcasecmp($u['usuario'], $usuario) === 0) {
        responder('error', 'El usuario "' . $usuario . '" ya está registrado.', 409);
    }
}

/* ---- 5. Guardar el nuevo usuario ---- */
// La contraseña se guarda encriptada con password_hash
// (algoritmo bcrypt/argon2), nunca en texto plano.
$usuarios[] = [
    'usuario' => $usuario,
    'correo'  => $correo,
    'clave'   => password_hash($clave, PASSWORD_DEFAULT),
    'fecha'   => date('Y-m-d H:i:s')
];

guardarUsuarios($usuarios);

/* ---- 6. Respuesta exitosa ---- */
responder('ok', 'Registro satisfactoria. Ya puedes iniciar sesión con tu cuenta.', 201);
