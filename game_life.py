import json
import os
import platform
import time
import threading
import sys
from datetime import datetime, date
from colorama import init, Fore, Style

init(autoreset=True)

# ---------------------- Función para limpiar pantalla ----------------------
def limpiar_pantalla():
    if platform.system() == "Windows":
        os.system("cls")
    else:
        os.system("clear")

# ---------------------- Función para animación de texto ----------------------
def animar_texto(texto, delay=0.02):
    for char in texto:
        print(char, end="", flush=True)
        time.sleep(delay)
    print()

# ---------------------- Configuración inicial ----------------------
rutina = [
    {"hora": "06:50", "tarea": "Despertar", "esfuerzo": 2},
    {"hora": "07:00", "tarea": "Desayuno", "esfuerzo": 1},
    {"hora": "10:30", "tarea": "Almuerzo", "esfuerzo": 1},      # Añadido
    {"hora": "15:00", "tarea": "Comida", "esfuerzo": 1},
    {"hora": "17:30", "tarea": "Merienda", "esfuerzo": 1},      # Añadido
    {"hora": "18:00", "tarea": "Ejercicio", "esfuerzo": 3},
    {"hora": "19:00", "tarea": "Ducha", "esfuerzo": 1},
    {"hora": "20:00", "tarea": "Estudiar", "esfuerzo": 3},
    {"hora": "21:30", "tarea": "Cena", "esfuerzo": 1},
    {"hora": "22:00", "tarea": "Leer un libro", "esfuerzo": 2},
    {"hora": "23:00", "tarea": "Dormir", "esfuerzo": 1},
]

tienda = {
    "Ver un capítulo de serie": 10,
    "Comer un postre": 20,
    "Jugar videojuegos 1 hora": 30,
}

archivo_datos = "progreso.json"
archivo_historial = "historial.json"
puntos_comida = {"sana": 5, "neutra": 2, "no_sana": 0}

# ---------------------- Funciones de datos ----------------------
def cargar_datos():
    if not os.path.exists(archivo_datos):
        return {"puntos": 0, "completadas": {}, "mes": datetime.now().month}
    with open(archivo_datos, "r") as f:
        data = json.load(f)
    # Protección automática:
    if isinstance(data.get("completadas"), list):
        data["completadas"] = {}
        guardar_datos(data)
    return data

def guardar_datos(data):
    with open(archivo_datos, "w") as f:
        json.dump(data, f, indent=4)

def registrar_historial(fecha, tarea):
    historial = {}
    if os.path.exists(archivo_historial):
        with open(archivo_historial, "r") as f:
            historial = json.load(f)
    if fecha not in historial:
        historial[fecha] = []
    historial[fecha].append(tarea)
    with open(archivo_historial, "w") as f:
        json.dump(historial, f, indent=4)

# ---------------------- Funciones principales ----------------------
def mostrar_rutina(data):
    print(Fore.CYAN + "\n📅 Rutina de hoy:")
    hoy = str(date.today())
    completadas_hoy = data["completadas"].get(hoy, [])
    for i, item in enumerate(rutina):
        if item['tarea'] not in completadas_hoy:
            print(Fore.LIGHTBLUE_EX + f"{i+1}. {item['hora']} - {item['tarea']}")

def completar_tarea(data):
    limpiar_pantalla()
    hoy = str(date.today())
    completadas_hoy = data["completadas"].get(hoy, [])
    mostrar_rutina(data)
    print(Fore.YELLOW + "Selecciona las tareas completadas separadas por comas (ej: 1,3,5):")
    entrada = input("Tareas: ")
    try:
        indices = [int(x.strip()) for x in entrada.split(",") if x.strip().isdigit()]
        for num in indices:
            if 1 <= num <= len(rutina):
                tarea_info = rutina[num-1]
                tarea = tarea_info["tarea"]
                esfuerzo = tarea_info["esfuerzo"]

                if tarea in completadas_hoy:
                    print(Fore.RED + f"⚠️ Ya completaste la tarea '{tarea}' hoy.")
                else:
                    puntos = esfuerzo * 3
                    # Solo preguntar para comidas
                    comidas = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"]
                    if tarea in comidas:
                        tipo = input(Fore.YELLOW + f"¿La {tarea.lower()} fue sana, neutra o no sana?: ").strip().lower()
                        puntos += puntos_comida.get(tipo, 0)
                    completadas_hoy.append(tarea)
                    data["puntos"] += puntos
                    registrar_historial(hoy, tarea)
                    print(Fore.GREEN + f"✅ Tarea '{tarea}' completada. ¡+{puntos} puntos!")
            else:
                print(Fore.RED + f"❌ Número inválido: {num}")
        data["completadas"][hoy] = completadas_hoy
        guardar_datos(data)
    except Exception as e:
        print(Fore.RED + f"❌ Error: {str(e)}")

def ver_puntos(data):
    print(Fore.MAGENTA + f"\n💰 Tienes {data['puntos']} puntos.")

def mostrar_tienda():
    print(Fore.CYAN + "\n🛍️ Tienda:")
    for i, (item, costo) in enumerate(tienda.items()):
        print(Fore.LIGHTBLUE_EX + f"{i+1}. {item} - {costo} puntos")

def canjear_recompensa(data):
    mostrar_tienda()
    try:
        num = int(input(Fore.YELLOW + "¿Qué quieres canjear? (número): "))
        items = list(tienda.items())
        if 1 <= num <= len(items):
            nombre, costo = items[num - 1]
            if data["puntos"] >= costo:
                data["puntos"] -= costo
                print(Fore.GREEN + f"🎉 Canjeaste '{nombre}' por {costo} puntos. ¡Disfrútalo!")
            else:
                print(Fore.RED + "❌ No tienes suficientes puntos.")
        else:
            print(Fore.RED + "❌ Número inválido.")
    except ValueError:
        print(Fore.RED + "❌ Entrada no válida. Introduce un número.")
    guardar_datos(data)

def mostrar_calendario():
    print(Fore.CYAN + "\n📆 Calendario de progreso mensual:")
    if not os.path.exists(archivo_historial):
        print("Aún no hay historial.")
        return
    with open(archivo_historial, "r") as f:
        historial = json.load(f)
    for fecha in sorted(historial):
        if fecha.startswith(f"{date.today().year}-{str(date.today().month).zfill(2)}"):
            tareas = historial[fecha]
            print(Fore.LIGHTGREEN_EX + f"{fecha}: {len(tareas)} tareas completadas ➤ {', '.join(tareas)}")

def verificar_mes_actual(data):
    mes_actual = datetime.now().month
    if data.get("mes") != mes_actual:
        print(Fore.YELLOW + "🔁 Nuevo mes detectado. Reiniciando puntos...")
        data["puntos"] = 0
        data["completadas"] = {}
        data["mes"] = mes_actual
        guardar_datos(data)

def mostrar_reloj(stop_event):
    while not stop_event.is_set():
        hora = datetime.now().strftime("%H:%M:%S")
        print(Fore.LIGHTYELLOW_EX + f"\r🕒 {hora} ", end="", flush=True)
        time.sleep(1)
    # Borra la línea del reloj al terminar
    print("\r" + " " * 20 + "\r", end="", flush=True)

# ---------------------- Menú principal ----------------------
def menu():
    data = cargar_datos()
    verificar_mes_actual(data)
    while True:
        limpiar_pantalla()
        animar_texto(Fore.CYAN + f"\n📋 MENÚ  |  Puntos: {data['puntos']}")
        print(Fore.LIGHTCYAN_EX + "1. Ver rutina")
        print("2. Marcar tareas como completadas")
        print("3. Ver puntos")
        print("4. Ver tienda")
        print("5. Canjear recompensa")
        print("6. Ver calendario mensual")
        print("7. Salir")

        # --- Reloj en tiempo real ---
        stop_event = threading.Event()
        reloj_thread = threading.Thread(target=mostrar_reloj, args=(stop_event,))
        reloj_thread.start()

        opcion = input(Fore.YELLOW + "Elige una opción: ")
        stop_event.set()
        reloj_thread.join()
        print()  # Salto de línea después del reloj

        limpiar_pantalla()

        if opcion == "1":
            mostrar_rutina(data)
        elif opcion == "2":
            completar_tarea(data)
        elif opcion == "3":
            ver_puntos(data)
        elif opcion == "4":
            mostrar_tienda()
        elif opcion == "5":
            canjear_recompensa(data)
        elif opcion == "6":
            mostrar_calendario()
        elif opcion == "7":
            animar_texto(Fore.GREEN + "👋 ¡Hasta pronto!")
            break
        else:
            print(Fore.RED + "❌ Opción inválida.")

        input(Fore.LIGHTBLACK_EX + "\nPresiona Enter para continuar...")

if __name__ == "__main__":
    menu()

{
    "puntos": 0,
    "completadas": {},
    "mes": 7
}
