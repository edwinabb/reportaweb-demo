import type { Metadata } from 'next'
import Image from 'next/image'
import { Montserrat } from 'next/font/google'
import {
    Download,
    MapPin,
    Play,
    ClipboardCheck,
    Receipt,
    Wrench,
    UserCheck,
    ShieldCheck,
    LayoutDashboard,
    CalendarDays,
    History,
    UserCircle,
    FolderOpen,
    Check,
} from 'lucide-react'

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '600', '800', '900'],
    variable: '--font-montserrat',
})

export const metadata: Metadata = {
    title: 'REPORTAR.APP — Descarga tu APP y reporta tus actividades diarias online',
    description: 'Sistema de Gestión de Maquinaria Pesada.',
    robots: { index: false, follow: false },
    openGraph: {
        title: 'REPORTAR.APP — Descarga tu APP y reporta tus actividades diarias online',
        description: 'Sistema de Gestión de Maquinaria Pesada.',
        url: 'https://web.reportar.app/descargar-app',
        siteName: 'REPORTAR.APP',
        images: [{ url: '/og-image.jpg', width: 510, height: 571, alt: 'REPORTAR.APP' }],
        locale: 'es_PE',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'REPORTAR.APP — Descarga tu APP y reporta tus actividades diarias online',
        description: 'Sistema de Gestión de Maquinaria Pesada.',
        images: ['/og-image.jpg'],
    },
}

const APK_VERSION = '3.9.10'
const APK_FILE = `app-reportar-v${APK_VERSION}.apk`
// APK servido desde Supabase Storage (bucket "apks") — Cloudflare Workers
// limita assets estáticos a 25 MiB, el APK pesa 84 MB.
const APK_PATH = `https://fqwhagryqkkhbgznxtwf.supabase.co/storage/v1/object/public/apks/${APK_FILE}`

const STEPS = [
    {
        num: 1,
        icon: LayoutDashboard,
        title: 'Tu tarea del día, lista cuando abres la app',
        desc: 'En cuanto ingresas ves lo que tienes asignado para hoy: la máquina, el lugar y lo que se espera de ti. Sin llamadas, sin confusiones.',
        img: '/images/app/01-panel.png',
        imgAlt: 'Panel principal con tarea del día asignada',
        imgDesc: 'Pantalla principal · Tarea del día',
    },
    {
        num: 2,
        icon: MapPin,
        title: 'Registra tu llegada al toque de un botón',
        desc: 'Cuando llegas a la obra, tocas "Llegada" y queda registrada la hora exacta. Nada de papeles, nada de llamadas para avisar que llegaste.',
        img: '/images/app/02-llegada.png',
        imgAlt: 'Botón de llegada con confirmación de hora',
        imgDesc: 'Pantalla llegada · Registro de hora',
    },
    {
        num: 3,
        icon: Play,
        title: 'Cuando puedes trabajar, inicias. Cuando no puedes, lo registras.',
        desc: 'Si todo está bien, tocas "Iniciar jornada". Si algo te impide comenzar — falta de material, lluvia, máquina con falla — registras la incidencia para que quede documentado. Tu tiempo vale, aunque no estés operando.',
        img: '/images/app/03-inicio.png',
        imgAlt: 'Pantalla de inicio de jornada e incidencias',
        imgDesc: 'Inicio · Incidencias / paradas',
    },
    {
        num: 4,
        icon: ClipboardCheck,
        title: 'Revisa tu máquina antes de operar — y que conste que la revisaste',
        desc: 'La app te muestra una lista de puntos a verificar: nivel de aceite, frenos, luces, cabina. Tocas cada punto, confirmas el estado y queda firmado digitalmente. Esto te protege a ti también.',
        img: '/images/app/04-checklist.png',
        imgAlt: 'Checklist de verificación de maquinaria',
        imgDesc: 'Checklist · Estado de la máquina',
    },
    {
        num: 5,
        icon: Receipt,
        title: 'Carga el combustible, el repuesto o el gasto que no estaba en el plan',
        desc: 'Si tuviste que comprar algo para que la máquina siga trabajando, lo registras en el momento: el monto, el tipo de gasto y una foto del comprobante. Nada se pierde, nada queda en tu bolsillo.',
        img: '/images/app/05-gastos.png',
        imgAlt: 'Formulario de registro de gastos',
        imgDesc: 'Gastos · Combustible / mantenimiento',
    },
    {
        num: 6,
        icon: Wrench,
        title: 'Cierra el turno de la máquina con todo documentado',
        desc: 'Al terminar el trabajo, registras las horas operadas, el horómetro, el trabajo realizado y cualquier observación. Todo queda guardado para que tu empresa tenga el historial exacto de la máquina.',
        img: '/images/app/06-reporte-maquinaria.png',
        imgAlt: 'Formulario de reporte de maquinaria',
        imgDesc: 'Reporte maquinaria · Horómetro / horas',
    },
    {
        num: 7,
        icon: UserCheck,
        title: 'Cierras tu jornada y queda registrado lo que trabajaste',
        desc: 'Al final del día confirmas tu jornada: las horas que trabajaste, las actividades que realizaste. Lo que registras es lo que le llega a tu empresa. Sin papel, sin que se pierda nada.',
        img: '/images/app/07-reporte-personal.png',
        imgAlt: 'Pantalla de cierre de jornada personal',
        imgDesc: 'Reporte personal · Cierre de jornada',
    },
]

const EXTRAS = [
    {
        icon: CalendarDays,
        title: 'Tu semana de un vistazo',
        desc: 'Ve las tareas que tienes asignadas para los próximos días. Sabes de antemano a dónde vas y en qué máquina.',
        img: '/images/app/extra-plan-semanal.png',
        imgDesc: 'Plan semanal',
    },
    {
        icon: History,
        title: 'Lo que hiciste siempre está disponible',
        desc: 'Consulta tus jornadas anteriores, los reportes que enviaste y el historial de la máquina que operaste.',
        img: '/images/app/extra-historial.png',
        imgDesc: 'Historial de jornadas',
    },
    {
        icon: UserCircle,
        title: 'Tus datos, tu licencia, tu información',
        desc: 'Actualiza tu información personal y mantén al día los datos de tu licencia de operador para que tu empresa siempre tenga lo que necesita.',
        img: '/images/app/extra-perfil.png',
        imgDesc: 'Perfil del operario',
    },
]

const INSTALL_STEPS = [
    {
        n: 1,
        title: 'Abre el archivo que acabas de descargar',
        desc: 'Busca la notificación de descarga completada en la parte de arriba de tu pantalla y tócala.',
    },
    {
        n: 2,
        title: 'Android te pregunta si confías en este archivo',
        desc: 'Vas a ver un mensaje que dice "fuentes desconocidas" o "instalar apps de otras fuentes". Eso es normal.',
    },
    {
        n: 3,
        title: 'Toca "Configuración" o "Permitir"',
        desc: 'Activa el permiso para instalar apps desde el navegador o el administrador de archivos. Solo lo harás una vez.',
    },
    {
        n: 4,
        title: 'Vuelve atrás y toca "Instalar"',
        desc: 'La instalación tarda menos de un minuto.',
    },
    {
        n: 5,
        title: 'Abre REPORTAR.APP',
        desc: 'Busca el ícono naranja en tu pantalla de inicio o en tus aplicaciones.',
    },
    {
        n: 6,
        title: 'Ingresa con tu usuario y contraseña',
        desc: 'Tu jefe te dio tus datos de acceso. Si no los tienes, consúltale a él.',
    },
]

function PhoneMockup({ imgSrc, imgAlt, label }: { imgSrc: string; imgAlt: string; label: string }) {
    return (
        <div className="relative mx-auto w-[220px] md:w-[260px]">
            {/* Phone frame */}
            <div className="relative bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full z-10" />
                {/* Screen */}
                <div className="rounded-[2rem] overflow-hidden bg-slate-100 relative">
                    <Image
                        src={imgSrc}
                        alt={imgAlt}
                        width={349}
                        height={622}
                        className="w-full h-auto object-cover"
                    />
                </div>
            </div>
        </div>
    )
}

export default function DescargarAppPage() {
    return (
        <div className={`${montserrat.variable} font-[family-name:var(--font-montserrat)] min-h-screen bg-white`}>

            {/* ── HEADER ──────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
                    <span className="text-slate-900 text-lg tracking-[0.18em] font-[500]">
                        REPORTAR.APP
                    </span>
                </div>
            </header>

            {/* ── HERO ────────────────────────────────────────────────── */}
            <section className="py-16 md:py-24 px-4 text-center">
                <div className="max-w-xl mx-auto space-y-5">
                    <span className="inline-block rounded-full bg-orange-100 text-orange-600 text-sm font-medium px-4 py-1">
                        Para operarios de maquinaria
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                        La app de tu empresa para registrar tu jornada
                    </h1>
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed">
                        Tu jefe ya te inscribió. Solo descarga la app, instálala en tu celular y ya estás listo para comenzar.
                    </p>
                </div>
            </section>

            {/* ── DESCARGA ────────────────────────────────────────────── */}
            <section className="bg-slate-50 py-14 px-4" id="descargar">
                <div className="max-w-md mx-auto space-y-8">

                    {/* Paso 1: botón descarga */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Paso 1 — Descarga la app
                        </p>
                        <a
                            href={APK_PATH}
                            download={APK_FILE}
                            className="flex items-center gap-4 w-full bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition-colors rounded-2xl py-5 px-6 shadow-lg shadow-orange-200 group"
                        >
                            <div className="flex-shrink-0 bg-white/20 rounded-xl p-2.5">
                                <Download className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-semibold text-base leading-tight">
                                    Descargar REPORTAR.APP
                                </p>
                                <p className="text-orange-200 text-sm mt-0.5">
                                    {APK_FILE} · Android
                                </p>
                            </div>
                        </a>
                        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-green-500" />
                            Archivo seguro · Desarrollado por REPORTAR.APP
                        </p>
                    </div>

                    {/* Separador */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-slate-50 px-3 text-sm text-gray-400">Cómo instalar</span>
                        </div>
                    </div>

                    {/* Paso 2: instrucciones */}
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Paso 2 — Instala la app en tu celular
                        </p>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Como la app no viene de Play Store, Android te va a pedir un permiso extra. Es normal. Sigue estos pasos:
                        </p>

                        <div className="space-y-4 mt-2">
                            {INSTALL_STEPS.map((step) => (
                                <div key={step.n} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white text-sm font-bold flex items-center justify-center">
                                        {step.n}
                                    </div>
                                    <div className="pt-0.5">
                                        <p className="text-sm font-semibold text-slate-900 leading-snug">{step.title}</p>
                                        <p className="text-sm text-gray-500 leading-relaxed mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Nota archivo */}
                        <div className="flex gap-3 bg-orange-50 border-l-4 border-orange-400 rounded-xl p-4 mt-4">
                            <FolderOpen className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-800 leading-relaxed">
                                Si no encuentras el archivo descargado, abre la aplicación <strong>"Archivos"</strong> o <strong>"Mis archivos"</strong> en tu celular, entra a la carpeta <strong>"Descargas"</strong> y busca el archivo <code className="text-xs bg-orange-100 px-1 rounded">{APK_FILE}</code>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SEGURIDAD ───────────────────────────────────────────── */}
            <section className="bg-slate-900 py-12 px-4">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                    <ShieldCheck className="w-10 h-10 text-white mx-auto" />
                    <h2 className="text-white font-black text-2xl">
                        Esta app la instaló tu empresa
                    </h2>
                    <p className="text-slate-300 text-base leading-relaxed max-w-lg mx-auto">
                        Tu empleador contrata REPORTAR.APP para registrar el trabajo de su maquinaria y de su equipo. Esta aplicación no accede a tus fotos personales, no lee tus mensajes ni comparte información privada tuya. Solo registra lo que tú mismo ingresas durante tu jornada de trabajo.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {[
                            'Sin acceso a fotos personales',
                            'Sin lectura de mensajes',
                            'Solo registra lo que tú ingresas',
                        ].map((label) => (
                            <span
                                key={label}
                                className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 text-sm px-4 py-2"
                            >
                                <Check className="w-3.5 h-3.5 text-green-400" />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── VIAJE DEL DÍA ───────────────────────────────────────── */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14 space-y-3">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                            Así se ve tu día con la app
                        </h2>
                        <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto">
                            De la llegada a obra al cierre de jornada — todo en un lugar, desde tu celular.
                        </p>
                    </div>

                    <div className="space-y-0">
                        {STEPS.map((step, idx) => {
                            const Icon = step.icon
                            const isEven = idx % 2 === 1
                            return (
                                <div
                                    key={step.num}
                                    className={`py-12 md:py-16 ${isEven ? 'bg-slate-50' : 'bg-white'}`}
                                >
                                    <div className={`max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                        {/* Contenido */}
                                        <div className="flex-1 space-y-4 text-center md:text-left">
                                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                                <div className="bg-orange-50 rounded-xl p-2">
                                                    <Icon className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <span className="text-5xl font-black text-orange-600 leading-none select-none">
                                                    {step.num}
                                                </span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                                                {step.title}
                                            </h3>
                                            <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto md:mx-0">
                                                {step.desc}
                                            </p>
                                        </div>

                                        {/* Imagen */}
                                        <div className="flex-shrink-0">
                                            <PhoneMockup
                                                imgSrc={step.img}
                                                imgAlt={step.imgAlt}
                                                label={step.imgDesc}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ── MÁS FUNCIONES ───────────────────────────────────────── */}
            <section className="bg-slate-50 py-16 md:py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10 space-y-3">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                            Y hay más cosas que puedes hacer
                        </h2>
                        <p className="text-gray-500 text-base max-w-md mx-auto">
                            A medida que uses la app vas a encontrar más herramientas para tu día a día.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {EXTRAS.map((extra) => {
                            const Icon = extra.icon
                            return (
                                <div
                                    key={extra.title}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4"
                                >
                                    <div className="bg-orange-50 rounded-xl p-2.5 w-fit">
                                        <Icon className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-slate-900 mb-1.5">
                                            {extra.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            {extra.desc}
                                        </p>
                                    </div>
                                    <div className="rounded-xl overflow-hidden mt-1">
                                        <Image
                                            src={extra.img}
                                            alt={extra.imgDesc}
                                            width={349}
                                            height={622}
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ───────────────────────────────────────────── */}
            <section className="py-14 px-4 text-center bg-white border-t border-slate-100">
                <div className="max-w-md mx-auto space-y-4">
                    <p className="text-slate-900 font-black text-xl">
                        Tu jornada registrada, tu pago protegido, desde el celular.
                    </p>
                    <a
                        href={APK_PATH}
                        download={APK_FILE}
                        className="inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-700 transition-colors text-white font-semibold rounded-2xl py-4 px-8 shadow-lg shadow-orange-200"
                    >
                        <Download className="w-5 h-5" />
                        Descargar la app
                    </a>
                    <p className="text-xs text-gray-400">v{APK_VERSION} · Android</p>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────── */}
            <footer className="bg-slate-50 border-t border-slate-100 py-8 px-4">
                <div className="max-w-2xl mx-auto text-center space-y-2">
                    <span className="text-slate-700 text-sm tracking-[0.18em] font-[500]">REPORTAR.APP</span>
                    <p className="text-gray-500 text-sm">Sistema de gestión de maquinaria pesada</p>
                    <p className="text-gray-400 text-sm">
                        Si tienes problemas para instalar la app o para ingresar, contacta a tu supervisor o al administrador de tu empresa.
                    </p>
                    <p className="text-gray-300 text-xs pt-2">
                        © 2026 REPORTAR.APP · Todos los derechos reservados
                    </p>
                </div>
            </footer>

        </div>
    )
}
