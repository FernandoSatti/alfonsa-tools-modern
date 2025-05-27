"use client"

import { useState } from "react"
import { Plus, Trash2, Copy, Clipboard, Cog } from "lucide-react"

interface Config {
  id: string
  value: number
}

export default function PreciosPage() {
  const [price, setPrice] = useState<number>(0)
  const [configurations, setConfigurations] = useState<Config[]>([])
  const [productList, setProductList] = useState("")
  const [processedList, setProcessedList] = useState("")
  const [showProcessed, setShowProcessed] = useState(false)
  const [copySuccess, setCopySuccess] = useState("")

  const addConfig = () => {
    const newConfig: Config = {
      id: `config-${configurations.length}`,
      value: 0,
    }
    setConfigurations([...configurations, newConfig])
  }

  const updateConfig = (id: string, value: number) => {
    setConfigurations((configs) => configs.map((config) => (config.id === id ? { ...config, value } : config)))
  }

  const removeConfig = (id: string) => {
    setConfigurations((configs) => configs.filter((config) => config.id !== id))
  }

  const calculateResult = (customPrice?: number) => {
    const basePrice = customPrice !== undefined ? customPrice : price
    let result = basePrice

    configurations.forEach((config) => {
      result *= 1 + config.value / 100
    })

    return result
  }

  const processProductList = () => {
    if (!productList.trim()) {
      alert("Por favor, ingresa una lista de productos.")
      return
    }

    const lines = productList.split("\n")
    const processedLines = lines.map((line) => {
      const priceMatch = line.match(/\$(\d+(\.\d+)?)\//)

      if (priceMatch && priceMatch[1]) {
        const originalPrice = Number.parseFloat(priceMatch[1])
        const calculatedPrice = calculateResult(originalPrice)

        return line.replace(/(\$\d+(\.\d+)?)\//, `$1/${calculatedPrice.toFixed(2)}`)
      }

      return line
    })

    setProcessedList(processedLines.join("\n"))
    setShowProcessed(true)
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(""), 1000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setPrice(Number.parseFloat(text) || 0)
    } catch (err) {
      console.error("Error al pegar:", err)
    }
  }

  const clearList = () => {
    setProductList("")
    setProcessedList("")
    setShowProcessed(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Calculadora de Precio con Listas</h1>

      <div className="space-y-8">
        {/* Calculadora Individual */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Calculadora Individual</h2>

          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              Introduce el precio:
            </label>
            <input
              type="number"
              id="price"
              className="input-field"
              placeholder="Introduce el precio"
              value={price || ""}
              onChange={(e) => setPrice(Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Configuración de Aumentos/Descuentos:</h3>
            <div className="space-y-2">
              {configurations.map((config, index) => (
                <div key={config.id} className="flex items-center gap-2">
                  <label className="text-sm font-medium min-w-0 flex-shrink-0">Aum/Desc {index + 1} (%):</label>
                  <input
                    type="number"
                    className="input-field flex-1"
                    value={config.value || ""}
                    onChange={(e) => updateConfig(config.id, Number.parseFloat(e.target.value) || 0)}
                  />
                  <button onClick={() => removeConfig(config.id)} className="btn-danger flex items-center gap-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addConfig} className="btn-primary mt-2 flex items-center gap-2">
              <Plus size={16} />
              Agregar Configuración
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <div className="text-lg font-semibold text-blue-600">Resultado: ${calculateResult().toFixed(2)}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(calculateResult().toFixed(2), "result")}
              className={`${copySuccess === "result" ? "bg-green-600" : "bg-blue-500"} hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2`}
            >
              <Copy size={16} />
              {copySuccess === "result" ? "Copiado" : "Copiar"}
            </button>
            <button onClick={pasteFromClipboard} className="btn-secondary flex items-center gap-2">
              <Clipboard size={16} />
              Pegar
            </button>
          </div>
        </div>

        {/* Procesador de Listas */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Procesador de Listas</h2>

          <div className="mb-4">
            <label htmlFor="productList" className="block text-sm font-medium mb-2">
              Lista de productos (formato: "DESCRIPCIÓN $PRECIO/"):
            </label>
            <textarea
              id="productList"
              className="textarea-field h-40"
              placeholder="Ejemplo:&#10;3x6 CAMPARI 1L $13317.21/&#10;2x12 CAMPARI 450CC CHICO $6106.23/"
              value={productList}
              onChange={(e) => setProductList(e.target.value)}
            />
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={processProductList} className="btn-primary flex items-center gap-2">
              <Cog size={16} />
              Procesar Lista
            </button>
            <button onClick={clearList} className="btn-danger flex items-center gap-2">
              <Trash2 size={16} />
              Limpiar Lista
            </button>
          </div>

          {showProcessed && (
            <div>
              <label htmlFor="processedList" className="block text-sm font-medium mb-2">
                Lista Procesada:
              </label>
              <textarea id="processedList" className="textarea-field h-40 bg-gray-50" value={processedList} readOnly />
              <button
                onClick={() => copyToClipboard(processedList, "list")}
                className={`${copySuccess === "list" ? "bg-green-600" : "bg-blue-500"} hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2 mt-2`}
              >
                <Copy size={16} />
                {copySuccess === "list" ? "Lista Copiada" : "Copiar Lista"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
