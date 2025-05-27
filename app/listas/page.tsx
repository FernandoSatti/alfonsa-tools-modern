"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Copy, Trash2, FileText, Upload, File } from "lucide-react"

// Definir las categorías con emojis
const categories = {
  ALMACEN: "📦",
  "ACEITES Y VINAGRES": "🫒",
  ARROZ: "🍚",
  BEBIDAS: "🥂",
  CIGARRILLOS: "🚬",
  FIDEOS: "🍜",
  HARINAS: "🌾",
  REPOSTERIA: "🍰",
  "YERBAS E INFUSIONES": "🌿",
  "APERITIVOS Y CACHACAS": "🍹",
  CERVEZAS: "🍻",
  "CHAMPAGNE & ESPUMANTES": "🍾",
  DESTILADOS: "🥃",
  ENERGIZANTES: "⚡",
  "GASEOSAS, JUGOS Y AGUAS": "🥤",
  GRAPAS: "🍇",
  LICORES: "🥃",
  "MINIATURAS Y PETACAS": "✨",
  SIDRAS: "🍏",
  COMIDAS: "🍴",
  "CRISTALERIA Y MAS": "🫗",
  "ESTUCHERIA Y GIFTPACK": "📦",
  PULPAS: "🐙",
  VINOS: "🍷",
}

// Subcategorías de vinos a filtrar
const wineSubcategories = [
  "ANCELLOTTA",
  "BLANCOS",
  "BLEND BLANCOS",
  "BLEND TINTOS",
  "BONARDA",
  "CABERNET FRANC",
  "CABERNET SAUVIGNON",
  "CHARDONNAY",
  "CHENNIN Y CHENNIN CHARD",
  "DULCES",
  "MAGNUM",
  "MALBEC",
  "MALBEC ROSE",
  "PETIT VERDOT",
  "ROSADOS",
  "SAUVIGNON BLANC",
  "TEMPRANILLO",
  "TINTOS",
  "TORRONTES Y TORR DULCE",
  "VARIOS",
]

interface FileData {
  name: string
  data: string[]
  itemCount: number
}

export default function ListasPage() {
  const [excelData1, setExcelData1] = useState<FileData | null>(null)
  const [excelData2, setExcelData2] = useState<FileData | null>(null)
  const [formattedList, setFormattedList] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [dragOver1, setDragOver1] = useState(false)
  const [dragOver2, setDragOver2] = useState(false)

  const fileInput1Ref = useRef<HTMLInputElement>(null)
  const fileInput2Ref = useRef<HTMLInputElement>(null)

  // Función para verificar si es un título de subcategoría de vinos
  const isWineSubcategoryTitle = (text: string) => {
    const upperText = text.toUpperCase().trim()
    return wineSubcategories.some((subcategory) => upperText === subcategory.toUpperCase())
  }

  // Función para extraer datos de Excel simulado (en un entorno real usarías una librería como xlsx)
  const extractDataFromText = (text: string): string[] => {
    const lines = text.split("\n")
    const data: string[] = []

    lines.forEach((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine && !isWineSubcategoryTitle(trimmedLine)) {
        data.push(trimmedLine)
      }
    })

    return data
  }

  // Función para extraer el nombre del producto (sin precio)
  const extractProductName = (line: string) => {
    const lastDollarIndex = line.lastIndexOf("$")
    if (lastDollarIndex !== -1) {
      return line.substring(0, lastDollarIndex).trim()
    }
    return line.trim()
  }

  // Función para formatear lista de productos
  const formatProductList = (text: string) => {
    const lines = text.split("\n")
    let formattedList = ""
    let currentCategory = ""
    let currentCategoryProducts: string[] = []
    let isInWinesSection = false

    lines.forEach((line) => {
      const trimmedLine = line.replace(/\s+/g, " ").trim()

      // Verificar si la línea es una categoría
      let isCategoryLine = false
      for (const category in categories) {
        if (trimmedLine.toUpperCase().startsWith(category) && currentCategory !== category) {
          // Si estábamos en la sección de vinos, ordenar los productos antes de continuar
          if (isInWinesSection && currentCategoryProducts.length > 0) {
            currentCategoryProducts.sort((a, b) => {
              const nameA = extractProductName(a).toUpperCase()
              const nameB = extractProductName(b).toUpperCase()
              return nameA.localeCompare(nameB)
            })
            currentCategoryProducts.forEach((product) => {
              formattedList += `${product}\n`
            })
            currentCategoryProducts = []
          }

          // Agregar categoría con emoji
          if (
            category === "ACEITES Y VINAGRES" ||
            category === "ARROZ" ||
            category === "CIGARRILLOS" ||
            category === "FIDEOS" ||
            category === "HARINAS" ||
            category === "REPOSTERIA" ||
            category === "YERBAS E INFUSIONES"
          ) {
            formattedList += `\n${categories[category as keyof typeof categories]} ${category.toUpperCase()}\n\n`
          } else {
            formattedList += `\n${categories[category as keyof typeof categories]} ${category.toUpperCase()}\n\n`
          }

          currentCategory = category
          isInWinesSection = category === "VINOS"
          isCategoryLine = true
          return
        }
      }

      // Si no es una línea de categoría, procesar como producto
      if (!isCategoryLine && trimmedLine !== "") {
        if (isInWinesSection) {
          currentCategoryProducts.push(trimmedLine)
        } else {
          formattedList += `${trimmedLine}\n`
        }
      }
    })

    // Si terminamos y estábamos en la sección de vinos, ordenar los productos finales
    if (isInWinesSection && currentCategoryProducts.length > 0) {
      currentCategoryProducts.sort((a, b) => {
        const nameA = extractProductName(a).toUpperCase()
        const nameB = extractProductName(b).toUpperCase()
        return nameA.localeCompare(nameB)
      })
      currentCategoryProducts.forEach((product) => {
        formattedList += `${product}\n`
      })
    }

    return formattedList.trim()
  }

  // Función para comparar listas de productos
  const compareProductLists = (list1: string, list2: string) => {
    const list1Lines = list1.split("\n").map((line) => line.replace(/\s+/g, " ").trim())
    const list2Lines = list2.split("\n").map((line) => line.replace(/\s+/g, " ").trim())

    // Crear un mapa de productos de la lista 1 para comparación rápida
    const list1Products = new Map()
    list1Lines.forEach((line) => {
      const productName = extractProductName(line)
      if (productName && !categories[productName.toUpperCase() as keyof typeof categories]) {
        list1Products.set(productName.toUpperCase(), line)
      }
    })

    let formattedList = ""
    let currentCategory = ""
    let currentCategoryProducts: string[] = []
    let isInWinesSection = false

    list2Lines.forEach((line) => {
      const trimmedLine = line.replace(/\s+/g, " ").trim()

      // Verificar si la línea es una categoría
      let isCategoryLine = false
      for (const category in categories) {
        if (trimmedLine.toUpperCase().startsWith(category) && currentCategory !== category) {
          // Si estábamos en la sección de vinos, ordenar los productos antes de continuar
          if (isInWinesSection && currentCategoryProducts.length > 0) {
            currentCategoryProducts.sort((a, b) => {
              const nameA = extractProductName(a).toUpperCase()
              const nameB = extractProductName(b).toUpperCase()
              return nameA.localeCompare(nameB)
            })
            currentCategoryProducts.forEach((product) => {
              formattedList += `${product}\n`
            })
            currentCategoryProducts = []
          }

          // Agregar categoría con emoji
          if (
            category === "ACEITES Y VINAGRES" ||
            category === "ARROZ" ||
            category === "CIGARRILLOS" ||
            category === "FIDEOS" ||
            category === "HARINAS" ||
            category === "REPOSTERIA" ||
            category === "YERBAS E INFUSIONES"
          ) {
            formattedList += `\n${categories[category as keyof typeof categories]} ${category.toUpperCase()}\n\n`
          } else {
            formattedList += `\n${categories[category as keyof typeof categories]} ${category.toUpperCase()}\n\n`
          }

          currentCategory = category
          isInWinesSection = category === "VINOS"
          isCategoryLine = true
          return
        }
      }

      // Si no es una línea de categoría, procesar como producto
      if (!isCategoryLine && trimmedLine !== "") {
        const productName = extractProductName(trimmedLine)
        let isNew = true

        // Verificar si el producto existe en la lista 1
        if (productName && list1Products.has(productName.toUpperCase())) {
          isNew = false
        }

        // Preparar la línea final
        const finalLine = isNew ? `${trimmedLine} 🆕` : trimmedLine

        // Si estamos en la sección de vinos, acumular para ordenar después
        if (isInWinesSection) {
          currentCategoryProducts.push(finalLine)
        } else {
          formattedList += `${finalLine}\n`
        }
      }
    })

    // Si terminamos y estábamos en la sección de vinos, ordenar los productos finales
    if (isInWinesSection && currentCategoryProducts.length > 0) {
      currentCategoryProducts.sort((a, b) => {
        const nameA = extractProductName(a.replace(" 🆕", "")).toUpperCase()
        const nameB = extractProductName(b.replace(" 🆕", "")).toUpperCase()
        return nameA.localeCompare(nameB)
      })
      currentCategoryProducts.forEach((product) => {
        formattedList += `${product}\n`
      })
    }

    return formattedList.trim()
  }

  // Manejar archivos (simulado - en producción usarías una librería como xlsx)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, fileType: "excel1" | "excel2") => {
    const file = event.target.files?.[0]
    if (file) {
      // En un entorno real, aquí procesarías el archivo Excel
      // Por ahora, simulamos con texto de ejemplo
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const extractedData = extractDataFromText(text)
        const fileData: FileData = {
          name: file.name,
          data: extractedData,
          itemCount: extractedData.length,
        }

        if (fileType === "excel1") {
          setExcelData1(fileData)
        } else {
          setExcelData2(fileData)
        }
      }
      reader.readAsText(file)
    }
  }

  // Manejar drag & drop
  const handleDrop = (event: React.DragEvent, fileType: "excel1" | "excel2") => {
    event.preventDefault()
    if (fileType === "excel1") {
      setDragOver1(false)
    } else {
      setDragOver2(false)
    }

    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.type.includes("sheet")) {
        // Simular procesamiento del archivo
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          const extractedData = extractDataFromText(text)
          const fileData: FileData = {
            name: file.name,
            data: extractedData,
            itemCount: extractedData.length,
          }

          if (fileType === "excel1") {
            setExcelData1(fileData)
          } else {
            setExcelData2(fileData)
          }
        }
        reader.readAsText(file)
      } else {
        alert("Por favor, selecciona un archivo Excel válido (.xlsx o .xls)")
      }
    }
  }

  const handleDragOver = (event: React.DragEvent, fileType: "excel1" | "excel2") => {
    event.preventDefault()
    if (fileType === "excel1") {
      setDragOver1(true)
    } else {
      setDragOver2(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent, fileType: "excel1" | "excel2") => {
    event.preventDefault()
    if (fileType === "excel1") {
      setDragOver1(false)
    } else {
      setDragOver2(false)
    }
  }

  const processExcelFiles = () => {
    if (!excelData1) {
      alert("Por favor, carga al menos el archivo Excel antiguo")
      return
    }

    const textData1 = excelData1.data.join("\n")

    let formattedText: string
    if (excelData2) {
      const textData2 = excelData2.data.join("\n")
      formattedText = compareProductLists(textData1, textData2)
    } else {
      formattedText = formatProductList(textData1)
    }

    setFormattedList(formattedText)
  }

  const clearExcelFiles = () => {
    setExcelData1(null)
    setExcelData2(null)
    setFormattedList("")
    if (fileInput1Ref.current) fileInput1Ref.current.value = ""
    if (fileInput2Ref.current) fileInput2Ref.current.value = ""
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedList)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 1000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Generador de Listas Excel</h1>

      <div className="space-y-6">
        {/* Excel Antiguo */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Excel Antiguo:</h2>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              dragOver1
                ? "border-green-500 bg-green-50"
                : "border-blue-500 bg-blue-50 hover:border-blue-600 hover:bg-blue-100"
            }`}
            onClick={() => fileInput1Ref.current?.click()}
            onDrop={(e) => handleDrop(e, "excel1")}
            onDragOver={(e) => handleDragOver(e, "excel1")}
            onDragLeave={(e) => handleDragLeave(e, "excel1")}
          >
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-700 mb-2">
              Arrastra tu archivo Excel aquí o haz clic para seleccionar
            </div>
            <div className="text-sm text-gray-500">Se leerán las columnas B y E de todo el archivo</div>
            <input
              ref={fileInput1Ref}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "excel1")}
            />
          </div>
          {excelData1 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-blue-600" />
                <strong>Archivo cargado:</strong> {excelData1.name}
              </div>
              <div>
                <strong>Productos encontrados:</strong> {excelData1.itemCount}
              </div>
            </div>
          )}
        </div>

        {/* Excel Nuevo */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Excel Nuevo (opcional, para comparar):</h2>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              dragOver2
                ? "border-green-500 bg-green-50"
                : "border-blue-500 bg-blue-50 hover:border-blue-600 hover:bg-blue-100"
            }`}
            onClick={() => fileInput2Ref.current?.click()}
            onDrop={(e) => handleDrop(e, "excel2")}
            onDragOver={(e) => handleDragOver(e, "excel2")}
            onDragLeave={(e) => handleDragLeave(e, "excel2")}
          >
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-700 mb-2">
              Arrastra tu archivo Excel aquí o haz clic para seleccionar
            </div>
            <div className="text-sm text-gray-500">Se leerán las columnas B y E de todo el archivo</div>
            <input
              ref={fileInput2Ref}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "excel2")}
            />
          </div>
          {excelData2 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-blue-600" />
                <strong>Archivo cargado:</strong> {excelData2.name}
              </div>
              <div>
                <strong>Productos encontrados:</strong> {excelData2.itemCount}
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-wrap gap-4">
          <button onClick={processExcelFiles} className="btn-primary flex items-center gap-2">
            <FileText size={16} />
            Procesar Archivos Excel
          </button>
          <button onClick={clearExcelFiles} className="btn-danger flex items-center gap-2">
            <Trash2 size={16} />
            Borrar Archivos
          </button>
          <button
            onClick={copyToClipboard}
            className={`${copySuccess ? "bg-green-600" : "bg-blue-500"} hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2`}
          >
            <Copy size={16} />
            {copySuccess ? "Copiado" : "Copiar Lista"}
          </button>
        </div>

        {/* Lista Formateada */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Lista Formateada:</h2>
          <div className="bg-gray-100 p-4 rounded-md min-h-40 whitespace-pre-wrap font-mono text-sm">
            {formattedList || "La lista formateada aparecerá aquí..."}
          </div>
        </div>
      </div>
    </div>
  )
}
