"use client"

import React from "react"

import { useState, useEffect } from "react"
import { FileText, Trash2, Download, Search } from "lucide-react"
import * as XLSX from "xlsx"

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

    try {
      // Crear el workbook
      const workbook = XLSX.utils.book_new()

      // Preparar los datos con formato mejorado
      const excelData: any[] = []

      // Agregar encabezado principal con merge
      excelData.push([
        "Código",
        "Denominación",
        "Betbeder",
        "",
        "",
        "Iseas",
        "",
        "",
        "Llerena",
        "",
        "",
        "Total a Reponer",
      ])

      // Agregar subencabezados
      excelData.push([
        "",
        "",
        "Stock",
        "Mínimo",
        "A Reponer",
        "Stock",
        "Mínimo",
        "A Reponer",
        "Stock",
        "Mínimo",
        "A Reponer",
        "",
      ])

      // Agregar los datos de productos
      filteredData.forEach((product) => {
        const betbederData = product.stores["betbeder"] || { stock: 0, minimo: 0, reponer: 0 }
        const iseasData = product.stores["iseas"] || { stock: 0, minimo: 0, reponer: 0 }
        const llerenaData = product.stores["llerena"] || { stock: 0, minimo: 0, reponer: 0 }

        excelData.push([
          product.codigo,
          product.denominacion,
          betbederData.stock || 0,
          betbederData.minimo || "",
          betbederData.reponer > 0 ? betbederData.reponer : "",
          iseasData.stock || 0,
          iseasData.minimo || "",
          iseasData.reponer > 0 ? iseasData.reponer : "",
          llerenaData.stock || 0,
          llerenaData.minimo || "",
          llerenaData.reponer > 0 ? llerenaData.reponer : "",
          product.totalReponer > 0 ? product.totalReponer : "",
        ])
      })

      // Agregar fila de totales
      excelData.push([
        "TOTALES",
        "",
        "",
        "",
        storeTotals["betbeder"] || 0,
        "",
        "",
        storeTotals["iseas"] || 0,
        "",
        "",
        storeTotals["llerena"] || 0,
        grandTotal,
      ])

      // Crear worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(excelData)

      // Configurar anchos de columna
      const columnWidths = [
        { wch: 12 }, // Código
        { wch: 40 }, // Denominación
        { wch: 10 }, // Betbeder Stock
        { wch: 10 }, // Betbeder Mínimo
        { wch: 12 }, // Betbeder A Reponer
        { wch: 10 }, // Iseas Stock
        { wch: 10 }, // Iseas Mínimo
        { wch: 12 }, // Iseas A Reponer
        { wch: 10 }, // Llerena Stock
        { wch: 10 }, // Llerena Mínimo
        { wch: 12 }, // Llerena A Reponer
        { wch: 15 }, // Total a Reponer
      ]
      worksheet["!cols"] = columnWidths

      // Configurar merges para encabezados principales
      worksheet["!merges"] = [
        { s: { r: 0, c: 2 }, e: { r: 0, c: 4 } }, // Betbeder
        { s: { r: 0, c: 5 }, e: { r: 0, c: 7 } }, // Iseas
        { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } }, // Llerena
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Código
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Denominación
        { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } }, // Total a Reponer
      ]

      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")

      // Aplicar estilos a todas las celdas
      for (let row = 0; row <= range.e.r; row++) {
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: "" }

          // Estilos para encabezados principales (fila 0)
          if (row === 0) {
            if (col === 0 || col === 1 || col === 11) {
              // Código, Denominación, Total a Reponer
              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "E5E7EB" } },
                font: { bold: true, color: { rgb: "374151" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "medium", color: { rgb: "374151" } },
                  bottom: { style: "thin", color: { rgb: "9CA3AF" } },
                  left: { style: "thin", color: { rgb: "9CA3AF" } },
                  right: { style: "thin", color: { rgb: "9CA3AF" } },
                },
              }
            } else if (col >= 2 && col <= 4) {
              // Betbeder - Azul claro
              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "DBEAFE" } },
                font: { bold: true, color: { rgb: "1E40AF" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "medium", color: { rgb: "1E40AF" } },
                  bottom: { style: "thin", color: { rgb: "3B82F6" } },
                  left: { style: "thin", color: { rgb: "3B82F6" } },
                  right: { style: "thin", color: { rgb: "3B82F6" } },
                },
              }
            } else if (col >= 5 && col <= 7) {
              // Iseas - Verde claro
              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "D1FAE5" } },
                font: { bold: true, color: { rgb: "065F46" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "medium", color: { rgb: "065F46" } },
                  bottom: { style: "thin", color: { rgb: "10B981" } },
                  left: { style: "thin", color: { rgb: "10B981" } },
                  right: { style: "thin", color: { rgb: "10B981" } },
                },
              }
            } else if (col >= 8 && col <= 10) {
              // Llerena - Naranja claro
              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "FED7AA" } },
                font: { bold: true, color: { rgb: "9A3412" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "medium", color: { rgb: "9A3412" } },
                  bottom: { style: "thin", color: { rgb: "F97316" } },
                  left: { style: "thin", color: { rgb: "F97316" } },
                  right: { style: "thin", color: { rgb: "F97316" } },
                },
              }
            }
          }
          // Estilos para subencabezados (fila 1)
          else if (row === 1) {
            if (col >= 2 && col <= 4) {
              // Betbeder subheaders
              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "DBEAFE" } },
                font: { bold: true, color: { rgb: "1E40AF" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "3B82F6" } },
                  bottom: { style: "medium", color: { rgb: "1E40AF" } },
                  left: { style: "thin", color: { rgb: "3B82F6" } },
                  right: { style: "thin", color: { rgb: "3B82F6" } },
                },
              }
            } else if (col >= 5 && col <= 7) {
              // Iseas subheaders
              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "D1FAE5" } },
                font: { bold: true, color: { rgb: "065F46" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "10B981" } },
                  bottom: { style: "medium", color: { rgb: "065F46" } },
                  left: { style: "thin", color: { rgb: "10B981" } },
                  right: { style: "thin", color: { rgb: "10B981" } },
                },
              }
            } else if (col >= 8 && col <= 10) {
              // Llerena subheaders
              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "FED7AA" } },
                font: { bold: true, color: { rgb: "9A3412" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "F97316" } },
                  bottom: { style: "medium", color: { rgb: "9A3412" } },
                  left: { style: "thin", color: { rgb: "F97316" } },
                  right: { style: "thin", color: { rgb: "F97316" } },
                },
              }
            }
          }
          // Estilos para filas de datos
          else if (row < excelData.length - 1) {
            // Código y Denominación
            if (col <= 1) {
              worksheet[cellAddress].s = {
                alignment: { horizontal: col === 0 ? "center" : "left", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "D1D5DB" } },
                  bottom: { style: "thin", color: { rgb: "D1D5DB" } },
                  left: { style: "thin", color: { rgb: "D1D5DB" } },
                  right: { style: "thin", color: { rgb: "D1D5DB" } },
                },
              }
            }
            // Columnas Betbeder
            else if (col >= 2 && col <= 4) {
              const isStock = col === 2
              const isReponer = col === 4
              const cellValue = worksheet[cellAddress].v

              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "F0F9FF" } },
                font: {
                  color:
                    (isStock && cellValue === 0) || (isReponer && cellValue && cellValue !== "")
                      ? { rgb: "DC2626" }
                      : { rgb: "1E40AF" },
                  bold: (isStock && cellValue === 0) || (isReponer && cellValue && cellValue !== ""),
                },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "3B82F6" } },
                  bottom: { style: "thin", color: { rgb: "3B82F6" } },
                  left: { style: "thin", color: { rgb: "3B82F6" } },
                  right: { style: "thin", color: { rgb: "3B82F6" } },
                },
              }
            }
            // Columnas Iseas
            else if (col >= 5 && col <= 7) {
              const isStock = col === 5
              const isReponer = col === 7
              const cellValue = worksheet[cellAddress].v

              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "F0FDF4" } },
                font: {
                  color:
                    (isStock && cellValue === 0) || (isReponer && cellValue && cellValue !== "")
                      ? { rgb: "DC2626" }
                      : { rgb: "065F46" },
                  bold: (isStock && cellValue === 0) || (isReponer && cellValue && cellValue !== ""),
                },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "10B981" } },
                  bottom: { style: "thin", color: { rgb: "10B981" } },
                  left: { style: "thin", color: { rgb: "10B981" } },
                  right: { style: "thin", color: { rgb: "10B981" } },
                },
              }
            }
            // Columnas Llerena
            else if (col >= 8 && col <= 10) {
              const isStock = col === 8
              const isReponer = col === 10
              const cellValue = worksheet[cellAddress].v

              worksheet[cellAddress].s = {
                fill: { fgColor: { rgb: "FFF7ED" } },
                font: {
                  color:
                    (isStock && cellValue === 0) || (isReponer && cellValue && cellValue !== "")
                      ? { rgb: "DC2626" }
                      : { rgb: "9A3412" },
                  bold: (isStock && cellValue === 0) || (isReponer && cellValue && cellValue !== ""),
                },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "F97316" } },
                  bottom: { style: "thin", color: { rgb: "F97316" } },
                  left: { style: "thin", color: { rgb: "F97316" } },
                  right: { style: "thin", color: { rgb: "F97316" } },
                },
              }
            }
            // Total a Reponer
            else if (col === 11) {
              const cellValue = worksheet[cellAddress].v
              worksheet[cellAddress].s = {
                font: {
                  color: cellValue && cellValue !== "" ? { rgb: "DC2626" } : { rgb: "374151" },
                  bold: cellValue && cellValue !== "",
                },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "D1D5DB" } },
                  bottom: { style: "thin", color: { rgb: "D1D5DB" } },
                  left: { style: "thin", color: { rgb: "D1D5DB" } },
                  right: { style: "thin", color: { rgb: "D1D5DB" } },
                },
              }
            }
          }
          // Fila de totales (última fila)
          else {
            worksheet[cellAddress].s = {
              fill: { fgColor: { rgb: "F3F4F6" } },
              font: { bold: true, color: { rgb: "DC2626" } },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "medium", color: { rgb: "374151" } },
                bottom: { style: "medium", color: { rgb: "374151" } },
                left: { style: "thin", color: { rgb: "9CA3AF" } },
                right: { style: "thin", color: { rgb: "9CA3AF" } },
              },
            }
          }
        }
      }

      // Agregar el worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reposición de Stock")

      // Generar el archivo como buffer con encoding correcto
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        bookSST: false,
        compression: true,
      })

      // Crear blob y descargar
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const date = new Date()
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`

      link.href = url
      link.download = `reposicion_stock_${formattedDate}.xlsx`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar el URL del objeto
      URL.revokeObjectURL(url)

      alert(`Excel exportado correctamente con ${filteredData.length} productos`)
    } catch (error) {
      console.error("Error al exportar Excel:", error)
      alert("Error al exportar el archivo Excel")
    }
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
