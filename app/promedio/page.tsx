"use client"

import { useState } from "react"
import { Calculator, Copy } from "lucide-react"

export default function PromedioPage() {
  const [cantidad1, setCantidad1] = useState<number>(0)
  const [precio1, setPrecio1] = useState<number>(0)
  const [cantidad2, setCantidad2] = useState<number>(0)
  const [precio2, setPrecio2] = useState<number>(0)
  const [resultado, setResultado] = useState<number | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const calcularPromedio = () => {
    if (!cantidad1 || !precio1 || !cantidad2 || !precio2) {
      alert("Por favor, llena todos los campos correctamente.")
      return
    }

    const totalBotellas = cantidad1 + cantidad2
    const promedio = (cantidad1 * precio1 + cantidad2 * precio2) / totalBotellas
    setResultado(promedio)
  }

  const copiarAlPortapapeles = async () => {
    if (resultado === null) return

    try {
      await navigator.clipboard.writeText(resultado.toFixed(2))
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 1000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Calculadora de Precio Promedio</h1>

          <div className="space-y-4">
            <div>
              <label htmlFor="cantidad1" className="block text-sm font-medium mb-1">
                Cantidad de Botellas (Primer Lote):
              </label>
              <input
                type="number"
                id="cantidad1"
                className="input-field"
                placeholder="Ingresa la cantidad del primer lote"
                value={cantidad1 || ""}
                onChange={(e) => setCantidad1(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label htmlFor="precio1" className="block text-sm font-medium mb-1">
                Precio por Botella (Primer Lote):
              </label>
              <input
                type="number"
                id="precio1"
                className="input-field"
                placeholder="Ingresa el precio por botella del primer lote"
                value={precio1 || ""}
                onChange={(e) => setPrecio1(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label htmlFor="cantidad2" className="block text-sm font-medium mb-1">
                Cantidad de Botellas (Segundo Lote):
              </label>
              <input
                type="number"
                id="cantidad2"
                className="input-field"
                placeholder="Ingresa la cantidad del segundo lote"
                value={cantidad2 || ""}
                onChange={(e) => setCantidad2(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label htmlFor="precio2" className="block text-sm font-medium mb-1">
                Precio por Botella (Segundo Lote):
              </label>
              <input
                type="number"
                id="precio2"
                className="input-field"
                placeholder="Ingresa el precio por botella del segundo lote"
                value={precio2 || ""}
                onChange={(e) => setPrecio2(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <button onClick={calcularPromedio} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Calculator size={16} />
              Calcular Promedio
            </button>

            {resultado !== null && (
              <div className="bg-gray-100 p-4 rounded-md text-center">
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  El precio promedio es: ${resultado.toFixed(2)}
                </div>
                <button
                  onClick={copiarAlPortapapeles}
                  className={`${copySuccess ? "bg-green-600" : "bg-blue-500"} hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2 mx-auto`}
                >
                  <Copy size={16} />
                  {copySuccess ? "Copiado" : "Copiar Promedio"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
