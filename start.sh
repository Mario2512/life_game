#!/data/data/com.termux/files/usr/bin/bash

# Configuración
PORT=8000
URL="http://localhost:$PORT"

# Función de limpieza (se ejecuta al salir o Ctrl+C)
cleanup() {
    echo -e "\n🛑 Deteniendo servidor y limpiando procesos..."
    if [ -n "$SERVER_PID" ]; then
        kill "$SERVER_PID" 2>/dev/null
        echo "✅ Servidor (PID $SERVER_PID) detenido."
    fi
    exit
}

# Capturar señales de salida (Ctrl+C, cierre, etc.)
trap cleanup SIGINT SIGTERM EXIT

clear
echo "🚀 Iniciando Life Game..."

# Iniciar servidor en segundo plano
python -m http.server "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!

echo "✅ Servidor activo en puerto $PORT (PID $SERVER_PID)"
echo "⏳ Abriendo navegador..."

# Esperar un momento para asegurar que el servidor esté listo
sleep 2

# Intentar abrir Firefox, si falla intentar navegador predeterminado
am start -a android.intent.action.VIEW -d "$URL" -n org.mozilla.firefox/org.mozilla.gecko.BrowserApp >/dev/null 2>&1 || \
am start -a android.intent.action.VIEW -d "$URL" >/dev/null 2>&1

echo "----------------------------------------"
echo "🟢 La aplicación está corriendo."
echo "ℹ️  Mantén esta ventana abierta."
echo "🔴 Presiona [ENTER] o [Ctrl+C] para cerrar todo."
echo "----------------------------------------"

# Esperar input del usuario para mantener el script vivo
read -r
