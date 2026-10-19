# Servicio Web de Registro e Inicio de Sesión

**Evidencia:** GA7-220501096-AA5-EV01 — *Diseño y desarrollo de servicios web - caso*
**Tecnologías:** HTML5, CSS3, JavaScript (fetch), PHP 8 + Apache (XAMPP), Git.

Sitio web responsive y animado para registrar usuarios e iniciar sesión, consumiendo
servicios web PHP que devuelven **autenticación satisfactoria** o **error en la autenticación**.

## Características de interfaz

- **Diseño minimalista**: tarjeta con efecto *glassmorphism*, paleta índigo/cian y formas limpias.
- **Animaciones**: orbes de luz en movimiento, entrada de la tarjeta, deslizamiento entre
  formularios, destello en los botones y *toast* de notificación.
- **Ver contraseña (ojito)**: botón con icono de ojo que alterna entre `password` y `text`
  en los tres campos de contraseña.
- **Medidor de fuerza**: barra de 4 segmentos con colores — rojo (débil), ámbar (media),
  verde lima (fuerte) y verde (muy fuerte).
- **Requisitos en vivo**: mínimo 8 caracteres, una mayúscula, una minúscula, un número y
  un símbolo, con palomitas animadas a medida que se cumplen.
- **Responsive**: se adapta a móviles, tabletas y escritorio.
- **Accesibilidad**: soporte para `prefers-reduced-motion` y etiquetas ARIA.

---

## Estructura del proyecto

```
servicio-web-login/
├── index.html          → Formulario de login y registro (vista principal)
├── bienvenida.php      → Página protegida por sesión (solo usuarios autenticados)
├── css/
│   └── style.css       → Estilos, animaciones y diseño responsive
├── js/
│   └── main.js         → Validación en el cliente y consumo de los servicios web
├── api/
│   ├── conexion.php    → Funciones auxiliares (archivo JSON + respuestas)
│   ├── registro.php    → Servicio web de REGISTRO
│   ├── login.php       → Servicio web de INICIO DE SESIÓN
│   └── salir.php       → Servicio web de CERRAR SESIÓN
├── data/
│   └── usuarios.json   → "Base de datos" del proyecto (usuarios registrados)
├── README.md
└── .gitignore
```

## Requisitos

- [XAMPP](https://www.apachefriends.org/) (Apache + PHP 8) o cualquier servidor con PHP.
- Un navegador web moderno.

## Instalación (XAMPP)

1. Copiar la carpeta `servicio-web-login` dentro de `C:\xampp\htdocs`.
2. Abrir el panel de XAMPP y **activar el módulo Apache**.
3. En el navegador abrir: **http://localhost/servicio-web-login/**

## Servicios web (endpoints)

Todas las peticiones son `POST` con cuerpo JSON y responden en JSON con la
estructura `{ "estado": "ok" | "error", "mensaje": "..." }`.

| Servicio      | Ruta               | Parámetros                       | Ejemplo de respuesta                                    |
|---------------|--------------------|----------------------------------|---------------------------------------------------------|
| Registro      | `api/registro.php` | `usuario`, `correo`, `clave`, `clave2` | `{"estado":"ok","mensaje":"Registro satisfactoria..."}` |
| Inicio de sesión | `api/login.php` | `usuario`, `clave`               | `{"estado":"ok","mensaje":"Autenticación satisfactoria. ¡Bienvenido ana!"}` |
| Error de autenticación | `api/login.php` | `usuario`, `clave` (incorrectos) | `{"estado":"error","mensaje":"Error en la autenticación: usuario o contraseña incorrectos."}` (HTTP 401) |
| Cerrar sesión | `api/salir.php`    | —                                | Redirige al `index.html`                                |

### Prueba rápida con PowerShell

```powershell
# Login correcto
Invoke-RestMethod -Uri http://localhost/servicio-web-login/api/login.php -Method POST `
  -ContentType "application/json" -Body '{"usuario":"ana","clave":"123456"}'

# Login incorrecto (debe devolver error)
Invoke-RestMethod -Uri http://localhost/servicio-web-login/api/login.php -Method POST `
  -ContentType "application/json" -Body '{"usuario":"ana","clave":"mala"}'
```

## Seguridad implementada

- Contraseñas guardadas con `password_hash()` / verificadas con `password_verify()` (nunca en texto plano).
- Sesiones de PHP para proteger la página `bienvenida.php`.
- `htmlspecialchars()` para evitar inyección de código (XSS) en la página de bienvenida.
- Validaciones en el servidor (campos obligatorios, formato de correo, longitud de contraseña).

## Control de versiones

Proyecto creado y versionado con **Git**:

```bash
git init
git add .
git commit -m "Commit inicial: servicio web de registro e inicio de sesión"
git log --oneline
```
