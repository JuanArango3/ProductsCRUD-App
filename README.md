# Aplicación Móvil ProductsCRUD (React Native)

Este repositorio contiene el código fuente del cliente móvil para la API ProductsCRUD. La aplicación está desarrollada utilizando React Native y Expo (con Expo Router).

Permite visualizar productos y, para usuarios administradores, realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre ellos, incluyendo la gestión de imágenes.

## Prerrequisitos

Para poder ejecutar o construir esta aplicación localmente, necesitarás tener instalado el siguiente software:

1.  **Node.js:** Se recomienda la versión LTS. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
2.  **Gestor de Paquetes:** Necesitarás `npm` (que viene con Node.js), `yarn` o `pnpm`. Este proyecto utiliza `pnpm` internamente (como se ve en `pnpm-lock.yaml`).
3.  **Entorno de Desarrollo Android:**
   * **Android Studio:** Incluye el Android SDK y herramientas para crear emuladores. Descarga desde [Android Studio](https://developer.android.com/studio).
   * **Android SDK:** Asegúrate de tener un SDK de Android instalado.
   * **Dispositivo/Emulador:** Necesitas un dispositivo Android físico conectado con la depuración USB habilitada, o un Emulador Android configurado y ejecutándose a través de Android Studio. Tu dispositivo/emulador debe ser reconocido por ADB (puedes verificarlo ejecutando `adb devices` en tu terminal).
   * Sigue la guía de configuración del entorno de Expo/React Native para tu sistema operativo: [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) (selecciona "Expo Go Quickstart").

## Configuración

### URL del Backend API

Por defecto, la aplicación apunta a la API desplegada en `https://productscrud.jmarango.me/api`.

Si deseas apuntar a una instancia diferente del backend (por ejemplo, una ejecutándose localmente o en otro servidor):

1.  Edita el archivo: `constants/Backend.ts`
2.  Modifica el valor de la constante `API_BASE_URL`:

    ```typescript
    // constants/Backend.ts
    export const API_BASE_URL = 'URL_DE_TU_API';
    // Ejemplo local Android (si backend corre en puerto 8080):
    // export const API_BASE_URL = 'http://127.0.0.1:8080/api';
    ```

## Ejecutar en Desarrollo

Sigue estos pasos para ejecutar la aplicación en un emulador o dispositivo físico conectado para desarrollo y pruebas:

1.  **Clona el Repositorio:**
    ```bash
    git clone https://github.com/JuanArango3/ProductsCRUD-App.git
    cd ProductsCRUD-App
    ```
2.  **Instala las Dependencias:**
    ```bash
    pnpm install
    ```
    (Si prefieres npm o yarn: `npm install` o `yarn install`)

3.  **Prepara tu Dispositivo/Emulador:** Asegúrate de que esté ejecutándose y sea reconocido por `adb devices`.
4.  **Ejecuta la Aplicación:**
    ```bash
    pnpm exec expo run:android
    ```
    (O usa `npx expo run:android` / `yarn expo run:android`)

    Expo (a través de React Native CLI) compilará e instalará la aplicación en tu dispositivo/emulador. La primera vez puede tardar un poco más. Podrás ver la aplicación y los logs en la terminal.

## Instalar APK (Alternativa)

Si no deseas construir la aplicación desde el código fuente, puedes instalar un archivo `.apk` pre-compilado:

1.  Ve a la sección de **"Releases"** de este repositorio en GitHub.
2.  Descarga el último archivo `.apk` disponible.
3.  Transfiere el archivo `.apk` a tu dispositivo Android.
4.  En tu dispositivo Android, busca el archivo `.apk` usando un explorador de archivos.
5.  Tócalo para instalarlo. Es posible que necesites habilitar la instalación desde "Fuentes desconocidas" en la configuración de seguridad de tu Android.

## Tecnologías Utilizadas

* React Native
* Expo (SDK, Expo Router, Expo SecureStore, Expo ImagePicker)
* TypeScript
* Expo Router (para navegación basada en archivos)
* React Context API (para gestión de estado de autenticación)
* Fetch API (para comunicación con el backend)
* PNPM (como gestor de paquetes en este ejemplo)
