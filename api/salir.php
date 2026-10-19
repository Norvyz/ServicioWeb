<?php
/* =========================================================
   Evidencia GA7-220501096-AA5-EV01
   Archivo : api/salir.php
   Servicio web: CERRAR SESIÓN
   Descripción: destruye la sesión del usuario autenticado y
   lo regresa al formulario de inicio de sesión.
========================================================= */

// Iniciamos (o recuperamos) la sesión actual
session_start();

// Eliminamos todas las variables de la sesión
$_SESSION = [];

// Destruimos la sesión en el servidor y borramos la cookie
session_destroy();

// Regresamos al formulario de inicio de sesión
header('Location: ../index.html');
exit;
