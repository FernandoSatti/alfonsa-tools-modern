"use client"

import { useState, useEffect } from "react"
import { FileText, Trash2, Save, Download } from "lucide-react"

interface PriceItem {
  name: string
  price: number
  normalized: string
}

interface InvoiceItem {
  description: string
  quantity: number
  price: number
  subtotal: number
  found: boolean
  matchedProduct?: string
  matchScore?: number
}

export default function FacturasPage() {
  const [activeTab, setActiveTab] = useState<"input" | "price">("input")
  const [productInput, setProductInput] = useState("")
  const [priceInput, setPriceInput] = useState("")
  const [priceList, setPriceList] = useState<Record<string, PriceItem>>({})
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [debugMode, setDebugMode] = useState(false)

  // Cargar precios de ejemplo al iniciar
  useEffect(() => {
    const samplePrices = `CAMPARI 1L 10318.73
CAMPARI 450CC CHICO 4731.36
CAMPARI 750c 7891.47`
    setPriceInput(samplePrices)
    updatePriceList(samplePrices)
  }, [])

  const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/\s+/g, " ").replace(/cc/gi, "").replace(/ml/gi, "").replace(/l$/gi, "").trim()
  }

  const updatePriceList = (input: string) => {
    const lines = input.split("\n")
    const newPriceList: Record<string, PriceItem> = {}

    lines.forEach((line) => {
      line = line.trim()
      if (line === "") return

      const priceMatch = line.match(/[$]?(\d+(\.\d+)?)$/)
      if (priceMatch) {
        const price = Number.parseFloat(priceMatch[1])
        const productName = line.substring(0, line.lastIndexOf(priceMatch[0])).trim()
        const normalizedName = normalizeText(productName)

        newPriceList[productName] = {
          name: productName,
          price: price,
          normalized: normalizedName,
        }
      }
    })

    setPriceList(newPriceList)
    localStorage.setItem("priceList", JSON.stringify(newPriceList))
  }

  const findBestPriceMatch = (productName: string) => {
    const normalizedProductName = normalizeText(productName)
    let bestMatch = null
    let bestScore = 0
    let bestPrice = 0

    for (const [listedProduct, data] of Object.entries(priceList)) {
      const normalizedListedProduct = data.normalized
      let score = 0

      if (normalizedProductName === normalizedListedProduct) {
        score = 100
      } else if (normalizedProductName.includes(normalizedListedProduct)) {
        score = 80 + (normalizedListedProduct.length / normalizedProductName.length) * 20
      } else if (normalizedListedProduct.includes(normalizedProductName)) {
        score = 60 + (normalizedProductName.length / normalizedListedProduct.length) * 20
      } else {
        const productWords = normalizedProductName.split(" ")
        const listedWords = normalizedListedProduct.split(" ")

        let matchedWords = 0
        for (const word of productWords) {
          if (word.length > 2 && listedWords.includes(word)) {
            matchedWords++
          }
        }

        if (matchedWords > 0) {
          score = (matchedWords / productWords.length) * 50
        }
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = listedProduct
        bestPrice = data.price
      }
    }

    return {
      found: bestScore > 30,
      productName: bestMatch,
      price: bestPrice,
      score: bestScore,
    }
  }

  const generateInvoice = () => {
    const lines = productInput.split("\n")
    const items: InvoiceItem[] = []

    lines.forEach((line) => {
      line = line.trim()
      if (line === "") return

      const quantityMatch = line.match(/^(\d+)x(\d+)/)
      if (!quantityMatch) return

      const packages = Number.parseInt(quantityMatch[1])
      const unitsPerPackage = Number.parseInt(quantityMatch[2])
      const totalUnits = packages * unitsPerPackage

      const productName = line.substring(line.indexOf(" ") + 1).trim()
      const priceMatch = findBestPriceMatch(productName)

      const subtotal = totalUnits * priceMatch.price

      items.push({
        description: productName,
        quantity: totalUnits,
        price: priceMatch.price,
        subtotal: subtotal,
        found: priceMatch.found,
        matchedProduct: priceMatch.productName,
        matchScore: priceMatch.score,
      })
    })

    setInvoiceItems(items)
  }

  const clearInput = () => {
    setProductInput("")
    setInvoiceItems([])
  }

  const copyInvoice = async () => {
    if (invoiceItems.length === 0) {
      alert("No hay factura para copiar")
      return
    }

    let text = "Descripción\tCantidad\tPrecio Unitario\tSubtotal\n"

    invoiceItems.forEach((item) => {
      text += `${item.description}\t${item.quantity}\t$${item.price.toFixed(2)}\t$${item.subtotal.toFixed(2)}\n`
    })

    const total = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0)
    text += `Total\t\t\t$${total.toFixed(2)}\n`

    try {
      await navigator.clipboard.writeText(text)
      alert("Factura copiada al portapapeles")
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  const exportToExcel = () => {
    if (invoiceItems.length === 0) {
      alert("No hay factura para exportar")
      return
    }

    let csv = "Descripción,Cantidad,Precio Unitario,Subtotal\n"

    invoiceItems.forEach((item) => {
      csv += `"${item.description}",${item.quantity},$${item.price.toFixed(2)},$${item.subtotal.toFixed(2)}\n`
    })

    const total = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0)
    csv += `"Total",,,${total.toFixed(2)}\n`

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "factura.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const total = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Generador de Facturas</h1>

      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab("input")}
          className={`px-4 py-2 font-medium ${activeTab === "input" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Generar Factura
        </button>
        <button
          onClick={() => setActiveTab("price")}
          className={`px-4 py-2 font-medium ${activeTab === "price" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Lista de Precios
        </button>
      </div>

      {activeTab === "input" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Ingresa los productos</h2>
            <p className="text-gray-600 mb-2">Formato: [cantidad]x[unidades] [nombre del producto]</p>
            <p className="text-gray-600 mb-4">Ejemplo: 3x6 CAMPARI 1L</p>

            <textarea
              className="textarea-field h-40"
              placeholder="Pega tu lista de productos aquí...&#10;Ejemplo:&#10;3x6 CAMPARI 1L&#10;2x12 CAMPARI 450CC CHICO&#10;2x12 CAMPARI 750c"
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
            />

            <div className="flex gap-2 mt-4">
              <button onClick={generateInvoice} className="btn-primary flex items-center gap-2">
                <FileText size={16} />
                Generar Factura
              </button>
              <button onClick={clearInput} className="btn-danger flex items-center gap-2">
                <Trash2 size={16} />
                Limpiar
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Factura Generada</h2>

            {invoiceItems.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Cantidad</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Precio Unitario</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, index) => (
                        <tr key={index} className={!item.found ? "bg-red-50" : ""}>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.description}
                            {!item.found && <span className="text-red-500 text-sm"> (Precio no encontrado)</span>}
                            {item.found && item.matchScore && item.matchScore < 100 && debugMode && (
                              <div className="text-xs text-gray-500">
                                Coincidencia: {item.matchedProduct} ({item.matchScore.toFixed(0)}%)
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">${item.price.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">${item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td className="border border-gray-300 px-4 py-2 text-right" colSpan={3}>
                          Total
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">${total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={copyInvoice} className="btn-primary flex items-center gap-2">
                    <FileText size={16} />
                    Copiar Factura
                  </button>
                  <button onClick={exportToExcel} className="btn-secondary flex items-center gap-2">
                    <Download size={16} />
                    Exportar a Excel
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">La factura aparecerá aquí...</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "price" && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Lista de Precios</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p>
              <strong>Formato:</strong> Nombre del producto Precio
            </p>
            <p>
              <strong>Ejemplo:</strong> CAMPARI 1L 10318.73
            </p>
            <p>Puedes incluir o no el símbolo $ antes del precio.</p>
          </div>

          <textarea
            className="textarea-field h-40"
            placeholder="Pega tu lista de precios aquí...&#10;Ejemplo:&#10;CAMPARI 1L 10318.73&#10;CAMPARI 450CC CHICO 4731.36&#10;CAMPARI 750c 7891.47"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
          />

          <div className="flex gap-2 mt-4">
            <button onClick={() => updatePriceList(priceInput)} className="btn-primary flex items-center gap-2">
              <Save size={16} />
              Guardar Lista de Precios
            </button>
            <button
              onClick={() => {
                setPriceInput("")
                setPriceList({})
                localStorage.removeItem("priceList")
              }}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 size={16} />
              Limpiar
            </button>
          </div>

          {Object.keys(priceList).length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Productos guardados:</h3>
                <button onClick={() => setDebugMode(!debugMode)} className="text-sm text-blue-600 hover:text-blue-800">
                  {debugMode ? "Ocultar" : "Mostrar"} información de depuración
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Producto</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Precio</th>
                      {debugMode && <th className="border border-gray-300 px-4 py-2 text-left">Nombre Normalizado</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(priceList).map(([product, data]) => (
                      <tr key={product}>
                        <td className="border border-gray-300 px-4 py-2">{product}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">${data.price.toFixed(2)}</td>
                        {debugMode && (
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">{data.normalized}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
