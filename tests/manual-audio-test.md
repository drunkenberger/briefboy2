# Prueba Manual de Grabación de Audio (Desarrolladores)

Este archivo describe cómo realizar una prueba manual sencilla para verificar el funcionamiento del micrófono y la grabación de audio en la app BriefBoy usando el componente `AudioRecorder`.

## Objetivo
Asegurarse de que el micrófono del dispositivo funciona correctamente y que el componente `AudioRecorder` puede grabar, detener y mostrar la URI del archivo grabado.

---

## Pasos para la Prueba Manual

1. **Instala las dependencias y ejecuta la app en un dispositivo físico o emulador:**
   ```sh
   npm install
   npm start
   # o
   expo start
   ```

2. **Abre la app en tu dispositivo/emulador usando Expo Go o el emulador correspondiente.**

3. **Navega a la pantalla donde se encuentra el componente `AudioRecorder`.**

4. **Permite los permisos de micrófono cuando la app lo solicite.**

5. **Realiza la prueba:**
   - Presiona el botón "Iniciar grabación".
   - Habla o haz algún sonido cerca del micrófono.
   - Presiona el botón "Detener grabación".
   - Verifica que aparezca el mensaje "Grabación lista" y la URI del archivo grabado.
   - (Opcional) Accede al archivo grabado para reproducirlo y confirmar que el audio fue capturado correctamente.

6. **Verifica el manejo de errores:**
   - Rechaza los permisos de micrófono y asegúrate de que la app muestra un mensaje de error adecuado.
   - Intenta iniciar/detener la grabación varias veces para comprobar la estabilidad.

---

## Notas
- Esta prueba debe realizarse en todos los dispositivos y plataformas soportadas (iOS, Android, emulador y físico).
- Documenta cualquier error o comportamiento inesperado encontrado durante la prueba.
- Para pruebas de usuario final, se implementará una experiencia guiada en el frontend más adelante.