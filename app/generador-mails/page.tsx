"use client"

import { useState } from "react"
import { Mail, Copy, Trash2, Users, Filter, FileText } from "lucide-react"
import * as XLSX from "xlsx"

interface ContactData {
  name: string
  email: string
  original: string
  isValidDomain: boolean
}

// Dominios válidos permitidos
const VALID_DOMAINS = [
  "@gmail.com",
  "@hotmail.com",
  "@hotmail.es",
  "@yahoo.com",
  "@yahoo.com.ar",
  "@outlook.com",
  "@outlook.es",
]

export default function GeneradorMailsPage() {
  const [inputData, setInputData] = useState("")
  const [processedContacts, setProcessedContacts] = useState<ContactData[]>([])
  const [copySuccess, setCopySuccess] = useState("")
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [invalidEmails, setInvalidEmails] = useState<ContactData[]>([])

  // Función para procesar los datos del Excel
  const processExcelData = () => {
    if (!inputData.trim()) {
      alert("Por favor, pega los datos del Excel.")
      return
    }

    const lines = inputData.trim().split("\n")
    const validContacts: ContactData[] = []
    const invalidContacts: ContactData[] = []
    const emailSet = new Set<string>()

    lines.forEach((line, index) => {
      if (!line.trim()) return

      // Dividir por comas para obtener las partes
      const parts = line.split(",")

      if (parts.length < 2) return

      // El nombre está en la primera posición
      const name = parts[0].trim()
      if (!name) return

      // Buscar el email en las partes (debe contener @)
      let email = ""
      for (const part of parts) {
        const trimmedPart = part.trim()
        if (trimmedPart.includes("@") && trimmedPart.includes(".")) {
          email = trimmedPart
          break
        }
      }

      if (!email) return

      // Normalizar el email
      const normalizedEmail = email.toLowerCase()

      // Verificar si el dominio es válido
      const isValidDomain = VALID_DOMAINS.some((domain) => normalizedEmail.endsWith(domain.toLowerCase()))

      const contact: ContactData = {
        name: name,
        email: email,
        original: line,
        isValidDomain: isValidDomain,
      }

      // Solo agregar si el email no está duplicado
      if (!emailSet.has(normalizedEmail)) {
        emailSet.add(normalizedEmail)

        if (isValidDomain) {
          validContacts.push(contact)
        } else {
          invalidContacts.push(contact)
        }
      }
    })

    setProcessedContacts(validContacts)
    setInvalidEmails(invalidContacts)
  }

  // Función para copiar solo los emails
  const copyEmails = async () => {
    if (processedContacts.length === 0) return

    const emailList = processedContacts.map((contact) => contact.email).join(", ")

    try {
      await navigator.clipboard.writeText(emailList)
      setCopySuccess("emails")
      setTimeout(() => setCopySuccess(""), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
      alert("No se pudo copiar al portapapeles")
    }
  }

  // Función para copiar nombres y emails
  const copyNamesAndEmails = async () => {
    if (processedContacts.length === 0) return

    const contactList = processedContacts.map((contact) => `${contact.name} - ${contact.email}`).join("\n")

    try {
      await navigator.clipboard.writeText(contactList)
      setCopySuccess("contacts")
      setTimeout(() => setCopySuccess(""), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
      alert("No se pudo copiar al portapapeles")
    }
  }

  // Función para copiar en formato para Gmail (separado por comas)
  const copyForGmail = async () => {
    if (processedContacts.length === 0) return

    const gmailFormat = processedContacts.map((contact) => contact.email).join("; ")

    try {
      await navigator.clipboard.writeText(gmailFormat)
      setCopySuccess("gmail")
      setTimeout(() => setCopySuccess(""), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
      alert("No se pudo copiar al portapapeles")
    }
  }

  // Función para limpiar datos
  const clearData = () => {
    setInputData("")
    setProcessedContacts([])
    setCopySuccess("")
    setInvalidEmails([])
  }

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (processedContacts.length === 0) {
      alert("No hay contactos para exportar")
      return
    }

    try {
      // Crear los datos para el Excel - solo emails válidos y sin duplicados
      // processedContacts ya contiene únicamente emails con dominios válidos
      // y los duplicados fueron eliminados durante el procesamiento
      const excelData = processedContacts.map((contact) => ({
        Nombre: contact.name,
        Email: contact.email,
      }))

      // Crear el workbook y worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 30 }, // Nombre
        { wch: 35 }, // Email
      ]
      worksheet["!cols"] = columnWidths

      // Agregar el worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contactos Válidos")

      // Generar el archivo como buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      })

      // Crear blob y descargar
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `contactos-validos-${new Date().toISOString().split("T")[0]}.xlsx`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar el URL del objeto
      URL.revokeObjectURL(url)

      alert(`Se exportaron ${processedContacts.length} contactos válidos sin duplicados`)
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      alert("Error al exportar el archivo Excel")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Generador de Mails</h1>

      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">Instrucciones:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Copia y pega los datos del Excel tal como están (con todas las comas).</li>
            <li>La herramienta extraerá automáticamente los nombres y emails.</li>
            <li>Se eliminarán los emails duplicados automáticamente.</li>
            <li>Los números de teléfono serán ignorados.</li>
            <li>Solo se procesarán emails de dominios conocidos: Gmail, Hotmail, Yahoo, Outlook.</li>
            <li>Los emails con otros dominios aparecerán en una sección separada.</li>
            <li>Usa los botones de copia para obtener los resultados en diferentes formatos.</li>
          </ol>
        </div>

        {/* Área de entrada de datos */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Datos del Excel</h2>
          <textarea
            className="textarea-field h-60"
            placeholder="Pega aquí los datos del Excel tal como están...&#10;&#10;Ejemplo:&#10;Angel Agustin Marinaro fuentes,,,,,,,,,,,,,,,,,,,,,,,,,,,,agustinmarinaro@gmail.com,,,,(381) 547-8311&#10;Esmir ivan Luján,,,,,,,,,,,,,,,,,,,,,,,,,,,,nataliaveronica14@gmail.com,,,,2664616265"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          />

          <div className="flex gap-2 mt-4">
            <button onClick={processExcelData} className="btn-primary flex items-center gap-2">
              <Mail size={16} />
              Procesar Datos
            </button>
            <button onClick={clearData} className="btn-danger flex items-center gap-2">
              <Trash2 size={16} />
              Limpiar
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {(processedContacts.length > 0 || invalidEmails.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <Users className="text-green-500" size={20} />
                <h3 className="font-semibold">Emails Válidos</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">{processedContacts.length}</p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <Mail className="text-red-500" size={20} />
                <h3 className="font-semibold">Emails Inválidos</h3>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-2">{invalidEmails.length}</p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <Filter className="text-blue-500" size={20} />
                <h3 className="font-semibold">Total Procesados</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">{processedContacts.length + invalidEmails.length}</p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <Filter className="text-purple-500" size={20} />
                <h3 className="font-semibold">Sin Duplicados</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">✓</p>
            </div>
          </div>
        )}

        {/* Botones de copia */}
        {processedContacts.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Opciones de Copia</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={copyEmails}
                className={`${copySuccess === "emails" ? "bg-green-600" : "bg-blue-500"} hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2`}
              >
                <Copy size={16} />
                {copySuccess === "emails" ? "¡Emails Copiados!" : "Copiar Solo Emails"}
              </button>

              <button
                onClick={copyForGmail}
                className={`${copySuccess === "gmail" ? "bg-green-600" : "bg-red-500"} hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2`}
              >
                <Mail size={16} />
                {copySuccess === "gmail" ? "¡Formato Gmail Copiado!" : "Copiar para Gmail"}
              </button>

              <button
                onClick={copyNamesAndEmails}
                className={`${copySuccess === "contacts" ? "bg-green-600" : "bg-purple-500"} hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2`}
              >
                <Users size={16} />
                {copySuccess === "contacts" ? "¡Contactos Copiados!" : "Copiar Nombres y Emails"}
              </button>
              <button
                onClick={exportToExcel}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <FileText size={16} />
                Exportar a Excel
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Solo Emails:</strong> Lista separada por comas para usar en cualquier cliente de email
              </p>
              <p>
                <strong>Para Gmail:</strong> Formato optimizado para pegar directamente en el campo "Para" de Gmail
              </p>
              <p>
                <strong>Nombres y Emails:</strong> Lista completa con nombres y emails para referencia
              </p>
            </div>
          </div>
        )}

        {/* Resultados */}
        {processedContacts.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Contactos Procesados</h2>
              <button onClick={() => setShowDuplicates(!showDuplicates)} className="btn-secondary text-sm">
                {showDuplicates ? "Ocultar Detalles" : "Mostrar Detalles"}
              </button>
            </div>

            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
              {processedContacts.map((contact, index) => (
                <div key={index} className="mb-3 p-3 bg-white rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800">{contact.name}</div>
                      <div className="text-blue-600">{contact.email}</div>
                    </div>
                  </div>
                  {showDuplicates && (
                    <div className="mt-2 text-xs text-gray-500 font-mono">
                      Original: {contact.original.substring(0, 100)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emails Inválidos */}
        {invalidEmails.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Emails con Dominios No Válidos ({invalidEmails.length})
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-sm text-red-700">
                <strong>Dominios válidos:</strong> {VALID_DOMAINS.join(", ")}
              </p>
            </div>
            <div className="bg-gray-50 rounded-md p-4 max-h-60 overflow-y-auto">
              {invalidEmails.map((contact, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded border border-red-200">
                  <div className="font-medium text-gray-800">{contact.name}</div>
                  <div className="text-red-600">{contact.email}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vista previa de emails para copiar */}
        {processedContacts.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Vista Previa - Lista de Emails</h2>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-sm font-mono break-all">
                {processedContacts.map((contact) => contact.email).join(", ")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
