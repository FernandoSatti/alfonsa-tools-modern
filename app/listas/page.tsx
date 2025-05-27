"use client"

import { useState } from "react"
import { Copy, Trash2, FileText } from "lucide-react"

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

export default function ListasPage() {
  const [list1, setList1] = useState("")
  const [list2, setList2] = useState("")
  const [formattedList, setFormattedList] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)

  const formatProductList = (text: string) => {
    const lines = text.split("\n")
    let formattedList = ""
    let currentCategory = ""

    lines.forEach((line) => {
      const trimmedLine = line.replace(/\s+/g, " ").trim()

      // Check if line is a category
      for (const category in categories) {
        if (trimmedLine.toUpperCase().startsWith(category) && currentCategory !== category) {
          formattedList += `\n${categories[category as keyof typeof categories]} ${category.toUpperCase()}\n\n`
          currentCategory = category
          return
        }
      }

      // Add product line
      if (trimmedLine !== "") {
        formattedList += `${trimmedLine}\n`
      }
    })

    return formattedList.trim()
  }

  const compareProductLists = (oldList: string, newList: string) => {
    const oldLines = oldList.split("\n").map((line) => line.replace(/\s+/g, " ").trim())
    const newLines = newList.split("\n").map((line) => line.replace(/\s+/g, " ").trim())

    let formattedList = ""
    let currentCategory = ""

    newLines.forEach((line) => {
      const trimmedLine = line.replace(/\s+/g, " ").trim()
      let isNew = true

      // Check if line is a category
      for (const category in categories) {
        if (trimmedLine.toUpperCase().startsWith(category) && currentCategory !== category) {
          formattedList += `\n${categories[category as keyof typeof categories]} ${category.toUpperCase()}\n\n`
          currentCategory = category
          return
        }
      }

      // Compare with old list
      oldLines.forEach((item) => {
        const productFromOld = item.split(/\d/)[0].trim()
        const productFromNew = trimmedLine.split(/\d/)[0].trim()

        if (productFromOld === productFromNew) {
          isNew = false
        }
      })

      // Mark new products
      if (isNew && trimmedLine !== "") {
        formattedList += `${trimmedLine} 🆕\n`
      } else if (trimmedLine !== "") {
        formattedList += `${trimmedLine}\n`
      }
    })

    return formattedList.trim()
  }

  const generateList = () => {
    const formatted = formatProductList(list1)
    setFormattedList(formatted)
  }

  const compareLists = () => {
    if (!list2) {
      generateList()
    } else {
      const compared = compareProductLists(list1, list2)
      setFormattedList(compared)
    }
  }

  const clearLists = () => {
    setList1("")
    setList2("")
    setFormattedList("")
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
      <h1 className="text-3xl font-bold text-center mb-8">Generador de Listas</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Lista 1 antigua:</h2>
          <textarea
            className="textarea-field h-40"
            placeholder="Pega tu lista aquí...(puede ser la nueva sin comparar)"
            value={list1}
            onChange={(e) => setList1(e.target.value)}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Lista 2 nueva (opcional, para comparar):</h2>
          <textarea
            className="textarea-field h-40"
            placeholder="Pega la lista nueva aquí si quieres comparar con la anterior (opcional)..."
            value={list2}
            onChange={(e) => setList2(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <button onClick={generateList} className="btn-primary flex items-center gap-2">
            <FileText size={16} />
            Generar Lista
          </button>
          <button onClick={compareLists} className="btn-secondary flex items-center gap-2">
            <FileText size={16} />
            Comparar y Generar Lista
          </button>
          <button onClick={clearLists} className="btn-danger flex items-center gap-2">
            <Trash2 size={16} />
            Borrar Listas
          </button>
          <button
            onClick={copyToClipboard}
            className={`${copySuccess ? "bg-green-600" : "bg-blue-500"} hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2`}
          >
            <Copy size={16} />
            {copySuccess ? "Copiado" : "Copiar Lista"}
          </button>
        </div>

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
