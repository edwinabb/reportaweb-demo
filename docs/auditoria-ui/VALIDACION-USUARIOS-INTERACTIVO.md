# ✅ Checklist Interactivo — Validación módulo Usuarios

**Versión:** demo.reportar.app  
**Fecha de validación:** 2026-07-14  
**Usuario:** [Tu nombre]  

---

## 📋 PARTE 1: USUARIOS — Lista Principal

### Paso 1: Acceder a la lista
- [ ] Ve a `demo.reportar.app/users` (o menú Operaciones → Usuarios → Directorio)
- [ ] Espera a que carguen los datos

### Paso 2: Verificar columnas visibles
Debe haber estas **5 columnas**:

- [ ] ✅ **Nro. Documento** (primero a la izquierda después del checkbox)
- [ ] ✅ **Email**
- [ ] ✅ **Nombre** (muestra nombre completo)
- [ ] ✅ **Rol** (muestra en badge: Admin Tenant, Supervisor, Member)
- [ ] ✅ **Proveedor** (NUEVO — muestra razón social si existe)
- [ ] ✅ **Estado** (Activo/Inactivo, badge verde/rojo)

**Espera:** Debe haber ≥5 usuarios en la lista. Si hay menos, es normal (datos parciales).

### Paso 3: Validar búsqueda multicampo
En el input "Buscar por nombre o nro documento...":

- [ ] Escribe un **nombre** (ej: "Juan") → Filtra por nombre ✓
- [ ] Escribe un **número de documento** (ej: "12345678") → Filtra por DNI ✓
- [ ] Escribe **parcial** (ej: "jua" en minúsculas) → Filtra aunque sea mayúscula ✓
- [ ] Escribe en **medio del nombre** (ej: "uan" de "Juan") → Encuentra el registro ✓

**Si todo ✅:** Búsqueda multicampo funciona correctamente.

### Paso 4: Validar filtros por columna (dropdowns en headers)
Mira los encabezados de las columnas. Debe haber pequeños **ícono de filtro** (⏷) en:

- [ ] ✅ **Rol** — Haz click, selecciona "Supervisor" → Filtra usuarios con ese rol
- [ ] ✅ **Proveedor** — Haz click, selecciona un proveedor → Filtra (si hay datos)
- [ ] ✅ **Estado** — Haz click, selecciona "Activo" → Muestra solo activos

**Si todo ✅:** Filtros por columna funcionan.

### Paso 5: Ordenamiento
En cualquier columna (Nombre, Email, Estado):

- [ ] Haz click en el header → Ordena ascendente ↑
- [ ] Haz click nuevamente → Ordena descendente ↓

---

## 📋 PARTE 2: USUARIOS — Crear/Editar

### Paso 1: Crear usuario nuevo
- [ ] Haz click en "+ Nuevo Usuario"
- [ ] Debe abrirse un **formulario en 3 pasos**

### Paso 2: Validar PASO 1 (Datos Personales)
Debe tener estos campos:

- [ ] Email (required)
- [ ] Password (required, >6 caracteres)
- [ ] Nombre (required)
- [ ] Apellido (required)
- [ ] Tipo de Documento (select: DNI, CE, PASSPORT, etc.)
- [ ] Nro. de Documento (required)
- [ ] Género (select: Masculino/Femenino) — NUEVO
- [ ] Rol (select: Admin, Supervisor, Member)
- [ ] Cargo (select con list de trabajos) — NUEVO
- [ ] Botones: Anterior, Cerrar, Siguiente

**NO debe haber en este paso:**
- [ ] ❌ Firma Electrónica (está en paso 2 ahora)
- [ ] ❌ PIN de Seguridad (está en paso 2 ahora)

### Paso 3: Validar PASO 2 (Contacto)
Debe tener estos campos (EN ESTE ORDEN):

- [ ] Dirección (textarea, sin mapa — VERIFICAR NO HAY GOOGLE MAPS) ← CAMBIO APROBADO
- [ ] Contacto Emergencia → Nombres y apellidos familiar
- [ ] Contacto Emergencia → Parentesco (select)
- [ ] Contacto Emergencia → Número de celular
- [ ] **FIRMA ELECTRÓNICA** (upload + preview) ← MOVIDO AQUÍ DEL PASO 1
- [ ] **PIN DE SEGURIDAD** (input masked) ← MOVIDO AQUÍ DEL PASO 1

**Validar orden:**
```
1. Dirección
2. Contacto Emergencia (3 campos)
3. Firma Electrónica
4. PIN de Seguridad
```

### Paso 4: Validar PASO 3 (Documentación)
- [ ] Tabla de "Documentos del Usuario"
- [ ] Botón "+ Agregar documento"
- [ ] Columnas: Tipo, Válido desde, Válido hasta, Estado, Acciones

### Paso 5: Crear usuario test
- [ ] Completa PASO 1 con datos válidos
- [ ] En PASO 2:
  - [ ] Ingresa dirección (ej: "Calle Principal 123")
  - [ ] Ingresa contacto emergencia (nombre + parentesco + celular)
  - [ ] Sube foto o firma (o sáltalo)
  - [ ] Ingresa PIN (ej: "1234")
- [ ] Paso 3: Sáltalo (tabla documentos)
- [ ] Haz click "Crear Usuario"
- [ ] Debe regresar a la lista y el usuario debe aparecer

**Si llegaste hasta aquí:** ✅ Crear/editar funciona.

---

## 📋 PARTE 3: TIPOS DE DOCUMENTO — Lista

### Paso 1: Acceder
- [ ] Ve a Configuración → Tipos de Documento

### Paso 2: Verificar columnas
Debe haber:

- [ ] **Nombre** (ej: "Cédula de Identidad")
- [ ] **Categoría** (badge: "Con Vencimiento", "Seguro", "Sin Vencimiento")
- [ ] **Estado** (Activo/Inactivo)
- [ ] **Días Alerta** (ej: "30 días")

### Paso 3: Validar filtros de columna
En los headers de **Categoría** y **Estado**:

- [ ] Haz click en filtro de Categoría → Selecciona "Seguro" → Filtra
- [ ] Haz click en filtro de Estado → Selecciona "Inactivo" → Filtra

**Si ✅:** Filtros funcionan.

### Paso 4: Validar búsqueda
- [ ] Escribe nombre tipo doc (ej: "Pasaporte") → Filtra
- [ ] Escribe parcial (ej: "port") → Encuentra

---

## 📋 PARTE 4: DOCUMENTOS DE USUARIO — Lista

### Paso 1: Acceder
- [ ] Ve a Operaciones → Usuarios → Documentación

### Paso 2: Verificar columnas
Debe haber:

- [ ] **Usuario** (nombre completo)
- [ ] **Tipo Documento** (ej: "Pasaporte")
- [ ] **Válido Desde** (fecha)
- [ ] **Estado** (Vigente/Por Vencer/Vencido/Deshabilitado)
- [ ] **Vence** (fecha)
- [ ] **Archivo** (link "Descargar" o icono)

### Paso 3: Validar búsqueda
- [ ] Input "Buscar usuario o DNI..." escribe nombre → Filtra por nombre usuario
- [ ] Escribe DNI → Filtra por documento del usuario

**Si ✅:** Búsqueda multicampo funciona.

### Paso 4: Validar filtros
Debe haber **3 selectores** en la barra superior:

- [ ] "Tipo Documento" (select) → Filtra por tipo
- [ ] "Vencimiento" (select: Todos/Por vencer/Vencidos) → Filtra por estado
- [ ] "Estado" (select: Todos/Activos/Inactivos) — NUEVO ← Filtra activos/inactivos

**Si todos ✅:** Filtros funcionan.

---

## 📊 PARTE 5: Datos de Cobertura

### Usuarios
- [ ] Total usuarios: ≥ 50 (esperados CISE 103 + GRUAS 224 = 327)
- [ ] Usuarios con Proveedor: ≥ 200 (esperados 209: GRUAS 142, CISE 67)
- [ ] Usuarios sin Proveedor: OK (campo puede estar vacío)

### Tipos de Documento
- [ ] Total tipos: ≥ 40 (esperados 48: CISE 14, GRUAS 31)
- [ ] Columnas visibles: Nombre, Categoría, Estado, Días Alerta ✓

### Documentos
- [ ] Total documentos: ≥ 600 (esperados 652: CISE 167, GRUAS 485)
- [ ] Búsqueda multicampo funciona ✓
- [ ] Filtros funcionan ✓

---

## 🔴 PARTE 6: Validar que NO hay problemas

### UI Visual
- [ ] ❌ No hay errores en rojo en la consola (F12 → Console)
- [ ] ❌ No hay textos cortados o superpuestos
- [ ] ❌ No hay componentes rotos (dropdowns, inputs, botones)

### Performance
- [ ] La lista carga en < 3 segundos
- [ ] Los filtros responden sin demora (< 500ms)
- [ ] La búsqueda es rápida (< 500ms)

### Funcionalidad
- [ ] Puedo crear un usuario sin errores
- [ ] Puedo editar un usuario
- [ ] Puedo ver un usuario
- [ ] Los filtros filtran correctamente

---

## ✅ FIRMA FINAL

**Validado por:** ______________________ **Fecha:** ______________

**Resultado:**
- [ ] ✅ TODO FUNCIONA — Sistema listo para producción
- [ ] 🟡 CASI TODO OK — Algunos filtros/búsquedas no funcionan (DETALLAR abajo)
- [ ] 🔴 PROBLEMAS SERIOS — Faltan columnas o datos (DETALLAR abajo)

**Detalles de problemas encontrados:**
```
[Espacio para anotar qué no funciona]
```

---

## 📸 ANEXO: Capturas de Pantalla para Comparar

### Antes (Bubble)
Captura esperada: `c:/tmp/screenshots/reportar/1 usuarios/`
- Columnas, búsqueda, filtros

### Después (Reportaweb3 — Demo)
Deberías ver:
- 📸 La lista con las 5+ columnas
- 📸 El input de búsqueda multicampo
- 📸 Los dropdowns de filtro en los headers
- 📸 El formulario de 3 pasos al crear usuario

**Si tienes dudas en cualquier paso, toma screenshot y comparte. Así vemos exactamente qué ves vs. qué se espera.**

---

**¿Comenzaste la validación? Cuéntame cuál es el primer punto donde ves diferencia con Bubble (si es que la hay).**
