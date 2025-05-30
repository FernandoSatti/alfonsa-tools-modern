"use client"

import { useState } from "react"
import { Search, Calculator, CheckCircle } from "lucide-react"

interface Product {
  name: string
  bottlesPerBox: number
}

interface CalculationResult {
  id: string
  original: string
  total?: number
  product?: string
  error?: boolean
  verified: boolean
}

const productDatabase: Product[] = [
   { name: "CAMPARI 1L", bottlesPerBox: 6 },
  { name: "CAMPARI 450CC CHICO", bottlesPerBox: 12 },
  { name: "CAMPARI 750cc", bottlesPerBox: 12 },
  { name: "CAZALIS LEGER AMERICANO 950CC", bottlesPerBox: 12 },
  { name: "CINZANO BIANCO 1L", bottlesPerBox: 12 },
  { name: "CINZANO BIANCO 450CC CHICO", bottlesPerBox: 12 },
  { name: "CINZANO ROSSO 1L", bottlesPerBox: 12 },
  { name: "CINZANO ROSSO 450CC CHICO", bottlesPerBox: 12 },
  { name: "COÑAC RESERVA SAN JUAN", bottlesPerBox: 6 },
  { name: "CYNAR 70 750CC", bottlesPerBox: 6 },
  { name: "GIN BULLDOG 750CC", bottlesPerBox: 6 },
  { name: "OLD SMUGLER 1L", bottlesPerBox: 6 },
  { name: "OLD SMUGLER 750CC", bottlesPerBox: 6 },
  { name: "PETACA WHISKY OLD SMUGLER", bottlesPerBox: 24 },
  { name: "SKYY APRICOT 750CC", bottlesPerBox: 12 },
  { name: "SKYY BLOOD ORANGE 750CC", bottlesPerBox: 12 },
  { name: "SKYY PASSION FUIT 750CC", bottlesPerBox: 12 },
  { name: "SKYY PINEAPPLE 750CC", bottlesPerBox: 12 },
  { name: "SKYY RASPBERRY 750CC", bottlesPerBox: 12 },
  { name: "SKYY TRADICIONAL 750", bottlesPerBox: 12 },
  { name: "TEQUILA JOSE CUERVO GOLD", bottlesPerBox: 12 },
  { name: "TEQUILA JOSE CUERVO SILVER", bottlesPerBox: 12 },
  { name: "ENCUENTRO RUTINI CABERNET SUAV", bottlesPerBox: 6 },
  { name: "ENCUENTRO RUTINI CHARDONNAY", bottlesPerBox: 6 },
  { name: "ENCUENTRO RUTINI MALBEC", bottlesPerBox: 6 },
  { name: "ENCUENTRO RUTINI MALBEC ESTUCHE", bottlesPerBox: 6 },
  { name: "RUTINI CABERNET - MERLOT 750CC", bottlesPerBox: 6 },
  { name: "RUTINI CABERNET FRANC 750CC", bottlesPerBox: 6 },
  { name: "RUTINI CABERNET FRANC MALBEC 750C", bottlesPerBox: 6 },
  { name: "RUTINI CABERNET MALBEC 750CC", bottlesPerBox: 6 },
  { name: "RUTINI CABERNET MALBEC ESTUC 750 X1", bottlesPerBox: 6 },
  { name: "RUTINI EXTRA BRUT 750CC", bottlesPerBox: 4 },
  { name: "RUTINI MALBEC 750CC", bottlesPerBox: 6 },
  { name: "RUTINI MALBEC ESTUCHE 750CC", bottlesPerBox: 6 },
  { name: "SAN FELIPE 12 UVAS", bottlesPerBox: 6 },
  { name: "SAN FELIPE CABERNET SUAV 750CC", bottlesPerBox: 6 },
  { name: "SAN FELIPE MALBEC 750CC", bottlesPerBox: 6 },
  { name: "SAN FELIPE ROBLE CABERNET SAUV 750", bottlesPerBox: 6 },
  { name: "SAN FELIPE ROBLE MALBEC 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER BRUT NATURE 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER CABERNET FRANC 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER CABERNET SUAV 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER CHARDONNAY 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER EXTRA BRUT CHARDONNAY 750C", bottlesPerBox: 6 },
  { name: "TRUMPETER MALBEC 375CC", bottlesPerBox: 12 },
  { name: "TRUMPETER MALBEC 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER MALBEC ESTUCHE 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER MERLOT 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER RESERVA CABERNET 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER RESERVA MALBEC 750CC", bottlesPerBox: 6 },
  { name: "TRUMPETER RESERVA MALBEC ESTUCHE 7", bottlesPerBox: 6 },
  { name: "TRUMPETER RESERVA PINOT NOIR 750CC", bottlesPerBox: 6 },
  { name: "ALAMBRADO MALBEC ESTUCHE 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA CABERNET FRANC 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA CABERNET SUAV 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA CHENIN DULCE 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA CHENNIN DULCE + 2 VASOS", bottlesPerBox: 6 },
  { name: "SANTA JULIA MALBEC 375CC CHICOO", bottlesPerBox: 12 },
  { name: "SANTA JULIA MALBEC 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA PINOT NOIR 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA RESERVA MALBEC 750CC", bottlesPerBox: 6 },
  { name: "CORDERO CON PIEL DE LOBO BONARDA", bottlesPerBox: 6 },
  { name: "CORDERO CON PIEL DE LOBO CAB SAUV", bottlesPerBox: 6 },
  { name: "CORDERO CON PIEL DE LOBO CHARDONNAY", bottlesPerBox: 6 },
  { name: "CORDERO CON PIEL DE LOBO DULC NATU", bottlesPerBox: 6 },
  { name: "CORDERO CON PIEL DE LOBO ESP DULCE", bottlesPerBox: 6 },
  { name: "CORDERO CON PIEL DE LOBO EXT BRUT", bottlesPerBox: 6 },
  { name: "CORDERO CON PIEL DE LOBO MALBEC 750CC", bottlesPerBox: 6 },
  { name: "CORDERO CON PIEL DE LOBO MERLOT", bottlesPerBox: 6 },
  { name: "CORDERO CON PIEL DE LOBO SYRAH", bottlesPerBox: 6 },
  { name: "CORDERO MALBEC BAG IN BOX 3LT", bottlesPerBox: 6 },
  { name: "MALCRIADO MALBEC ESTUCHE", bottlesPerBox: 6 },
  { name: "MOSQUITA MUERTA BLEND DE TINTAS 750", bottlesPerBox: 6 },
  { name: "PERRO CALLEJERO BLEND DE MALBEC 750", bottlesPerBox: 6 },
  { name: "PERRO CALLEJERO CABERNET SAUV 750", bottlesPerBox: 6 },
  { name: "PERRO CALLEJERO CHARDONNAY 750", bottlesPerBox: 6 },
  { name: "PERRO CALLEJERO EXTRA BRUT MER", bottlesPerBox: 6 },
  { name: "PERRO CALLEJERO PINOT 750CC", bottlesPerBox: 6 },
  { name: "PISPI BLEND DE TINTAS 750CC", bottlesPerBox: 6 },
  { name: "RUSSIAN RYE 750CC", bottlesPerBox: 6 },
  { name: "SAPO DE OTRO POZO BLEND DE TINTAS", bottlesPerBox: 6 },
  { name: "ALAMBRADO MALBEC ESTUCHE 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA CABERNET FRANC 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA CABERNET SUAV 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA CHENIN DULCE 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA CHENNIN DULCE + 2 VASOS", bottlesPerBox: 6 },
  { name: "SANTA JULIA MALBEC 750CC", bottlesPerBox: 6 },
  { name: "SANTA JULIA PINOT NOIR 750CC", bottlesPerBox: 6 },
]

// Agregar una nueva interfaz para los resultados de extracción de botellas
interface BottleExtraction {
  productName: string
  bottlesPerBox: number
}

export default function BotellasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [multiplicationInput, setMultiplicationInput] = useState("")
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([])

  // Nuevos estados para la extracción de botellas por caja
  const [extractionInput, setExtractionInput] = useState("")
  const [extractionResults, setExtractionResults] = useState<BottleExtraction[]>([])
  const [copySuccess, setCopySuccess] = useState(false)

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }

  const searchProducts = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const normalizedQuery = normalizeText(query)

    const results = productDatabase.filter((product) => {
      const normalizedName = normalizeText(product.name)
      return normalizedName.includes(normalizedQuery)
    })

    setSearchResults(results)
  }

  const calculateMultiplications = () => {
    if (!multiplicationInput.trim()) {
      alert("Por favor, ingresa una lista de productos.")
      return
    }

    const lines = multiplicationInput.trim().split("\n")
    const results: CalculationResult[] = []

    lines.forEach((line, index) => {
      const match = line.match(/^(\d+)x(\d+)\s+(.+)$/)

      if (match) {
        const boxes = Number.parseInt(match[1])
        const bottlesPerBox = Number.parseInt(match[2])
        const productName = match[3].trim()
        const totalBottles = boxes * bottlesPerBox

        results.push({
          id: `calc-${index}`,
          original: line,
          total: totalBottles,
          product: productName,
          verified: false,
        })
      } else {
        results.push({
          id: `calc-${index}`,
          original: line,
          error: true,
          verified: false,
        })
      }
    })

    setCalculationResults(results)
  }

  const handleVerificationChange = (itemId: string, isChecked: boolean) => {
    setCalculationResults((prev) => prev.map((item) => (item.id === itemId ? { ...item, verified: isChecked } : item)))
  }

  // Nueva función para extraer información de botellas por caja
  const extractBottlesPerBox = () => {
    if (!extractionInput.trim()) {
      alert("Por favor, ingresa una lista de productos.")
      return
    }

    const lines = extractionInput.trim().split("\n")
    const results: BottleExtraction[] = []

    lines.forEach((line) => {
      // Buscar el patrón NxM donde M es el número de botellas por caja
      const match = line.match(/\d+x(\d+)\s+(.+)$/i)

      if (match) {
        const bottlesPerBox = Number.parseInt(match[1])
        const productName = match[2].trim()

        results.push({
          productName,
          bottlesPerBox,
        })
      }
    })

    setExtractionResults(results)
  }

  // Función para copiar los resultados al portapapeles
  const copyExtractionResults = async () => {
    if (extractionResults.length === 0) return

    const formattedText = extractionResults
      .map((result) => `${result.productName} ${result.bottlesPerBox} botellas`)
      .join("\n")

    try {
      await navigator.clipboard.writeText(formattedText)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
      alert("No se pudo copiar al portapapeles")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Herramientas de Inventario</h1>

      <div className="space-y-8">
        {/* Buscador de Botellas por Caja */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search size={20} />
            Buscador de Botellas por Caja
          </h2>
          <p className="text-gray-600 mb-4">Busca un producto para ver cuántas botellas vienen por caja:</p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                searchProducts(e.target.value)
              }}
            />
            <button onClick={() => searchProducts(searchQuery)} className="btn-primary flex items-center gap-2">
              <Search size={16} />
              Buscar
            </button>
          </div>

          <div className="bg-gray-50 rounded-md p-4 min-h-32 max-h-96 overflow-y-auto">
            {searchResults.length > 0 ? (
              <ul className="space-y-2">
                {searchResults.map((product, index) => (
                  <li key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-blue-600 font-semibold">({product.bottlesPerBox} botellas por caja)</span>
                  </li>
                ))}
              </ul>
            ) : searchQuery ? (
              <p className="text-gray-500 text-center">No se encontraron productos.</p>
            ) : (
              <p className="text-gray-500 text-center">Ingresa un término de búsqueda para ver resultados.</p>
            )}
          </div>
        </div>

        {/* Nueva sección: Extractor de Botellas por Caja */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search size={20} />
            Extractor de Botellas por Caja
          </h2>
          <p className="text-gray-600 mb-4">
            Pega una lista de productos en formato "NxM PRODUCTO" y obtén una lista con las botellas por caja:
          </p>

          <textarea
            className="textarea-field h-40 mb-4"
            placeholder="Ejemplo:&#10;6x6 OLD SMUGLER 1L&#10;1X12 SKYY APRICOT 750CC&#10;3x6 RUTINI MALBEC 750CC"
            value={extractionInput}
            onChange={(e) => setExtractionInput(e.target.value)}
          />

          <div className="flex gap-2 mb-4">
            <button onClick={extractBottlesPerBox} className="btn-primary flex items-center gap-2">
              <Search size={16} />
              Extraer Información
            </button>
            <button
              onClick={copyExtractionResults}
              className={`${copySuccess ? "bg-green-600" : "bg-blue-500"} hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2`}
              disabled={extractionResults.length === 0}
            >
              {copySuccess ? "¡Copiado!" : "Copiar Resultados"}
            </button>
          </div>

          <div className="bg-gray-50 rounded-md p-4 min-h-32">
            {extractionResults.length > 0 ? (
              <div className="space-y-2">
                {extractionResults.map((result, index) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <span className="font-medium">{result.productName} </span>
                    <span className="text-blue-600 font-semibold">{result.bottlesPerBox} botellas</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Los resultados aparecerán aquí...</p>
            )}
          </div>
        </div>

        {/* Calculador de Multiplicaciones */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calculator size={20} />
            Calculador de Multiplicaciones
          </h2>
          <p className="text-gray-600 mb-4">
            Ingresa una lista en formato "NxM producto" y obtén el total de botellas:
          </p>

          <textarea
            className="textarea-field h-40 mb-4"
            placeholder="Ejemplo:&#10;10x4 hermandad malbec&#10;15x6 piattelli salta reserva malbec&#10;5x6 piattelli salta reserva malbec-tanat"
            value={multiplicationInput}
            onChange={(e) => setMultiplicationInput(e.target.value)}
          />

          <button onClick={calculateMultiplications} className="btn-primary flex items-center gap-2 mb-4">
            <Calculator size={16} />
            Calcular
          </button>

          <div className="bg-gray-50 rounded-md p-4 min-h-32">
            {calculationResults.length > 0 ? (
              <div className="space-y-2">
                {calculationResults.map((result) => (
                  <div
                    key={result.id}
                    className={`flex justify-between items-center p-3 rounded border ${
                      result.verified ? "bg-green-50 border-green-200" : "bg-white"
                    }`}
                  >
                    <div className="flex-1">
                      {result.error ? (
                        <div className="text-red-600">{result.original} (formato incorrecto)</div>
                      ) : (
                        <div className={`${result.verified ? "text-green-700" : "text-green-600"} font-semibold`}>
                          {result.total} {result.product}
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-green-600"
                        checked={result.verified}
                        onChange={(e) => handleVerificationChange(result.id, e.target.checked)}
                      />
                      <span className={`text-sm ${result.verified ? "text-green-600 font-semibold" : "text-gray-600"}`}>
                        {result.verified ? "Verificado" : "Verificar"}
                      </span>
                      {result.verified && <CheckCircle size={16} className="text-green-600" />}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Los resultados aparecerán aquí...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
