"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, Trash2 } from "lucide-react"
import { createTarea, saveTareaBorradorBasic, getAvailability } from "@/lib/actions/planificacion"
import { getFestivosForTenant, type Festivo } from "@/lib/actions/festivos"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { ResourceTimeline } from "./resource-timeline"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { QuickTerceroDialog } from "@/components/terceros/quick-tercero-dialog"
import { ContactoDialog } from "@/components/terceros/contacto-dialog"
import { SitioDialog } from "@/components/terceros/sitio-dialog"
import { getTerceroContactos, getTerceroSitios } from "@/lib/actions/terceros-modules"
import { getCotizacionesByClienteId, getServiciosByCotizacionId, getAllServicios } from "@/lib/actions/cotizaciones"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { TareaWithRelations } from "@/types/planificacion"

// Types for local state form
interface FormData {
    titulo: string
    cliente_id: string
    cliente_nombre: string
    contacto_id: string
    sitio: string
    fecha_inicio: Date | undefined
    fecha_fin: Date | undefined
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA'
    fechas_multiples: Date[]
    descripcion: string
    tipo_tarea: string
    servicio: string
    cotizacion: string
    confirmada: boolean
    hora_inicio: string
    hora_fin: string
}

// Complex assignment type
interface DetailedAssignment {
    resourceId: string // id interno o sintético "ext:<uuid>" para externos
    resourceType: 'PERSONAL' | 'MAQUINARIA'
    resourceName: string
    resourceDetail?: string // Role or Code
    dates: string[] // Strings YYYY-MM-DD
    tipo_contratacion: 'INTERNO' | 'EXTERNO'
    proveedor_id?: string | null
    proveedor_nombre?: string | null
    recurso_externo_nombre?: string | null
}

interface AvailSlot { resourceId: string; tipo: 'PERSONAL' | 'MAQUINARIA'; date: string; tarea: { id: string; titulo: string; sitio: string; codigo: string } }

// YYYY-MM-DD → Date local anclada a mediodía (evita off-by-one por huso horario)
const ymdToLocalNoon = (ymd: string) => new Date(ymd + 'T12:00:00')

/** Expande un intervalo de tareas_fechas a su lista de días YYYY-MM-DD. */
function expandIntervaloYmd(f: { fecha_inicio: string | null; fecha_fin: string | null; fechas_multiples: string[] | null }): string[] {
    if (f.fechas_multiples && f.fechas_multiples.length > 0) return [...f.fechas_multiples].sort()
    if (!f.fecha_inicio) return []
    const out: string[] = []
    let cursor = ymdToLocalNoon(f.fecha_inicio)
    const end = ymdToLocalNoon(f.fecha_fin ?? f.fecha_inicio)
    // tope defensivo ante rangos corruptos (400 días ≈ 13 meses)
    while (cursor <= end && out.length < 400) {
        out.push(format(cursor, 'yyyy-MM-dd'))
        cursor = addDays(cursor, 1)
    }
    return out
}

const TIPO_TAREA_OPTIONS = [
    'MANTENIMIENTO', 'MERCADEO', 'OPERACIONES', 'PERSONAL', 'PROYECTOS',
    'SST', 'STAND BY', 'TURNOS', 'VACACIONES', 'VENTAS'
]

type ProveedorOption = { id: string; razon_social?: string | null; ruc?: string | null }

interface PersonalItem { id: string; nombre: string; avatar?: string | null; cargo_id?: string | null; personal_externo?: boolean; tercero_id?: string | null }
interface MaquinariaItem { id: string; nombre: string; codigo: string; categoria?: string | null; modelo?: string; propietario?: string | null; proveedor_id?: string | null }

interface Props {
    personalList: PersonalItem[]
    maquinariaList: MaquinariaItem[]
    clientes: any[]
    proveedores?: ProveedorOption[]
    cargos?: { id: string; nombre: string }[]
    tareaToEdit?: TareaWithRelations
    fechaInicio?: string
}

export function NuevaTareaForm({ personalList = [], maquinariaList = [], clientes = [], proveedores = [], cargos = [], tareaToEdit, fechaInicio }: Props) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("info") // info, personal, maquinaria
    const [savedTareaId, setSavedTareaId] = useState<string | null>(null)

    // Base Form Data
    const [formData, setFormData] = useState<FormData>({
        titulo: "",
        cliente_id: "",
        cliente_nombre: "",
        contacto_id: "",
        sitio: "",
        fecha_inicio: new Date(),
        fecha_fin: new Date(),
        prioridad: 'MEDIA',
        fechas_multiples: [],
        descripcion: "",
        tipo_tarea: "",
        servicio: "",
        cotizacion: "",
        confirmada: false,
        hora_inicio: "",
        hora_fin: "",
    })

    // Dependent Data States
    const [contactos, setContactos] = useState<{ id: string; nombre_completo: string }[]>([])
    const [sitios, setSitios] = useState<{ id: string; nombre: string }[]>([])
    const [cotizacionesCliente, setCotizacionesCliente] = useState<{ id: string; numero: string; estado: string }[]>([])
    const [loadedClientId, setLoadedClientId] = useState<string>("")
    const loadingDependents = !!formData.cliente_id && formData.cliente_id !== loadedClientId

    // Servicios
    const [cotizacionIdSeleccionado, setCotizacionIdSeleccionado] = useState<string>("")
    const [cotizacionItemIdSeleccionado, setCotizacionItemIdSeleccionado] = useState<string>("")
    const [serviciosOptions, setServiciosOptions] = useState<{ id: string; nombre: string | null; codigo: string; detalle_id?: string }[]>([])

    // Dialog States
    const [openClienteDialog, setOpenClienteDialog] = useState(false)
    const [openContactoDialog, setOpenContactoDialog] = useState(false)
    const [openSitioDialog, setOpenSitioDialog] = useState(false)


    // Assignments State
    const [assignedPersonal, setAssignedPersonal] = useState<DetailedAssignment[]>([])
    const [assignedMaquinaria, setAssignedMaquinaria] = useState<DetailedAssignment[]>([])

    // Festivos
    const [festivos, setFestivos] = useState<Festivo[]>([])

    // Availability Data
    const [availability, setAvailability] = useState<AvailSlot[]>([])
    const [timelineStart, setTimelineStart] = useState(new Date())
    const [timelineEnd, setTimelineEnd] = useState(addDays(new Date(), 6))

    // UI States for Assignment
    const [selectedPersonalId, setSelectedPersonalId] = useState<string>("")
    const [selectedMaquinariaId, setSelectedMaquinariaId] = useState<string>("")
    const [assignmentScope, setAssignmentScope] = useState<'ALL' | 'FUTURE' | 'SINGLE'>('ALL')

    // Interno / Externo (proveedor RH / subcontratación)
    const [personalTipo, setPersonalTipo] = useState<'INTERNO' | 'EXTERNO'>('INTERNO')
    const [personalProveedorId, setPersonalProveedorId] = useState<string>("")
    const [selectedPersonalExternoId, setSelectedPersonalExternoId] = useState<string>("")
    const [maquinariaTipo, setMaquinariaTipo] = useState<'INTERNO' | 'EXTERNO'>('INTERNO')
    const [maquinariaProveedorId, setMaquinariaProveedorId] = useState<string>("")
    const [maquinariaExternoNombre, setMaquinariaExternoNombre] = useState<string>("")

    // Cargo / Categoría filters
    const [filterCargoPersonal, setFilterCargoPersonal] = useState<string>("")
    const [filterCargoExterno, setFilterCargoExterno] = useState<string>("")
    const [filterCategoriaM, setFilterCategoriaM] = useState<string>("")
    const [maquinariaExternaId, setMaquinariaExternaId] = useState<string>("")

    // Availability badge filters
    const [availabilityFilterP, setAvailabilityFilterP] = useState<'ALL' | 'DISPONIBLE' | 'PARCIAL' | 'OCUPADO'>('ALL')
    const [availabilityFilterM, setAvailabilityFilterM] = useState<'ALL' | 'DISPONIBLE' | 'PARCIAL' | 'OCUPADO'>('ALL')

    // Edit mode: initialize form from existing tarea.
    // Rehidrata TODO: header, todas las fechas de todos los intervalos y todos
    // los recursos asignados. Es crítico porque createTarea en edición hace
    // replace-all: lo que no esté en el estado del form se pierde al guardar.
    useEffect(() => {
        if (!tareaToEdit) return
        setSavedTareaId(tareaToEdit.id)
        setFormData(prev => ({
            ...prev,
            titulo:         tareaToEdit.titulo ?? '',
            descripcion:    tareaToEdit.descripcion ?? '',
            tipo_tarea:     tareaToEdit.tipo_tarea ?? '',
            servicio:       tareaToEdit.servicio_ref ?? '',
            prioridad:      (tareaToEdit.prioridad ?? 'MEDIA') as 'BAJA' | 'MEDIA' | 'ALTA',
            cliente_id:     tareaToEdit.cliente_id ?? '',
            cliente_nombre: tareaToEdit.cliente_nombre ?? '',
            contacto_id:    tareaToEdit.contacto_id ?? '',
            cotizacion:     tareaToEdit.cotizacion_ref ?? '',
            sitio:          tareaToEdit.sitio ?? '',
            confirmada:     tareaToEdit.estado === 'CONFIRMADA',
            hora_inicio:    tareaToEdit.hora_inicio?.slice(0, 5) ?? '',
            hora_fin:       tareaToEdit.hora_fin?.slice(0, 5) ?? '',
        }))
        if (tareaToEdit.cotizacion_id) {
            setCotizacionIdSeleccionado(tareaToEdit.cotizacion_id)
        }
        if (tareaToEdit.cotizacion_item_id) {
            setCotizacionItemIdSeleccionado(tareaToEdit.cotizacion_item_id)
        }

        // 1) Fechas: unión de los días de TODOS los intervalos activos
        const intervalos = (tareaToEdit.fechas ?? []).filter(f => f.is_active !== false)
        const diasPorIntervalo = new Map<string, string[]>()
        const allDates = new Set<string>()
        for (const f of intervalos) {
            const dias = expandIntervaloYmd(f)
            diasPorIntervalo.set(f.id, dias)
            dias.forEach(d => allDates.add(d))
        }
        // ?fecha= de la URL solo aplica cuando la tarea aún no tiene fechas propias
        if (allDates.size === 0 && fechaInicio) allDates.add(fechaInicio)
        const sortedYmd = [...allDates].sort()
        if (sortedYmd.length > 0) {
            const asDates = sortedYmd.map(ymdToLocalNoon)
            setFormData(prev => ({
                ...prev,
                fecha_inicio: asDates[0],
                fecha_fin: asDates[asDates.length - 1],
                fechas_multiples: asDates,
            }))
        }

        // 2) Recursos: reconstruir asignaciones fusionando por recurso los días
        //    de todos sus intervalos. Externo = proveedor_id != null (misma
        //    semántica que el guardado).
        const byKey = new Map<string, DetailedAssignment>()
        for (const f of intervalos) {
            const dias = diasPorIntervalo.get(f.id) ?? []
            for (const r of f.recursos ?? []) {
                if (r.is_active === false) continue
                const esExterno = r.proveedor_id != null
                const proveedor = esExterno ? proveedores.find(p => p.id === r.proveedor_id) : undefined
                let assignment: DetailedAssignment
                if (r.tipo_recurso === 'PERSONAL') {
                    const p = r.personal_id ? personalList.find(x => x.id === r.personal_id) : undefined
                    const cargoNombre = p?.cargo_id ? cargos.find(c => c.id === p.cargo_id)?.nombre : undefined
                    assignment = {
                        resourceId: r.personal_id ?? `ext-personal-${r.id}`,
                        resourceType: 'PERSONAL',
                        resourceName: p?.nombre ?? r.recurso_externo_nombre ?? 'Personal',
                        resourceDetail: esExterno
                            ? [cargoNombre, proveedor?.razon_social ? `Proveedor: ${proveedor.razon_social}` : 'Externo'].filter(Boolean).join(' · ')
                            : (cargoNombre || 'Personal interno'),
                        dates: dias,
                        tipo_contratacion: esExterno ? 'EXTERNO' : 'INTERNO',
                        proveedor_id: r.proveedor_id,
                        proveedor_nombre: proveedor?.razon_social ?? null,
                        recurso_externo_nombre: r.recurso_externo_nombre,
                    }
                } else {
                    const m = r.maquinaria_id ? maquinariaList.find(x => x.id === r.maquinaria_id) : undefined
                    assignment = {
                        resourceId: r.maquinaria_id ?? `ext-maquinaria-${r.id}`,
                        resourceType: 'MAQUINARIA',
                        resourceName: m?.nombre ?? r.recurso_externo_nombre ?? 'Equipo externo',
                        resourceDetail: esExterno
                            ? (proveedor?.razon_social ? `Proveedor: ${proveedor.razon_social}` : 'Externo')
                            : [m?.categoria, m?.codigo].filter(Boolean).join(' · '),
                        dates: dias,
                        tipo_contratacion: esExterno ? 'EXTERNO' : 'INTERNO',
                        proveedor_id: r.proveedor_id,
                        proveedor_nombre: proveedor?.razon_social ?? null,
                        recurso_externo_nombre: r.recurso_externo_nombre,
                    }
                }
                // Recursos reales se fusionan por su id; externos sin id de catálogo,
                // por proveedor + nombre (así el mismo equipo externo en 2 intervalos
                // queda como una sola asignación con todas sus fechas).
                const realId = r.tipo_recurso === 'PERSONAL' ? r.personal_id : r.maquinaria_id
                const key = realId
                    ? `${r.tipo_recurso}:${realId}`
                    : `${r.tipo_recurso}:EXT:${r.proveedor_id ?? ''}:${r.recurso_externo_nombre ?? ''}`
                const existente = byKey.get(key)
                if (existente) {
                    existente.dates = [...new Set([...existente.dates, ...dias])].sort()
                } else {
                    byKey.set(key, assignment)
                }
            }
        }
        const rehidratados = [...byKey.values()]
        setAssignedPersonal(rehidratados.filter(a => a.resourceType === 'PERSONAL'))
        setAssignedMaquinaria(rehidratados.filter(a => a.resourceType === 'MAQUINARIA'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tareaToEdit?.id]) // only on mount / tarea change

    // Si el usuario cambia las fechas de la tarea en el calendario, las
    // asignaciones que cubrían TODAS las fechas anteriores pasan a cubrir todas
    // las nuevas; las que tenían días específicos se intersectan con las fechas
    // vigentes (y si quedan vacías, pasan a todas — el recurso no se pierde).
    const prevFullSetRef = useRef<string>('')
    useEffect(() => {
        const full = formData.fechas_multiples.map(d => format(d, 'yyyy-MM-dd')).sort()
        const fullSig = full.join(',')
        const prevSig = prevFullSetRef.current
        prevFullSetRef.current = fullSig
        if (!prevSig || !fullSig || prevSig === fullSig) return
        const remap = (list: DetailedAssignment[]) => list.map(a => {
            const sig = [...a.dates].sort().join(',')
            if (sig === prevSig) return { ...a, dates: full }
            const inter = a.dates.filter(d => full.includes(d))
            return { ...a, dates: inter.length > 0 ? inter : full }
        })
        setAssignedPersonal(prev => remap(prev))
        setAssignedMaquinaria(prev => remap(prev))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.fechas_multiples])

    // Split personal by tipo (externo = proveedor RH, interno = propio)
    const personalInterno = personalList.filter(p => !p.personal_externo)
    const personalExterno = personalList.filter(p => p.personal_externo)

    // Muestra todos los cargos del catálogo (no solo los asignados) para que el filtro funcione
    // aunque los perfiles migrados no tengan job_title_id vinculado aún
    const cargosInterno = [...cargos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    const personalExternoDelProveedor = personalProveedorId
        ? personalExterno.filter(p => p.tercero_id === personalProveedorId)
        : personalExterno
    const cargoIdsExterno = new Set(personalExternoDelProveedor.map(p => p.cargo_id).filter(Boolean))
    const cargosExternoFiltrado = cargos.filter(c => cargoIdsExterno.has(c.id)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    // Personal externo filtrado por proveedor y cargo (para el dropdown selector)
    const personalExternoFiltrado = personalExterno
        .filter(p => !personalProveedorId || p.tercero_id === personalProveedorId)
        .filter(p => !filterCargoExterno || p.cargo_id === filterCargoExterno)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    // Proveedores que tienen personal externo registrado
    const terceroIdsConPersonal = new Set(personalExterno.map(p => p.tercero_id).filter(Boolean))
    const proveedoresConPersonal = proveedores.filter(p => terceroIdsConPersonal.has(p.id))
        .sort((a, b) => (a.razon_social || '').localeCompare(b.razon_social || '', 'es'))

    // Derived: unique categories from own machinery only
    const categoriasDisponibles = [...new Set(
        maquinariaList.filter(m => m.categoria && (!m.propietario || m.propietario === 'propio')).map(m => m.categoria as string)
    )].sort((a, b) => a.localeCompare(b, 'es'))

    // Derived: personal INTERNO filtered by selected cargo
    const personalFiltrado = personalInterno
        .filter(p => !filterCargoPersonal || p.cargo_id === filterCargoPersonal)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    // Derived: maquinaria propia (for INTERNO) filtered by selected category
    const maquinariaFiltrada = maquinariaList
        .filter(m => !m.propietario || m.propietario === 'propio')
        .filter(m => !filterCategoriaM || m.categoria === filterCategoriaM)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    // Derived: maquinaria from terceros (for EXTERNO), filtered by selected proveedor
    const maquinariaTerceros = maquinariaList
        .filter(m => m.propietario === 'tercero')
        .filter(m => !maquinariaProveedorId || m.proveedor_id === maquinariaProveedorId)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    // Proveedores que tienen maquinaria registrada en el sistema
    const proveedorIdsConMaquinaria = new Set(
        maquinariaList.filter(m => m.propietario === 'tercero' && m.proveedor_id).map(m => m.proveedor_id!)
    )
    const proveedoresConMaquinaria = proveedores.filter(p => proveedorIdsConMaquinaria.has(p.id))
        .sort((a, b) => (a.razon_social || '').localeCompare(b.razon_social || '', 'es'))

    // Availability status helper
    const selectedDateStrings = formData.fechas_multiples.map(d => format(d, 'yyyy-MM-dd'))
    const getAvailStatus = (resourceId: string, tipo: 'PERSONAL' | 'MAQUINARIA') => {
        if (selectedDateStrings.length === 0) return 'DISPONIBLE'
        const occupied = selectedDateStrings.filter(date =>
            availability.some(a => a.resourceId === resourceId && a.tipo === tipo && a.date.startsWith(date))
        )
        if (occupied.length === 0) return 'DISPONIBLE'
        if (occupied.length === selectedDateStrings.length) return 'OCUPADO'
        return 'PARCIAL'
    }

    // Timeline resources — solo personal INTERNO, filtrado por cargo + disponibilidad
    const personalParaTimeline = personalInterno
        .filter(p => !filterCargoPersonal || p.cargo_id === filterCargoPersonal)
        .filter(p => availabilityFilterP === 'ALL' || getAvailStatus(p.id, 'PERSONAL') === availabilityFilterP)

    // Timeline resources — solo maquinaria del modo activo, filtrada por categoría/proveedor + disponibilidad
    const maquinariaParaTimeline = (maquinariaTipo === 'INTERNO' ? maquinariaFiltrada : maquinariaTerceros)
        .filter(m => availabilityFilterM === 'ALL' || getAvailStatus(m.id, 'MAQUINARIA') === availabilityFilterM)

    // Cargar festivos al montar
    useEffect(() => {
        getFestivosForTenant().then(setFestivos)
    }, [])

    // Load servicios based on selected cotización (or all if none)
    useEffect(() => {
        if (!cotizacionIdSeleccionado) {
            getAllServicios().then(s => setServiciosOptions(s))
            return
        }
        getServiciosByCotizacionId(cotizacionIdSeleccionado).then(s => {
            if (s.length > 0) {
                setServiciosOptions(s)
            } else {
                getAllServicios().then(all => setServiciosOptions(all))
            }
        })
    }, [cotizacionIdSeleccionado])

    // Fetch dependents when client changes
    useEffect(() => {
        const id = formData.cliente_id
        if (!id) {
            Promise.resolve().then(() => {
                setContactos([])
                setSitios([])
                setCotizacionesCliente([])
                setLoadedClientId("")
            })
            return
        }
        Promise.all([
            getTerceroContactos(true, id),
            getTerceroSitios(true, id),
            getCotizacionesByClienteId(id),
        ]).then(([c, s, cots]) => {
            setContactos(c)
            setSitios(s)
            setCotizacionesCliente(cots)
            setLoadedClientId(id)
        })
    }, [formData.cliente_id])

    // Fetch availability covering both the timeline window AND the selected task dates
    useEffect(() => {
        if (activeTab !== 'personal' && activeTab !== 'maquinaria') return
        const fetchAvail = async () => {
            const allDates = [timelineStart, timelineEnd, ...formData.fechas_multiples]
            const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
            const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
            const startStr = format(minDate, 'yyyy-MM-dd')
            const endStr = format(maxDate, 'yyyy-MM-dd')
            const data = await getAvailability(startStr, endStr)
            setAvailability(data as AvailSlot[])
        }
        fetchAvail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timelineStart, timelineEnd, activeTab, formData.fechas_multiples.length])



    // Helper to calculate assignment dates based on scope
    const calculateDates = () => {
        if (assignmentScope === 'ALL') {
            return formData.fechas_multiples.map(d => format(d, 'yyyy-MM-dd'))
        }
        // Simplified for MVP: FUTURE and SINGLE default to ALL or first for now as we don't have a "Selected Reference Date" in UI yet
        // For 'SINGLE', we could use the start date, but let's stick to 'ALL' as primary for this refactor.
        // User requested radio buttons, implementing logic:
        return formData.fechas_multiples.map(d => format(d, 'yyyy-MM-dd'))
    }

    const handleAddPersonal = () => {
        const dates = calculateDates()
        const proveedor = proveedores.find(p => p.id === personalProveedorId)

        if (personalTipo === 'INTERNO') {
            if (!selectedPersonalId) return
            const p = personalList.find(x => x.id === selectedPersonalId)
            if (!p) return

            if (assignedPersonal.some(a => a.tipo_contratacion === 'INTERNO' && a.resourceId === p.id)) {
                toast.error("El personal ya está asignado")
                return
            }

            const cargoNombre = cargos.find(c => c.id === p.cargo_id)?.nombre
            setAssignedPersonal([...assignedPersonal, {
                resourceId: p.id,
                resourceType: 'PERSONAL',
                resourceName: p.nombre,
                resourceDetail: cargoNombre || 'Personal interno',
                dates,
                tipo_contratacion: 'INTERNO',
            }])
            setSelectedPersonalId("")
        } else {
            if (!personalProveedorId) {
                toast.error("Seleccione un proveedor de RH")
                return
            }
            if (!selectedPersonalExternoId) {
                toast.error("Seleccione el recurso externo de la lista")
                return
            }
            const personaExt = personalExterno.find(p => p.id === selectedPersonalExternoId)
            if (!personaExt) return
            const cargoExternoNombre = cargos.find(c => c.id === personaExt.cargo_id)?.nombre
            setAssignedPersonal([...assignedPersonal, {
                resourceId: personaExt.id,
                resourceType: 'PERSONAL',
                resourceName: personaExt.nombre,
                resourceDetail: [
                    cargoExternoNombre,
                    proveedor?.razon_social ? `Proveedor: ${proveedor.razon_social}` : 'Externo'
                ].filter(Boolean).join(' · '),
                dates,
                tipo_contratacion: 'EXTERNO',
                proveedor_id: personalProveedorId,
                proveedor_nombre: proveedor?.razon_social ?? null,
                recurso_externo_nombre: personaExt.nombre,
            }])
            setSelectedPersonalExternoId("")
        }
    }

    const handleAddMaquinaria = () => {
        const dates = calculateDates()
        const proveedor = proveedores.find(p => p.id === maquinariaProveedorId)

        if (maquinariaTipo === 'INTERNO') {
            if (!selectedMaquinariaId) return
            const m = maquinariaList.find(x => x.id === selectedMaquinariaId)
            if (!m) return

            if (assignedMaquinaria.some(a => a.tipo_contratacion === 'INTERNO' && a.resourceId === m.id)) {
                toast.error("La maquinaria ya está asignada")
                return
            }

            setAssignedMaquinaria([...assignedMaquinaria, {
                resourceId: m.id,
                resourceType: 'MAQUINARIA',
                resourceName: m.nombre,
                resourceDetail: [m.categoria, m.codigo].filter(Boolean).join(' · '),
                dates,
                tipo_contratacion: 'INTERNO',
            }])
            setSelectedMaquinariaId("")
        } else {
            if (!maquinariaProveedorId) {
                toast.error("Seleccione un proveedor")
                return
            }
            if (!maquinariaExternoNombre.trim()) {
                toast.error("Indique el equipo externo (placa/código)")
                return
            }
            const syntheticId = `ext-maquinaria-${crypto.randomUUID()}`
            setAssignedMaquinaria([...assignedMaquinaria, {
                resourceId: syntheticId,
                resourceType: 'MAQUINARIA',
                resourceName: maquinariaExternoNombre.trim(),
                resourceDetail: proveedor?.razon_social ? `Proveedor: ${proveedor.razon_social}` : 'Externo',
                dates,
                tipo_contratacion: 'EXTERNO',
                proveedor_id: maquinariaProveedorId,
                proveedor_nombre: proveedor?.razon_social ?? null,
                recurso_externo_nombre: maquinariaExternoNombre.trim(),
            }])
            setMaquinariaExternoNombre("")
        }
    }

    const formatDateRange = () => {
        if (formData.fechas_multiples.length === 0) return "Seleccione fechas"
        return `${formData.fechas_multiples.length} días seleccionados`
    }

    const handleSubmit = async () => {
        setIsLoading(true)

        // Agrupamos recursos por firma de fechas. Cada grupo único = un intervalo
        // en tareas_fechas. Así un solo recurso asignado a {1,2,...,30} es 1 fila
        // con fecha_inicio+fecha_fin; si otro recurso trabaja {1,8,15}, es otro
        // intervalo con fechas_multiples.
        type ResInput = {
            tipo_recurso: 'PERSONAL' | 'MAQUINARIA'
            recurso_id: string
            recurso_externo_nombre?: string | null
            proveedor_id?: string | null
        }
        type AssignmentFlat = {
            tipo_recurso: 'PERSONAL' | 'MAQUINARIA'
            id: string
            dates: string[]
            tipo_contratacion: 'INTERNO' | 'EXTERNO'
            proveedor_id?: string | null
            recurso_externo_nombre?: string | null
        }
        // Invariante: ningún recurso puede quedar asignado a un día que ya no es
        // parte de la tarea. Se intersecta con las fechas vigentes del calendario;
        // si la intersección queda vacía, el recurso pasa a todas las fechas.
        const fullDates = [...formData.fechas_multiples]
            .sort((a, b) => a.getTime() - b.getTime())
            .map((d) => format(d, 'yyyy-MM-dd'))
        const clampDates = (dates: string[]) => {
            const inter = dates.filter((d) => fullDates.includes(d))
            return inter.length > 0 ? inter : fullDates
        }

        const allAssignments: AssignmentFlat[] = [
            ...assignedPersonal.map<AssignmentFlat>((a) => ({
                tipo_recurso: 'PERSONAL',
                id: a.resourceId,
                dates: clampDates(a.dates),
                tipo_contratacion: a.tipo_contratacion,
                proveedor_id: a.proveedor_id ?? null,
                recurso_externo_nombre: a.recurso_externo_nombre ?? null,
            })),
            ...assignedMaquinaria.map<AssignmentFlat>((a) => ({
                tipo_recurso: 'MAQUINARIA',
                id: a.resourceId,
                dates: clampDates(a.dates),
                tipo_contratacion: a.tipo_contratacion,
                proveedor_id: a.proveedor_id ?? null,
                recurso_externo_nombre: a.recurso_externo_nombre ?? null,
            })),
        ]

        const groupsByDateSig = new Map<string, { dates: string[]; recursos: ResInput[] }>()
        for (const a of allAssignments) {
            const sortedDates = [...a.dates].sort()
            const sig = sortedDates.join(',')
            if (!groupsByDateSig.has(sig)) groupsByDateSig.set(sig, { dates: sortedDates, recursos: [] })
            // Personal EXTERNO tiene un profile UUID real → siempre lo pasamos para que
            // tareas_recursos.personal_id quede vinculado y getAvailability lo detecte.
            // Ids sintéticos "ext-..." (maquinaria externa manual, o recursos legacy
            // rehidratados sin FK) no son UUID reales → se pasa '' (el server lo
            // convierte en NULL y el recurso se identifica por proveedor + nombre).
            const isSynthetic = a.id.startsWith('ext-')
            groupsByDateSig.get(sig)!.recursos.push({
                tipo_recurso: a.tipo_recurso,
                recurso_id: isSynthetic ? '' : a.id,
                proveedor_id: a.proveedor_id ?? null,
                recurso_externo_nombre: a.recurso_externo_nombre ?? null,
            })
        }

        const isConsecutive = (dates: string[]) => {
            if (dates.length <= 1) return true
            const times = dates.map((d) => new Date(d).getTime())
            return times.every((t, i) => i === 0 || Math.round((t - times[i - 1]) / 86_400_000) === 1)
        }

        const intervalos = Array.from(groupsByDateSig.values()).map(({ dates, recursos }) => {
            if (isConsecutive(dates) && dates.length > 0) {
                return { fecha_inicio: dates[0], fecha_fin: dates[dates.length - 1], recursos }
            }
            return { fechas_multiples: dates, recursos }
        })

        // Fallback: tarea sin recursos — usa fechas_multiples del form como un único intervalo.
        if (intervalos.length === 0) {
            const dates = [...formData.fechas_multiples].sort((a, b) => a.getTime() - b.getTime()).map((d) => format(d, 'yyyy-MM-dd'))
            if (dates.length > 0) {
                intervalos.push(
                    isConsecutive(dates)
                        ? { fecha_inicio: dates[0], fecha_fin: dates[dates.length - 1], recursos: [] }
                        : { fechas_multiples: dates, recursos: [] },
                )
            }
        }

        const res = await createTarea({
            header: {
                id: savedTareaId ?? undefined,
                titulo: formData.titulo,
                cliente_nombre: formData.cliente_nombre,
                cliente_id: formData.cliente_id || null,
                contacto_id: formData.contacto_id || null,
                sitio: formData.sitio,
                prioridad: formData.prioridad,
                descripcion: formData.descripcion,
                estado: formData.confirmada ? 'CONFIRMADA' : 'BORRADOR',
                cotizacion_id: cotizacionIdSeleccionado || null,
                cotizacion_item_id: cotizacionItemIdSeleccionado || null,
                tipo_tarea: (formData.tipo_tarea || null) as never,
                servicio_ref: formData.servicio || null,
                cotizacion_ref: formData.cotizacion || null,
                hora_inicio: formData.hora_inicio || null,
                hora_fin: formData.hora_fin || null,
            },
            intervalos,
        })

        setIsLoading(false)
        if (res.success) {
            toast.success(tareaToEdit ? "Tarea actualizada exitosamente" : "Tarea creada exitosamente")
            router.push("/planificacion")
        } else {
            toast.error(res.message)
        }
    }

    return (
        <div className="flex flex-col h-full gap-6">

            <h2 className="text-xl font-bold text-gray-800">
                {tareaToEdit
                    ? `Editar Tarea — ${tareaToEdit.codigo ?? tareaToEdit.titulo}`
                    : 'Nueva Tarea'}
            </h2>

            <div className="flex border-b mb-4">
                <button
                    type="button"
                    onClick={() => setActiveTab("info")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "info"
                        ? "border-orange-600 text-orange-600"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Información General
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (formData.titulo) setActiveTab("personal")
                        else toast.error("Complete el título primero")
                    }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "personal"
                        ? "border-orange-600 text-orange-600"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Personal ({assignedPersonal.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("maquinaria")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "maquinaria"
                        ? "border-orange-600 text-orange-600"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Maquinaria ({assignedMaquinaria.length})
                </button>
            </div>

            {activeTab === "info" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">Título de la tarea <span className="text-red-500">*</span></Label>
                        <Input
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            placeholder="Ingresa el título de la tarea (Ej: T-2183 ALQUILER GRUA)"
                            className="bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* ROW 1: Cliente (full width) */}
                        <div className="space-y-2 col-span-2">
                            <Label>Cliente</Label>
                            <div className="flex gap-2">
                                <SearchableSelect
                                    options={[...clientes]
                                        .sort((a, b) => (a.razon_social || '').localeCompare(b.razon_social || '', 'es'))
                                        .map(c => ({ value: c.id, label: c.razon_social }))}
                                    value={formData.cliente_id}
                                    onChange={(val) => {
                                        const client = clientes.find(c => c.id === val)
                                        setCotizacionIdSeleccionado("")
                                        setFormData({
                                            ...formData,
                                            cliente_id: val,
                                            cliente_nombre: client?.razon_social || "",
                                            contacto_id: "",
                                            sitio: "",
                                            cotizacion: "",
                                            servicio: "",
                                        })
                                    }}
                                    placeholder="Seleccionar el cliente"
                                    searchPlaceholder="Buscar cliente..."
                                    className="flex-1"
                                />
                                <Button
                                    size="icon"
                                    className="shrink-0 bg-orange-500 hover:bg-orange-600"
                                    onClick={() => setOpenClienteDialog(true)}
                                    title="Nuevo Cliente"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* ROW 2: Contacto | Sitio */}
                        <div className="space-y-2">
                            <Label>Contacto del cliente</Label>
                            <div className="flex gap-2">
                                <SearchableSelect
                                    options={contactos.map(c => ({ value: c.id, label: c.nombre_completo }))}
                                    value={formData.contacto_id}
                                    onChange={(val) => setFormData({ ...formData, contacto_id: val })}
                                    placeholder={!formData.cliente_id ? "Seleccione cliente primero" : loadingDependents ? "Cargando..." : "Seleccionar contacto"}
                                    searchPlaceholder="Buscar contacto..."
                                    emptyText="Sin contactos"
                                    disabled={!formData.cliente_id || loadingDependents}
                                    className="flex-1"
                                />
                                <Button
                                    size="icon"
                                    className="shrink-0 bg-orange-500 hover:bg-orange-600"
                                    onClick={() => {
                                        if (!formData.cliente_id) toast.error("Seleccione un cliente primero")
                                        else setOpenContactoDialog(true)
                                    }}
                                    disabled={!formData.cliente_id}
                                    title="Nuevo Contacto"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Sitio</Label>
                            <div className="flex gap-2">
                                <SearchableSelect
                                    options={sitios.map(s => ({ value: s.id, label: s.nombre }))}
                                    value={sitios.find(s => s.nombre === formData.sitio)?.id || ""}
                                    onChange={(val) => {
                                        const site = sitios.find(s => s.id === val)
                                        if (site) setFormData({ ...formData, sitio: site.nombre })
                                    }}
                                    placeholder={!formData.cliente_id ? "Seleccione cliente primero" : loadingDependents ? "Cargando..." : "Seleccionar sitio"}
                                    searchPlaceholder="Buscar sitio..."
                                    emptyText="Sin sitios"
                                    disabled={!formData.cliente_id || loadingDependents}
                                    className="flex-1"
                                />
                                <Button
                                    size="icon"
                                    className="shrink-0 bg-orange-500 hover:bg-orange-600"
                                    onClick={() => {
                                        if (!formData.cliente_id) toast.error("Seleccione un cliente primero")
                                        else setOpenSitioDialog(true)
                                    }}
                                    disabled={!formData.cliente_id}
                                    title="Nuevo Sitio"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* ROW 3: Cotización (col-span-2) */}
                        <div className="space-y-2 col-span-2">
                            <Label>Cotización</Label>
                            <SearchableSelect
                                options={cotizacionesCliente.map(c => ({
                                    value: c.numero,
                                    label: `${c.numero} — ${c.estado}`,
                                }))}
                                value={formData.cotizacion}
                                onChange={(val) => {
                                    const cot = cotizacionesCliente.find(c => c.numero === val)
                                    setCotizacionIdSeleccionado(cot?.id || "")
                                    setCotizacionItemIdSeleccionado("")
                                    setFormData({ ...formData, cotizacion: val, servicio: "" })
                                }}
                                placeholder={!formData.cliente_id ? "Seleccione cliente primero" : loadingDependents ? "Cargando..." : "Seleccionar cotización"}
                                searchPlaceholder="Buscar cotización..."
                                emptyText="Sin cotizaciones para este cliente"
                                disabled={!formData.cliente_id || loadingDependents}
                            />
                        </div>

                        {/* ROW 4: Servicio (col-span-2) — servicios de la cotización o todos */}
                        <div className="space-y-2 col-span-2">
                            <Label>
                                Servicio
                                {cotizacionIdSeleccionado && serviciosOptions.length > 0 && (
                                    <span className="ml-2 text-xs font-normal text-muted-foreground">(de la cotización seleccionada)</span>
                                )}
                            </Label>
                            <SearchableSelect
                                options={serviciosOptions
                                    .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))
                                    .map(s => ({
                                        value: s.nombre || s.codigo,
                                        label: `${s.codigo} — ${s.nombre || 'Sin nombre'}`,
                                    }))}
                                value={formData.servicio}
                                onChange={(val) => {
                                    const s = serviciosOptions.find(o => (o.nombre || o.codigo) === val)
                                    setCotizacionItemIdSeleccionado(s?.detalle_id ?? "")
                                    setFormData({ ...formData, servicio: val })
                                }}
                                placeholder="Seleccionar servicio"
                                searchPlaceholder="Buscar servicio..."
                                emptyText="Sin servicios disponibles"
                            />
                        </div>
                    </div>

                    {/* DATES & TIMES BLOCK */}
                    <div className="grid md:grid-cols-2 gap-8 mt-4 border p-4 rounded-lg bg-gray-50/30">
                        {/* Calendar Column */}
                        <div className="space-y-2">
                            <Label className="text-red-500 font-medium">Fecha(s) de ejecución *</Label>
                            <div className="flex justify-center border rounded-lg p-2 bg-white shadow-sm w-full">
                                <Calendar
                                    mode="multiple"
                                    selected={formData.fechas_multiples}
                                    onSelect={(dates) => {
                                        const sorted = dates?.sort((a, b) => a.getTime() - b.getTime()) || []
                                        setFormData({
                                            ...formData,
                                            fechas_multiples: sorted,
                                            fecha_inicio: sorted[0],
                                            fecha_fin: sorted[sorted.length - 1]
                                        })
                                        if (sorted[0]) {
                                            setTimelineStart(addDays(sorted[0], -1))
                                            setTimelineEnd(addDays(sorted[0], 5))
                                        }
                                    }}
                                    className="rounded-md"
                                    locale={es}
                                    modifiers={{ festivo: festivos.map((f) => new Date(f.fecha + 'T12:00:00')) }}
                                    modifiersClassNames={{ festivo: "bg-amber-100 text-amber-800 font-semibold rounded-md" }}
                                />
                            </div>
                            <div className="text-xs text-center font-medium bg-orange-100 text-orange-800 py-1 rounded">
                                {formatDateRange()}
                            </div>
                        </div>

                        {/* Controls Column */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-orange-600 font-medium">Horario</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Inicio</Label>
                                        <Input
                                            type="time"
                                            value={formData.hora_inicio}
                                            onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Fin</Label>
                                        <Input
                                            type="time"
                                            value={formData.hora_fin}
                                            onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo de Tarea</Label>
                                <Select value={formData.tipo_tarea} onValueChange={(v) => setFormData({ ...formData, tipo_tarea: v })}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px] overflow-y-auto">
                                        {TIPO_TAREA_OPTIONS.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 pt-4">
                                <Switch
                                    checked={formData.confirmada}
                                    onCheckedChange={(c) => setFormData({ ...formData, confirmada: c })}
                                />
                                <Label>Tarea Confirmada</Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <Label className="font-semibold text-gray-700">Comentarios o instrucciones especiales</Label>
                        <Textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Ingresa instrucciones adicionales con referencia a la tarea"
                            className="min-h-[100px] bg-white"
                        />
                    </div>

                    {/* Dialogs */}
                    <QuickTerceroDialog
                        open={openClienteDialog}
                        onOpenChange={setOpenClienteDialog}
                        defaultType="cliente"
                        onTerceroCreated={(res) => {
                            if (res.tercero) {
                                // Add to list if not present (requires page reload or lifted state, 
                                // but for now client side update would be nice. 
                                // Since 'clientes' is prop, we can't easily add. 
                                // We'll rely on router.refresh() 
                                router.refresh()
                                // And set value
                                setFormData({
                                    ...formData,
                                    cliente_id: res.tercero.id,
                                    cliente_nombre: res.tercero.razon_social
                                })
                            }
                        }}
                    />

                    <ContactoDialog
                        open={openContactoDialog}
                        onOpenChange={setOpenContactoDialog}
                        terceros={clientes}
                        defaultTerceroId={formData.cliente_id}
                        onSuccess={(newId) => {
                            if (formData.cliente_id) {
                                getTerceroContactos(true, formData.cliente_id).then((list) => {
                                    setContactos(list)
                                    if (newId) setFormData(prev => ({ ...prev, contacto_id: newId }))
                                })
                            }
                        }}
                    />

                    <SitioDialog
                        open={openSitioDialog}
                        onOpenChange={setOpenSitioDialog}
                        trigger={null}
                        terceros={clientes}
                        defaultTerceroId={formData.cliente_id}
                        onSuccess={(newNombre) => {
                            if (formData.cliente_id) {
                                getTerceroSitios(true, formData.cliente_id).then((list) => {
                                    setSitios(list)
                                    if (newNombre) setFormData(prev => ({ ...prev, sitio: newNombre }))
                                })
                            }
                        }}
                    // SitioDialog soporta defaultTerceroId — pre-selecciona y ordena el cliente
                    />

                    <div className="flex justify-end pt-4">
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 w-[200px]"
                            disabled={isLoading}
                            onClick={async () => {
                                if (!formData.titulo) {
                                    toast.error("Ingrese un título para continuar")
                                    return
                                }
                                if (formData.fechas_multiples.length === 0) {
                                    toast.error("Seleccione al menos una fecha")
                                    return
                                }
                                setIsLoading(true)
                                const res = await saveTareaBorradorBasic({
                                    tareaId: savedTareaId,
                                    titulo: formData.titulo,
                                    clienteId: formData.cliente_id || null,
                                    clienteNombre: formData.cliente_nombre || null,
                                    contactoId: formData.contacto_id || null,
                                    sitio: formData.sitio || null,
                                    prioridad: formData.prioridad,
                                    descripcion: formData.descripcion || null,
                                    fechasMultiples: formData.fechas_multiples.map(d => format(d, 'yyyy-MM-dd')),
                                })
                                setIsLoading(false)
                                if (res.success && res.tareaId) {
                                    setSavedTareaId(res.tareaId)
                                    setActiveTab("personal")
                                } else {
                                    toast.error(res.message ?? "Error al guardar borrador")
                                }
                            }}
                        >
                            {isLoading ? "Guardando..." : "Siguiente (Asignar Personal)"}
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === "personal" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Asignación de Personal a {formData.titulo}</h2>
                        <p className="text-sm text-gray-500">Asigne el personal para realizar esta tarea, o seleccione "Siguiente" para continuar.</p>
                    </div>

                    {/* Controls - full width */}
                    <div className="border p-4 rounded-lg bg-white shadow-sm space-y-5">
                        <div className="space-y-2">
                            <Label className="font-semibold">Defina las fechas para las que aplica el cambio de recursos</Label>
                            <RadioGroup value={assignmentScope} onValueChange={(v: string) => setAssignmentScope(v as 'ALL' | 'FUTURE' | 'SINGLE')}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ALL" id="r1" />
                                    <Label htmlFor="r1">Aplica para todas las fechas</Label>
                                </div>
                                <div className="flex items-center space-x-2 opacity-40 cursor-not-allowed" title="Próximamente">
                                    <RadioGroupItem value="FUTURE" id="r2" disabled />
                                    <Label htmlFor="r2">Aplica desde esta fecha en adelante</Label>
                                </div>
                                <div className="flex items-center space-x-2 opacity-40 cursor-not-allowed" title="Próximamente">
                                    <RadioGroupItem value="SINGLE" id="r3" disabled />
                                    <Label htmlFor="r3">Aplica solo para la fecha seleccionada</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="grid grid-cols-[160px_1fr] gap-6 items-start border-t pt-4">
                            <RadioGroup
                                value={personalTipo}
                                onValueChange={(v: string) => setPersonalTipo(v as 'INTERNO' | 'EXTERNO')}
                                className="space-y-2 pt-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="INTERNO" id="p-interno" />
                                    <Label htmlFor="p-interno">Interno (mi personal)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="EXTERNO" id="p-externo" />
                                    <Label htmlFor="p-externo">Externo (proveedor RH)</Label>
                                </div>
                            </RadioGroup>

                            {personalTipo === 'INTERNO' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Cargo</Label>
                                        <SearchableSelect
                                            options={[
                                                { value: '', label: 'Todos los cargos' },
                                                ...cargosInterno.map(c => ({ value: c.id, label: c.nombre }))
                                            ]}
                                            value={filterCargoPersonal}
                                            onChange={(v) => { setFilterCargoPersonal(v); setSelectedPersonalId("") }}
                                            placeholder="Todos los cargos"
                                            searchPlaceholder="Buscar cargo..."
                                            emptyText="Sin cargos disponibles"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Personal</Label>
                                        <div className="flex gap-2">
                                            <SearchableSelect
                                                options={personalFiltrado.map(p => ({ value: p.id, label: p.nombre }))}
                                                value={selectedPersonalId}
                                                onChange={setSelectedPersonalId}
                                                placeholder="Seleccione personal..."
                                                searchPlaceholder="Buscar personal..."
                                                emptyText="Sin personal para este cargo"
                                                className="flex-1"
                                            />
                                            <Button size="icon" className="shrink-0 bg-orange-500 hover:bg-orange-600" onClick={handleAddPersonal} title="Agregar">
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {personalTipo === 'EXTERNO' && (
                                <div className="grid grid-cols-3 gap-3 p-3 rounded-md border border-orange-200 bg-orange-50/50">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Proveedor de RH</Label>
                                        <SearchableSelect
                                            options={proveedoresConPersonal.map(p => ({ value: p.id, label: `${p.razon_social}${p.ruc ? ` (${p.ruc})` : ''}` }))}
                                            value={personalProveedorId}
                                            onChange={(v) => { setPersonalProveedorId(v); setSelectedPersonalExternoId(""); setFilterCargoExterno("") }}
                                            placeholder="Seleccione proveedor..."
                                            searchPlaceholder="Buscar proveedor..."
                                            emptyText="Sin proveedores con personal registrado"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Cargo</Label>
                                        <SearchableSelect
                                            options={[
                                                { value: '', label: 'Todos los cargos' },
                                                ...cargosExternoFiltrado.map(c => ({ value: c.id, label: c.nombre }))
                                            ]}
                                            value={filterCargoExterno}
                                            onChange={(v) => { setFilterCargoExterno(v); setSelectedPersonalExternoId("") }}
                                            placeholder="Todos los cargos"
                                            searchPlaceholder="Buscar cargo..."
                                            emptyText="Sin cargos"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Persona</Label>
                                        <div className="flex gap-2">
                                            <SearchableSelect
                                                options={personalExternoFiltrado.map(p => ({ value: p.id, label: p.nombre }))}
                                                value={selectedPersonalExternoId}
                                                onChange={setSelectedPersonalExternoId}
                                                placeholder="Seleccione persona..."
                                                searchPlaceholder="Buscar persona..."
                                                emptyText={personalProveedorId ? "Sin personal para este proveedor" : "Seleccione proveedor primero"}
                                                className="flex-1"
                                            />
                                            <Button size="icon" className="shrink-0 bg-orange-500 hover:bg-orange-600" onClick={handleAddPersonal} title="Agregar">
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <Label className="text-sm font-semibold flex items-center justify-between">
                                Personal Asignado
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{assignedPersonal.length}</span>
                            </Label>
                            <div className="min-h-[60px] max-h-[160px] overflow-y-auto border rounded-md bg-gray-50 p-2 space-y-1.5">
                                {assignedPersonal.length === 0 && <p className="text-gray-400 text-center text-sm pt-3">No hay personal asignado</p>}
                                {assignedPersonal.map((a, idx) => (
                                    <div key={idx} className={`flex justify-between items-center bg-white p-2 rounded shadow-sm text-sm border-l-4 ${a.tipo_contratacion === 'EXTERNO' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {a.resourceName}
                                                {a.tipo_contratacion === 'EXTERNO' && <span className="ml-2 text-[10px] uppercase bg-orange-100 text-orange-700 px-1 py-0.5 rounded">Externo</span>}
                                            </span>
                                            <span className="text-xs text-gray-500">{a.resourceDetail || 'Personal'}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => setAssignedPersonal(assignedPersonal.filter((_, i) => i !== idx))}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Availability panel - solo para INTERNO */}
                    {personalTipo === 'INTERNO' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex gap-2 flex-wrap">
                                    {([
                                        { value: 'ALL', label: 'Todos', cls: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                                        { value: 'DISPONIBLE', label: 'Disponibles', cls: 'bg-green-100 text-green-700 hover:bg-green-200' },
                                        { value: 'PARCIAL', label: 'Parcial', cls: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                                        { value: 'OCUPADO', label: 'Ocupados', cls: 'bg-red-100 text-red-700 hover:bg-red-200' },
                                    ] as const).map(b => {
                                        const base = filterCargoPersonal ? personalFiltrado : personalList
                                        const count = b.value === 'ALL' ? base.length : base.filter(p => getAvailStatus(p.id, 'PERSONAL') === b.value).length
                                        return (
                                            <button key={b.value} type="button"
                                                onClick={() => setAvailabilityFilterP(b.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${b.cls} ${availabilityFilterP === b.value ? 'ring-2 ring-orange-500 ring-offset-1' : ''}`}
                                            >
                                                {b.label} ({count})
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded-sm" /> Ocupado</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border rounded-sm" /> Libre</div>
                                </div>
                            </div>
                            <ResourceTimeline
                                title="DISPONIBILIDAD DE PERSONAL"
                                resources={personalParaTimeline}
                                assignments={availability.filter(a => a.tipo === 'PERSONAL')}
                                startDate={timelineStart}
                                endDate={timelineEnd}
                                onDateChange={(s, e) => { setTimelineStart(s); setTimelineEnd(e) }}
                            />
                        </div>
                    )}

                    <div className="flex justify-between pt-4 border-t">
                        <Button variant="outline" onClick={() => setActiveTab("info")}>Anterior</Button>
                        <Button
                            className="bg-orange-600"
                            disabled={isLoading}
                            onClick={async () => {
                                if (savedTareaId && assignedPersonal.length > 0) {
                                    setIsLoading(true)
                                    const fechas = [...new Set(assignedPersonal.flatMap(a => a.dates))].sort()
                                    await saveTareaBorradorBasic({
                                        tareaId: savedTareaId,
                                        titulo: formData.titulo,
                                        clienteId: formData.cliente_id || null,
                                        clienteNombre: formData.cliente_nombre || null,
                                        contactoId: formData.contacto_id || null,
                                        sitio: formData.sitio || null,
                                        prioridad: formData.prioridad,
                                        descripcion: formData.descripcion || null,
                                        fechasMultiples: fechas.length ? fechas : formData.fechas_multiples.map(d => format(d, 'yyyy-MM-dd')),
                                    })
                                    setIsLoading(false)
                                }
                                setActiveTab("maquinaria")
                            }}
                        >
                            {isLoading ? "Guardando..." : "Siguiente (Maquinaria)"}
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === "maquinaria" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Asignación de Maquinaria a {formData.titulo}</h2>
                        <p className="text-sm text-gray-500">Asigne los equipos para realizar esta tarea, o seleccione &quot;Finalizar&quot; para continuar.</p>
                    </div>

                    {/* Controls - full width */}
                    <div className="border p-4 rounded-lg bg-white shadow-sm space-y-5">
                        <div className="space-y-2">
                            <Label className="font-semibold">Defina las fechas para las que aplica el cambio de recursos</Label>
                            <RadioGroup value={assignmentScope} onValueChange={(v: string) => setAssignmentScope(v as 'ALL' | 'FUTURE' | 'SINGLE')}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ALL" id="r1m" />
                                    <Label htmlFor="r1m">Aplica para todas las fechas</Label>
                                </div>
                                <div className="flex items-center space-x-2 opacity-40 cursor-not-allowed" title="Próximamente">
                                    <RadioGroupItem value="FUTURE" id="r2m" disabled />
                                    <Label htmlFor="r2m">Aplica desde esta fecha en adelante</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="grid grid-cols-[160px_1fr] gap-6 items-start border-t pt-4">
                            <RadioGroup
                                value={maquinariaTipo}
                                onValueChange={(v: string) => setMaquinariaTipo(v as 'INTERNO' | 'EXTERNO')}
                                className="space-y-2 pt-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="INTERNO" id="m-interno" />
                                    <Label htmlFor="m-interno">Interno (pool propio)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="EXTERNO" id="m-externo" />
                                    <Label htmlFor="m-externo">Externo (alquiler)</Label>
                                </div>
                            </RadioGroup>

                            {maquinariaTipo === 'INTERNO' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Categoría</Label>
                                        <SearchableSelect
                                            options={[
                                                { value: '', label: 'Todas las categorías' },
                                                ...categoriasDisponibles.map(c => ({ value: c, label: c }))
                                            ]}
                                            value={filterCategoriaM}
                                            onChange={(v) => { setFilterCategoriaM(v); setSelectedMaquinariaId("") }}
                                            placeholder="Todas las categorías"
                                            searchPlaceholder="Buscar categoría..."
                                            emptyText="Sin categorías"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Equipo / Maquinaria</Label>
                                        <div className="flex gap-2">
                                            <SearchableSelect
                                                options={maquinariaFiltrada.map(m => ({ value: m.id, label: `${m.codigo} — ${m.nombre}` }))}
                                                value={selectedMaquinariaId}
                                                onChange={setSelectedMaquinariaId}
                                                placeholder="Seleccione equipo..."
                                                searchPlaceholder="Buscar equipo..."
                                                emptyText="Sin equipos para esta categoría"
                                                className="flex-1"
                                            />
                                            <Button size="icon" className="shrink-0 bg-orange-500 hover:bg-orange-600" onClick={handleAddMaquinaria} title="Agregar">
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {maquinariaTipo === 'EXTERNO' && (
                                <div className="grid grid-cols-1 gap-3 p-3 rounded-md border border-orange-200 bg-orange-50/50">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Proveedor</Label>
                                            <SearchableSelect
                                                options={proveedoresConMaquinaria.map(p => ({ value: p.id, label: `${p.razon_social}${p.ruc ? ` (${p.ruc})` : ''}` }))}
                                                value={maquinariaProveedorId}
                                                onChange={(v) => { setMaquinariaProveedorId(v); setMaquinariaExternaId(""); setMaquinariaExternoNombre("") }}
                                                placeholder="Seleccione proveedor..."
                                                searchPlaceholder="Buscar proveedor..."
                                                emptyText="Sin proveedores con maquinaria registrada"
                                            />
                                        </div>
                                        {maquinariaTerceros.length > 0 && (
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Equipo registrado del proveedor</Label>
                                                <SearchableSelect
                                                    options={[
                                                        { value: '', label: 'Descripción manual…' },
                                                        ...maquinariaTerceros.map(m => ({ value: m.id, label: `${m.codigo ? m.codigo + ' — ' : ''}${m.nombre}` }))
                                                    ]}
                                                    value={maquinariaExternaId}
                                                    onChange={(v) => {
                                                        setMaquinariaExternaId(v)
                                                        if (v) {
                                                            const m = maquinariaTerceros.find(x => x.id === v)
                                                            if (m) setMaquinariaExternoNombre(`${m.codigo ? m.codigo + ' · ' : ''}${m.nombre}`.trim())
                                                        } else {
                                                            setMaquinariaExternoNombre("")
                                                        }
                                                    }}
                                                    placeholder="Seleccionar equipo del sistema..."
                                                    searchPlaceholder="Buscar equipo..."
                                                    emptyText="Sin equipos registrados"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                            {maquinariaExternaId ? 'Descripción del equipo (editable)' : 'Descripción manual (placa / código / modelo)'}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={maquinariaExternoNombre}
                                                onChange={(e) => setMaquinariaExternoNombre(e.target.value)}
                                                placeholder="Ej. GRÚA 50T · ABC-123"
                                                className="flex-1"
                                            />
                                            <Button size="icon" className="shrink-0 bg-orange-500 hover:bg-orange-600" onClick={handleAddMaquinaria} title="Agregar">
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <Label className="text-sm font-semibold flex items-center justify-between">
                                Equipos Asignados
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{assignedMaquinaria.length}</span>
                            </Label>
                            <div className="min-h-[60px] max-h-[160px] overflow-y-auto border rounded-md bg-gray-50 p-2 space-y-1.5">
                                {assignedMaquinaria.length === 0 && <p className="text-gray-400 text-center text-sm pt-3">No hay equipos asignados</p>}
                                {assignedMaquinaria.map((a, idx) => (
                                    <div key={idx} className={`flex justify-between items-center bg-white p-2 rounded shadow-sm text-sm border-l-4 ${a.tipo_contratacion === 'EXTERNO' ? 'border-l-red-500' : 'border-l-orange-500'}`}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {a.tipo_contratacion === 'EXTERNO' ? a.resourceName : a.resourceDetail}
                                                {a.tipo_contratacion === 'EXTERNO' && <span className="ml-2 text-[10px] uppercase bg-red-100 text-red-700 px-1 py-0.5 rounded">Externo</span>}
                                            </span>
                                            <span className="text-xs text-gray-500">{a.tipo_contratacion === 'EXTERNO' ? a.resourceDetail : a.resourceName}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => setAssignedMaquinaria(assignedMaquinaria.filter((_, i) => i !== idx))}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Availability panel - solo para INTERNO */}
                    {maquinariaTipo === 'INTERNO' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex gap-2 flex-wrap">
                                    {([
                                        { value: 'ALL', label: 'Todos', cls: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                                        { value: 'DISPONIBLE', label: 'Disponibles', cls: 'bg-green-100 text-green-700 hover:bg-green-200' },
                                        { value: 'PARCIAL', label: 'Parcial', cls: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                                        { value: 'OCUPADO', label: 'Ocupados', cls: 'bg-red-100 text-red-700 hover:bg-red-200' },
                                    ] as const).map(b => {
                                        const base = filterCategoriaM ? maquinariaFiltrada : maquinariaList
                                        const count = b.value === 'ALL' ? base.length : base.filter(m => getAvailStatus(m.id, 'MAQUINARIA') === b.value).length
                                        return (
                                            <button key={b.value} type="button"
                                                onClick={() => setAvailabilityFilterM(b.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${b.cls} ${availabilityFilterM === b.value ? 'ring-2 ring-orange-500 ring-offset-1' : ''}`}
                                            >
                                                {b.label} ({count})
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded-sm" /> Ocupado</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border rounded-sm" /> Libre</div>
                                </div>
                            </div>
                            <ResourceTimeline
                                title="PLAN DE MAQUINARIA"
                                resources={maquinariaParaTimeline}
                                assignments={availability.filter(a => a.tipo === 'MAQUINARIA')}
                                startDate={timelineStart}
                                endDate={timelineEnd}
                                onDateChange={(s, e) => { setTimelineStart(s); setTimelineEnd(e) }}
                            />
                        </div>
                    )}

                    <div className="flex justify-between pt-4 border-t">
                        <Button variant="outline" onClick={() => setActiveTab("personal")}>Anterior</Button>
                        <Button onClick={handleSubmit} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 w-[200px]">
                            {isLoading ? "Guardando..." : tareaToEdit ? "Actualizar Tarea" : "Finalizar y Crear"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
