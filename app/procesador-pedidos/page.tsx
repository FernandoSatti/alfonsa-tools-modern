"use client"

import { useState } from "react"
import { Copy, Trash2, Package, AlertTriangle, CheckCircle } from "lucide-react"

interface ProcessedProduct {
  originalLine: string
  productName: string
  originalQuantity: number
  unitSize: number
  price: string
  status: "available" | "unavailable" | "partial"
  availableQuantity?: number
  missingQuantity?: number
  availableFormatted?: string
  missingFormatted?: string
}

export default function ProcesadorPedidosPage() {
  const [inputText, setInputText] = useState("")
  const [processedProducts, setProcessedProducts] = useState<ProcessedProduct[]>([])
  const [availableList, setAvailableList] = useState("")
  const [missingList, setMissingList] = useState("")
  const [copySuccess, setCopySuccess] = useState("")

  const processProducts = () => {
    if (!inputText.trim()) {
      alert("Por favor, pega la respuesta del proveedor.")
      return
    }

    const lines = inputText.trim().split(/\r?\n/)
    const processed: ProcessedProduct[] = []
    const available: string[] = []
    const missing: string[] = []

    lines.forEach((line) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // Extraer la información básica del producto
      const match = trimmedLine.match(/^(\d+)[xX](\d+)\s+(.+?)\s+(\$[\d.]+\/[\d.]+)(.*)$/)
      if (!match) return

      const originalBoxes = Number.parseInt(match[1])
      const unitSize = Number.parseInt(match[2])
      const productName = match[3].trim()
      const price = match[4]
      const statusPart = match[5].trim()

      const product: ProcessedProduct = {
        originalLine: trimmedLine,
        productName,
        originalQuantity: originalBoxes,
        unitSize,
        price,
        status: "unavailable",
      }

      // Analizar el estado del producto
      if (statusPart.includes("❌")) {
        // Producto no disponible - todo va a faltantes (sin "x")
        product.status = "unavailable"
        product.missingQuantity = originalBoxes
        product.missingFormatted = `${originalBoxes}X${unitSize} ${productName} ${price}`
        missing.push(product.missingFormatted)
      } else if (statusPart.includes("✅")) {
        // Producto disponible (total o parcial)

        if (statusPart.includes("q")) {
          // Si tiene "q" significa que le sobran - disponible completo
          product.status = "available"
          product.availableQuantity = originalBoxes
          product.availableFormatted = `${originalBoxes}X${unitSize} ${productName} ${price}`
          available.push(product.availableFormatted)
        } else {
          // Si no tiene "q", es formato "24x6" - cantidad específica disponible
          const availableMatch = statusPart.match(/✅(\d+)(?:[xX](\d+))?/)

          if (availableMatch) {
            const availableBoxes = Number.parseInt(availableMatch[1])
            product.availableQuantity = availableBoxes

            if (product.availableQuantity >= originalBoxes) {
              // Disponible completo
              product.status = "available"
              product.availableFormatted = `${originalBoxes}X${unitSize} ${productName} ${price}`
              available.push(product.availableFormatted)
            } else {
              // Disponible parcial
              product.status = "partial"
              product.missingQuantity = originalBoxes - product.availableQuantity

              // Agregar a disponibles (manteniendo formato con X)
              product.availableFormatted = `${product.availableQuantity}X${unitSize} ${productName} ${price}`
              available.push(product.availableFormatted)

              // Agregar a faltantes (SIN "x", solo números juntos)
              product.missingFormatted = `${product.missingQuantity}X${unitSize} ${productName} ${price}`
              missing.push(product.missingFormatted)
            }
          } else {
            // Si tiene ✅ pero no se puede parsear la cantidad, asumir disponible completo
            product.status = "available"
            product.availableQuantity = originalBoxes
            product.availableFormatted = `${originalBoxes}X${unitSize} ${productName} ${price}`
            available.push(product.availableFormatted)
          }
        }
      }

      processed.push(product)
    })

    setProcessedProducts(processed)
    setAvailableList(available.join("\n"))
    setMissingList(missing.join("\n"))
  }

  const copyToClipboard = async (text: string, type: string) => {
    if (!text.trim()) {
      alert("No hay datos para copiar")
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(""), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
      alert("No se pudo copiar al portapapeles")
    }
  }

  const clearData = () => {
    setInputText("")
    setProcessedProducts([])
    setAvailableList("")
    setMissingList("")
    setCopySuccess("")
  }

  // Calcular estadísticas
  const totalProducts = processedProducts.length
  const availableProducts = processedProducts.filter((p) => p.status === "available").length
  const partialProducts = processedProducts.filter((p) => p.status === "partial").length
  const unavailableProducts = processedProducts.filter((p) => p.status === "unavailable").length

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Procesador de Respuestas de Proveedores</h1>

      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">Instrucciones:</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>
              <strong>✅q1:</strong> "q" significa que le sobran (disponible completo)
            </li>
            <li>
              <strong>✅4x6:</strong> Cantidad específica disponible (4 cajas de 6)
            </li>
            <li>
              <strong>❌:</strong> Producto no disponible (va completo a faltantes)
            </li>
            <li>La herramienta separará automáticamente disponibles y faltantes</li>
            <li>Los productos parcialmente disponibles aparecerán en ambas listas</li>
          </ul>
        </div>

        {/* Área de entrada */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Respuesta del Proveedor</h2>
          <textarea
            className="textarea-field h-60"
            placeholder="Pega aquí la respuesta del proveedor...&#10;&#10;Ejemplo:&#10;20X6 CORDERO CON PIEL DE LOBO CAB SAUV $3150/3066.05❌&#10;5X6 CORDERO CON PIEL DE LOBO BLANCO DULCE $3150/3066.05✅q4&#10;140X6 CORDERO CON PIEL DE LOBO MALBEC 750CC $3150/3066.05✅24x6"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex gap-2 mt-4">
            <button onClick={processProducts} className="btn-primary flex items-center gap-2">
              <Package size={16} />
              Procesar Respuesta
            </button>
            <button onClick={clearData} className="btn-danger flex items-center gap-2">
              <Trash2 size={16} />
              Limpiar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {processedProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <Package className="text-blue-500" size={20} />
                <h3 className="font-semibold">Total Productos</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">{totalProducts}</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                <h3 className="font-semibold">Disponibles</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">{availableProducts}</p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" size={20} />
                <h3 className="font-semibold">Parciales</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{partialProducts}</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                <h3 className="font-semibold">No Disponibles</h3>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-2">{unavailableProducts}</p>
            </div>
          </div>
        )}

        {/* Productos Disponibles */}
        {availableList && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-600">Productos Disponibles</h2>
              <button
                onClick={() => copyToClipboard(availableList, "available")}
                className={`${copySuccess === "available" ? "bg-green-600" : "bg-green-500"} hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2`}
              >
                <Copy size={16} />
                {copySuccess === "available" ? "¡Copiado!" : "Copiar Disponibles"}
              </button>
            </div>
            <div className="bg-green-50 rounded-md p-4 max-h-60 overflow-y-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">{availableList}</pre>
            </div>
          </div>
        )}

        {/* Productos Faltantes */}
        {missingList && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-red-600">Productos Faltantes</h2>
              <button
                onClick={() => copyToClipboard(missingList, "missing")}
                className={`${copySuccess === "missing" ? "bg-green-600" : "bg-red-500"} hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2`}
              >
                <Copy size={16} />
                {copySuccess === "missing" ? "¡Copiado!" : "Copiar Faltantes"}
              </button>
            </div>
            <div className="bg-red-50 rounded-md p-4 max-h-60 overflow-y-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">{missingList}</pre>
            </div>
          </div>
        )}

        {/* Detalle de procesamiento */}
        {processedProducts.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Detalle del Procesamiento</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">Producto</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Cajas Pedidas</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Cajas Disponibles</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Cajas Faltantes</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {processedProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2">{product.productName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{product.originalQuantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{product.availableQuantity || 0}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{product.missingQuantity || 0}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.status === "available"
                              ? "bg-green-100 text-green-800"
                              : product.status === "partial"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.status === "available"
                            ? "Completo"
                            : product.status === "partial"
                              ? "Parcial"
                              : "No disponible"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
