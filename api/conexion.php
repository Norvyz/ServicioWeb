<?php
/* =========================================================
   Evidencia GA7-220501096-AA5-EV01
   Archivo : api/conexion.php
   Descripción: funciones auxiliares para conectar con la
   "base de datos" del proyecto (archivo JSON) y responder
   las peticiones en formato JSON.
========================================================= */

// Todas las respuestas de la API se devuelven en JSON (UTF-8)
header('Content-Type: application/json; charset=utf-8');

// Ruta del archivo que simula la base de datos de usuarios
define('ARCHIVO_USUARIOS', __DIR__ . '/../data/usuarios.json');

/**
 * Obtiene la lista de usuarios registrados.
 * @return array Lista de usuarios (vacía si el archivo no existe).
 */
function obtenerUsuarios(): array
{
    // Si aún no existe el archivo, devolvemos una lista vacía
    if (!file_exists(ARCHIVO_USUARIOS)) {
        return [];
    }

    // Leemos el contenido del archivo JSON y lo convertimos a arreglo
    $contenido = file_get_contents(ARCHIVO_USUARIOS);
    $usuarios = json_decode($contenido, true);

    return is_array($usuarios) ? $usuarios : [];
}

/**
 * Guarda la lista de usuarios en el archivo JSON.
 * @param array $usuarios Lista completa de usuarios a persistir.
 */
function guardarUsuarios(array $usuarios): void
{
    file_put_contents(
        ARCHIVO_USUARIOS,
        json_encode($usuarios, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    );
}

/**
 * Lee el cuerpo de la petición en formato JSON enviado por el
 * cliente con fetch(..., { body: JSON.stringify(datos) }).
 * @return array Datos enviados por el cliente.
 */
function leerPeticion(): array
{
    $datos = json_decode(file_get_contents('php://input'), true);
    return is_array($datos) ? $datos : [];
}

/**
 * Devuelve una respuesta JSON estandarizada y finaliza la ejecución.
 * Estructura: { "estado": "ok"|"error", "mensaje": "..." }
 *
 * @param string $estado  - "ok" cuando todo salió bien, "error" cuando falla.
 * @param string $mensaje - Mensaje que se mostrará al usuario.
 * @param int    $codigo  - Código HTTP de la respuesta (200, 401, 409...).
 * @param array  $extra   - Datos adicionales (opcional).
 */
function responder(string $estado, string $mensaje, int $codigo, array $extra = []): void
{
    http_response_code($codigo);
    echo json_encode(
        array_merge(
            ['estado' => $estado, 'mensaje' => $mensaje],
            $extra
        ),
        JSON_UNESCAPED_UNICODE
    );
    exit;
}
