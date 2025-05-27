"use client"

import { useState } from "react"
import { Copy, Clipboard, RotateCcw } from "lucide-react"

interface PriceList {
  name: string
  percentage: number
  manual: number | null
}

export default function AumentoDescuentoPage() {
  const [costo, setCosto] = useState<number>(0)
  const [redondeoActivo, setRedondeoActivo] = useState(false)
  const [priceLists, setPriceLists] = useState<PriceList[]>([
    { name: "Lista 1", percentage: 5, manual: null },
    { name: "Lista 2", percentage: -12, manual: null },
    { name: "Lista 3", percentage: 15, manual: null },
    { name: "Lista 4", percentage: 22, manual: null },
  ])
  const [copySuccess, setCopySuccess] = useState("")

  const redondeoMultiplo10 = (numero: number) => {
    return Math.round(numero / 10) * 10
  }

  const calcularPrecio = (index: number) => {
    const list = priceLists[index]
    const factor = 1 + list.percentage / 100
    const precioBase = list.manual ?? costo
    const precioCalculado = precioBase * factor
    return redondeoActivo ? redondeoMultiplo10(precioCalculado) : precioCalculado
  }

  const updatePercentage = (index: number, percentage: number) => {
    const newLists = [...priceLists]
    newLists[index].percentage = percentage
    setPriceLists(newLists)
  }

  const updateManual = (index: number, manual: number | null) => {
    const newLists = [...priceLists]
    newLists[index].manual = manual
    setPriceLists(newLists)
  }

  const copyPrice = async (price: number, listName: string) => {
    try {
      await navigator.clipboard.writeText(price.toFixed(2))
      setCopySuccess(listName)
      setTimeout(() => setCopySuccess(""), 1000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  const pastePrice = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setCosto(Number.parseFloat(text) || 0)
    } catch (err) {
      console.error("Error al pegar:", err)
    }
  }

  const limpiarCampo = () => {
    setCosto(0)
    setPriceLists(priceLists.map((list) => ({ ...list, manual: null })))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Precios con Aumento/Descuento</h1>

      <div className="max-w-4xl mx-auto">
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
              <label htmlFor="costo" className="font-medium">
                Costo:
              </label>
              <input
                type="number"
                id="costo"
                className="input-field w-32"
                value={costo || ""}
                onChange={(e) => setCosto(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <button onClick={limpiarCampo} className="btn-danger flex items-center gap-2">
              <RotateCcw size={16} />
              Limpiar
            </button>
            <button onClick={pastePrice} className="btn-secondary flex items-center gap-2">
              <Clipboard size={16} />
              Pegar
            </button>
            <button
              onClick={() => setRedondeoActivo(!redondeoActivo)}
              className={`${redondeoActivo ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-500 hover:bg-gray-600"} text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium`}
            >
              {redondeoActivo ? "Desactivar Redondeo" : "Activar Redondeo"}
            </button>
          </div>
        </div>

        {costo > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Precios para el costo de ${costo.toFixed(2)}</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Listas</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Aum/Desc (%)</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Manual</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Copiar</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {priceLists.map((list, index) => {
                    const precio = calcularPrecio(index)
                    const isPositive = list.percentage >= 0

                    return (
                      <tr key={index} className={isPositive ? "bg-green-50" : "bg-red-50"}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">{list.name}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                            value={list.percentage}
                            min="-50"
                            max="50"
                            step="1"
                            onChange={(e) => updatePercentage(index, Number.parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="number"
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                            placeholder="Manual"
                            value={list.manual || ""}
                            onChange={(e) => updateManual(index, Number.parseFloat(e.target.value) || null)}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <button
                            onClick={() => copyPrice(precio, list.name)}
                            className={`${copySuccess === list.name ? "bg-green-600" : "bg-blue-500"} hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 mx-auto`}
                          >
                            <Copy size={14} />
                            {copySuccess === list.name ? "Copiado" : "Copiar"}
                          </button>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                          ${redondeoActivo ? precio.toFixed(0) : precio.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
