# 📋 Scripts de Automatización

Este proyecto incluye scripts de automatización para facilitar la instalación y ejecución del sistema.

## 🚀 Scripts Disponibles

### 1. `instalar-dependencias.bat`
**Propósito:** Instala todas las dependencias del proyecto (backend y frontend)

**Uso:**
```bash
.\instalar-dependencias.bat
```

**Funcionalidades:**
- ✅ Instala dependencias del backend
- ✅ Instala dependencias del frontend
- ✅ Verifica errores de instalación
- ✅ Proporciona soluciones en caso de error

---

### 2. `start-servers.bat`
**Propósito:** Inicia ambos servidores (backend y frontend) automáticamente

**Uso:**
```bash
.\start-servers.bat
```

**Funcionalidades:**
- ✅ Inicia el backend en http://localhost:5000
- ✅ Inicia el frontend en http://localhost:3000
- ✅ Abre ventanas separadas para cada servidor
- ✅ Espera a que el backend se inicie antes del frontend

---

### 3. `verificar-servidores.bat`
**Propósito:** Verifica que ambos servidores estén funcionando correctamente

**Uso:**
```bash
.\verificar-servidores.bat
```

**Funcionalidades:**
- ✅ Verifica conectividad del backend
- ✅ Verifica conectividad del frontend
- ✅ Proporciona información detallada del estado
- ✅ Muestra usuarios de prueba y funcionalidades

---

## 🔄 Flujo de Trabajo Recomendado

### Primera Instalación:
1. **Instalar dependencias:** `.\instalar-dependencias.bat`
2. **Iniciar servidores:** `.\start-servers.bat`
3. **Verificar funcionamiento:** `.\verificar-servidores.bat`

### Uso Diario:
1. **Iniciar servidores:** `.\start-servers.bat`
2. **Abrir navegador:** http://localhost:3000

---

## 🛠️ Solución de Problemas

### Error: "npm no se reconoce como comando"
**Solución:** Instala Node.js desde https://nodejs.org

### Error: "MongoDB no responde"
**Solución:** Inicia MongoDB localmente

### Error: "Puerto ya en uso"
**Solución:** Cierra las ventanas de los servidores y vuelve a ejecutar

---

## 📱 Acceso a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### 👤 Usuarios de Prueba:
- **Admin:** admin@proyecto6.com / Admin123!
- **Usuario:** usertest@proyecto6.com / User123!

---

## 🎯 Funcionalidades Disponibles

- ✅ Catálogo de productos con filtros
- ✅ Carrito de compras con persistencia
- ✅ Sistema de autenticación JWT
- ✅ Panel de administración completo
- ✅ Pasarela de pagos Stripe (modo prueba)
- ✅ Gestión de pedidos con estados
- ✅ Dashboard con estadísticas
