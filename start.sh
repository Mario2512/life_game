#!/data/data/com.termux/files/usr/bin/bash

PORT=8000
URL="http://localhost:$PORT"

# Iniciar servidor en segundo plano
python -m http.server "$PORT" >/dev/null 2>&1 &

# Guardar PID si quieres cerrarlo luego
SERVER_PID=$!

# Esperar un poco para que el servidor arranque
sleep 1

# Abrir Firefox en localhost
am start \
  -a android.intent.action.VIEW \
  -d "$URL" \
  -n org.mozilla.firefox/org.mozilla.gecko.BrowserApp

# Opcional: mostrar PID
echo "Servidor HTTP iniciado (PID $SERVER_PID)"
