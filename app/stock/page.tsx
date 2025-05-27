"use client"

import React from "react"

import { useState, useEffect } from "react"
import { FileText, Trash2, Download, Search } from "lucide-react"

interface StoreData {
  codigo: string
  denominacion: string
  stock: number
  minimo: number
  reponer: number
  sucursal: string
}

interface ConsolidatedProduct {
  codigo: string
  denominacion: string
  stores: Record<string, { stock: number; minimo: number; reponer: number }>
  totalReponer: number
}

export default function StockPage() {
  const [betbederInput, setBetbederInput] = useState("")
  const [iseasInput, setIseasInput] = useState("")
  const [llerenaInput, setLlerenaInput] = useState("")
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedProduct[]>([])
  const [filteredData, setFilteredData] = useState<ConsolidatedProduct[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyReponer, setShowOnlyReponer] = useState(true)
  const [sortOrder, setSortOrder] = useState<"codigo" | "denominacion" | "reponer">("codigo")

  // Datos de ejemplo
  useEffect(() => {
    setBetbederInput(`Código	Denominación	Stock	Mínimo	A Reponer
				
859            	ABSOLUT APEACH 700CC                    		30	30
4034           	ABSOLUT ELYX 1L                         		3	3
1899           	ABSOLUT GRAPEFRUIT 700CC                		30	30
1104           	ABSOLUT LIMA 700CC                      		30	30
868            	ABSOLUT MANDRIN 700CC                   		24	24
869            	ABSOLUT MANGO 700CC                     		42	42
872            	ABSOLUT PEARS 700CC                     		42	42
873            	ABSOLUT RASPBERRY 700CC                 		180	180
24048          	ABSOLUT TRADICIONAL 500CC               		12	12
876            	ABSOLUT TRADICIONAL 700CC               	52	72	20
877            	ABSOLUT VAINILLA 700CC                  		24	24
6662           	ABSOLUT WATERMELON 700CC                		24	24
7699           	ABSOLUT WILD BERRI 700CC                		120	120`)

    setIseasInput(`Código	Denominación	Stock	Mínimo	A Reponer
				
859            	ABSOLUT APEACH 700CC                    	3	12	9
1899           	ABSOLUT GRAPEFRUIT 700CC                		24	24
1104           	ABSOLUT LIMA 700CC                      		30	30
868            	ABSOLUT MANDRIN 700CC                   	9	12	3
869            	ABSOLUT MANGO 700CC                     	12	30	18
872            	ABSOLUT PEARS 700CC                     		30	30
873            	ABSOLUT RASPBERRY 700CC                 		60	60
24048          	ABSOLUT TRADICIONAL 500CC               	9	12	3
877            	ABSOLUT VAINILLA 700CC                  	9	18	9
7699           	ABSOLUT WILD BERRI 700CC                		36	36`)

    setLlerenaInput(`Código	Denominación	Stock	Mínimo	A Reponer
				
859            	ABSOLUT APEACH 700CC                    		30	30
4034           	ABSOLUT ELYX 1L                         		3	3
1899           	ABSOLUT GRAPEFRUIT 700CC                		30	30
1104           	ABSOLUT LIMA 700CC                      		30	30
868            	ABSOLUT MANDRIN 700CC                   		24	24
869            	ABSOLUT MANGO 700CC                     		42	42
872            	ABSOLUT PEARS 700CC                     		42	42
873            	ABSOLUT RASPBERRY 700CC                 		180	180
24048          	ABSOLUT TRADICIONAL 500CC               		12	12
876            	ABSOLUT TRADICIONAL 700CC               	52	72	20`)
  }, [])

  const parseStoreData = (inputText: string, storeName: string): StoreData[] => {
    const lines = inputText.trim().split("\n")
    const products: StoreData[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith("Código")) continue

      const parts = line.split("\t")
      if (parts.length < 2) continue

      const codigo = parts[0].trim()
      const denominacion = parts[1].trim()

      let stock = 0
      if (parts.length > 2 && parts[2].trim() !== "") {
        stock = Number.parseInt(parts[2].trim()) || 0
      }

      let minimo = 0
      if (parts.length > 3 && parts[3].trim() !== "") {
        minimo = Number.parseInt(parts[3].trim()) || 0
      }

      let reponer = 0
      if (parts.length > 4 && parts[4].trim() !== "") {
        reponer = Number.parseInt(parts[4].trim()) || 0
      }

      products.push({
        codigo,
        denominacion,
        stock,
        minimo,
        reponer,
        sucursal: storeName,
      })
    }

    return products
  }

  const processData = () => {
    const betbederData = parseStoreData(betbederInput, "betbeder")
    const iseasData = parseStoreData(iseasInput, "iseas")
    const llerenaData = parseStoreData(llerenaInput, "llerena")

    const allData = [...betbederData, ...iseasData, ...llerenaData]
    const consolidatedMap: Record<string, ConsolidatedProduct> = {}

    allData.forEach((product) => {
      const key = `${product.codigo}-${product.denominacion}`

      if (!consolidatedMap[key]) {
        consolidatedMap[key] = {
          codigo: product.codigo,
          denominacion: product.denominacion,
          stores: {},
          totalReponer: 0,
        }
      }

      consolidatedMap[key].stores[product.sucursal] = {
        stock: product.stock,
        minimo: product.minimo,
        reponer: product.reponer,
      }

      consolidatedMap[key].totalReponer += product.reponer
    })

    const consolidated = Object.values(consolidatedMap)
    setConsolidatedData(consolidated)
    sortData(consolidated, sortOrder)
  }

  const sortData = (data: ConsolidatedProduct[], order: typeof sortOrder) => {
    const sorted = [...data]

    if (order === "codigo") {
      sorted.sort((a, b) => a.codigo.localeCompare(b.codigo))
    } else if (order === "denominacion") {
      sorted.sort((a, b) => a.denominacion.localeCompare(b.denominacion))
    } else if (order === "reponer") {
      sorted.sort((a, b) => b.totalReponer - a.totalReponer)
    }

    setSortOrder(order)
    filterResults(sorted)
  }

  const filterResults = (data?: ConsolidatedProduct[]) => {
    const dataToFilter = data || consolidatedData

    const filtered = dataToFilter.filter((item) => {
      const matchesSearch =
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.denominacion.toLowerCase().includes(searchTerm.toLowerCase())

      const needsReplenishment = item.totalReponer > 0

      return matchesSearch && (!showOnlyReponer || needsReplenishment)
    })

    setFilteredData(filtered)
  }

  useEffect(() => {
    filterResults()
  }, [searchTerm, showOnlyReponer, consolidatedData])

  const clearAll = () => {
    setBetbederInput("")
    setIseasInput("")
    setLlerenaInput("")
    setConsolidatedData([])
    setFilteredData([])
    setSearchTerm("")
  }

  const exportToExcel = () => {
    if (consolidatedData.length === 0) {
      alert("No hay datos para exportar")
      return
    }

    const stores = ["betbeder", "iseas", "llerena"]
    let csv = "Código,Denominación,"

    stores.forEach((store) => {
      csv += `${store.charAt(0).toUpperCase() + store.slice(1)} Stock,${store.charAt(0).toUpperCase() + store.slice(1)} Mínimo,${store.charAt(0).toUpperCase() + store.slice(1)} A Reponer,`
    })
    csv += "Total a Reponer\n"

    filteredData.forEach((product) => {
      csv += `"${product.codigo}","${product.denominacion}",`

      stores.forEach((store) => {
        const storeData = product.stores[store] || { stock: 0, minimo: 0, reponer: 0 }
        csv += `${storeData.stock || "0"},${storeData.minimo || ""},${storeData.reponer > 0 ? storeData.reponer : "-"},`
      })

      csv += `${product.totalReponer > 0 ? product.totalReponer : "-"}\n`
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    const date = new Date()
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`

    link.href = url
    link.download = `reposicion_stock_${formattedDate}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const stores = ["betbeder", "iseas", "llerena"]
  const storeTotals = stores.reduce(
    (acc, store) => {
      acc[store] = consolidatedData.reduce((sum, product) => {
        return sum + (product.stores[store]?.reponer || 0)
      }, 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const grandTotal = Object.values(storeTotals).reduce((sum, total) => sum + total, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Sistema de Gestión de Reposición de Stock</h1>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Instrucciones:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Copia y pega los datos de cada sucursal en los campos correspondientes.</li>
          <li>El formato debe incluir: Código, Denominación, Stock, Mínimo, A Reponer (separados por tabulaciones).</li>
          <li>Si un producto no tiene stock (0), puedes omitir ese valor.</li>
          <li>Haz clic en "Procesar Datos" para ver el informe consolidado.</li>
          <li>Usa los botones de ordenamiento para cambiar el orden de la tabla.</li>
          <li>Usa el botón "Exportar a Excel" para descargar los resultados en formato Excel.</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Sucursal Betbeder</h3>
          <textarea
            className="textarea-field h-40 text-xs font-mono"
            placeholder="Pega aquí los datos de Betbeder..."
            value={betbederInput}
            onChange={(e) => setBetbederInput(e.target.value)}
          />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Sucursal Iseas</h3>
          <textarea
            className="textarea-field h-40 text-xs font-mono"
            placeholder="Pega aquí los datos de Iseas..."
            value={iseasInput}
            onChange={(e) => setIseasInput(e.target.value)}
          />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Sucursal Llerena</h3>
          <textarea
            className="textarea-field h-40 text-xs font-mono"
            placeholder="Pega aquí los datos de Llerena..."
            value={llerenaInput}
            onChange={(e) => setLlerenaInput(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button onClick={processData} className="btn-secondary flex items-center gap-2">
          <FileText size={16} />
          Procesar Datos
        </button>
        <button onClick={clearAll} className="btn-danger flex items-center gap-2">
          <Trash2 size={16} />
          Limpiar Todo
        </button>
      </div>

      {consolidatedData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Reporte Consolidado de Reposición</h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stores.map((store) => (
              <div key={store} className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="font-medium text-gray-600">{store.charAt(0).toUpperCase() + store.slice(1)}</h3>
                <div className="text-2xl font-bold text-red-600">{storeTotals[store]}</div>
                <div className="text-sm text-gray-500">productos a reponer</div>
              </div>
            ))}
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <h3 className="font-medium text-blue-600">Total General</h3>
              <div className="text-2xl font-bold text-blue-600">{grandTotal}</div>
              <div className="text-sm text-blue-500">productos a reponer</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                className="input-field w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showOnlyReponer} onChange={(e) => setShowOnlyReponer(e.target.checked)} />
              <span className="text-sm">Solo mostrar productos a reponer</span>
            </label>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <span className="text-sm font-medium">Ordenar por:</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sort"
                checked={sortOrder === "codigo"}
                onChange={() => sortData(consolidatedData, "codigo")}
              />
              <span className="text-sm">Código</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sort"
                checked={sortOrder === "denominacion"}
                onChange={() => sortData(consolidatedData, "denominacion")}
              />
              <span className="text-sm">Denominación (Alfabético)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sort"
                checked={sortOrder === "reponer"}
                onChange={() => sortData(consolidatedData, "reponer")}
              />
              <span className="text-sm">Mayor cantidad a reponer</span>
            </label>
          </div>

          <button onClick={exportToExcel} className="btn-primary flex items-center gap-2 mb-4">
            <Download size={16} />
            Exportar a Excel
          </button>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-2 text-left sticky left-0 bg-gray-50">Código</th>
                  <th className="border border-gray-300 px-2 py-2 text-left sticky left-16 bg-gray-50">Denominación</th>
                  {stores.map((store) => (
                    <th key={store} className="border border-gray-300 px-2 py-2 text-center" colSpan={3}>
                      {store.charAt(0).toUpperCase() + store.slice(1)}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-2 py-2 text-center">Total a Reponer</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-1 sticky left-0 bg-gray-50"></th>
                  <th className="border border-gray-300 px-2 py-1 sticky left-16 bg-gray-50"></th>
                  {stores.map((store) => (
                    <React.Fragment key={store}>
                      <th className="border border-gray-300 px-1 py-1 text-xs">Stock</th>
                      <th className="border border-gray-300 px-1 py-1 text-xs">Mín</th>
                      <th className="border border-gray-300 px-1 py-1 text-xs">Reponer</th>
                    </React.Fragment>
                  ))}
                  <th className="border border-gray-300 px-2 py-1"></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 sticky left-0 bg-white">{product.codigo}</td>
                    <td className="border border-gray-300 px-2 py-1 sticky left-16 bg-white">{product.denominacion}</td>
                    {stores.map((store) => {
                      const storeData = product.stores[store] || { stock: 0, minimo: 0, reponer: 0 }
                      return (
                        <React.Fragment key={store}>
                          <td
                            className={`border border-gray-300 px-1 py-1 text-center ${storeData.stock === 0 ? "text-red-600 font-bold" : ""}`}
                          >
                            {storeData.stock || "0"}
                          </td>
                          <td className="border border-gray-300 px-1 py-1 text-center">{storeData.minimo || ""}</td>
                          <td
                            className={`border border-gray-300 px-1 py-1 text-center ${storeData.reponer > 0 ? "text-red-600 font-bold" : ""}`}
                          >
                            {storeData.reponer > 0 ? storeData.reponer : "-"}
                          </td>
                        </React.Fragment>
                      )
                    })}
                    <td
                      className={`border border-gray-300 px-2 py-1 text-center ${product.totalReponer > 0 ? "text-red-600 font-bold" : ""}`}
                    >
                      {product.totalReponer > 0 ? product.totalReponer : "-"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-300 px-2 py-1 sticky left-0 bg-gray-100">TOTALES</td>
                  <td className="border border-gray-300 px-2 py-1 sticky left-16 bg-gray-100"></td>
                  {stores.map((store) => (
                    <React.Fragment key={store}>
                      <td className="border border-gray-300 px-1 py-1"></td>
                      <td className="border border-gray-300 px-1 py-1"></td>
                      <td className="border border-gray-300 px-1 py-1 text-center text-red-600">
                        {storeTotals[store]}
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="border border-gray-300 px-2 py-1 text-center text-red-600">{grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
