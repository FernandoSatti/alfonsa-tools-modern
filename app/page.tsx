import Link from "next/link"
import { Calculator, FileText, List, TrendingUp, Package, BarChart3, BoxIcon as Bottle } from "lucide-react"

const tools = [
  {
    href: "/listas",
    icon: List,
    title: "Generador de Listas",
    description: "Crea y compara listas de productos fácilmente.",
  },
  {
    href: "/precios",
    icon: Calculator,
    title: "Calculadora de Precios",
    description: "Calcula precios con diferentes porcentajes.",
  },
  {
    href: "/promedio",
    icon: TrendingUp,
    title: "Calculadora de Promedio",
    description: "Calcula el precio promedio de tus productos.",
  },
  {
    href: "/aumento-descuento",
    icon: BarChart3,
    title: "Precios con Aumento/Descuento",
    description: "Aplica aumentos o descuentos a tus precios.",
  },
  {
    href: "/facturas",
    icon: FileText,
    title: "Generador de Facturas",
    description: "Genera facturas a partir de listas de productos.",
  },
  {
    href: "/stock",
    icon: Package,
    title: "Reporte de Reposición de Stock",
    description: "Calcula el stock a reponer en cada sucursal.",
  },
  {
    href: "/botellas",
    icon: Bottle,
    title: "Botellas por Caja",
    description: "Botellas por caja en cada producto y control.",
  },
]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12 fade-in">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Bienvenido a Alfonsa Tools</h1>
        <p className="text-xl text-gray-600">Selecciona una herramienta para comenzar:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href} className="card group">
              <div className="text-center">
                <Icon className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{tool.title}</h2>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <span className="btn-primary inline-block">Usar herramienta</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
