<?php
/* =========================================================
   Evidencia GA7-220501096-AA5-EV01
   Archivo : bienvenida.php
   Descripción: página de bienvenida PROTEGIDA por sesión.
   Solo puede verse si el usuario se autenticó correctamente;
   en caso contrario es redirigido al formulario de login.
========================================================= */

// Recuperamos la sesión del usuario
session_start();

// Control de acceso: si no hay sesión activa, regresamos al login
if (!isset($_SESSION['usuario'])) {
    header('Location: index.html');
    exit;
}

// Escapamos el dato para evitar inyección de código (XSS)
$usuario = htmlspecialchars($_SESSION['usuario'], ENT_QUOTES, 'UTF-8');
$correo  = htmlspecialchars($_SESSION['correo'] ?? '', ENT_QUOTES, 'UTF-8');
$hora    = htmlspecialchars($_SESSION['hora'] ?? date('d/m/Y H:i:s'), ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido | Servicio Web de Autenticación</title>
    <!-- Mismos estilos que el formulario de acceso -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- Fondo minimalista: dos orbes de luz animados -->
    <div class="fondo" aria-hidden="true">
        <span class="orbe orbe-1"></span>
        <span class="orbe orbe-2"></span>
    </div>

    <main class="contenedor">
        <!-- Tarjeta de bienvenida -->
        <section class="tarjeta tarjeta-exito">

            <header class="marca">
                <!-- Logo verde con icono de verificación -->
                <div class="logo logo-verde">
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="none"
                         stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"
                         stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                </div>
                <h1>Autenticación satisfactoria</h1>
                <p>Hola <strong><?= $usuario ?></strong>, bienvenido al servicio web.</p>
            </header>

            <!-- Datos de la sesión activa -->
            <ul class="datos-sesion">
                <li><span>Usuario:</span> <?= $usuario ?></li>
                <li><span>Correo:</span> <?= $correo ?></li>
                <li><span>Sesión iniciada:</span> <?= $hora ?></li>
            </ul>

            <!-- Botón que invoca el servicio web de cerrar sesión -->
            <a class="boton" href="api/salir.php">Cerrar sesión</a>
        </section>
    </main>
</body>
</html>
