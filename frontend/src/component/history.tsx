
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Clock, RotateCcw, Trash2, Code2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface HistoryItem {
  id: string
  roomId: string
  language: string
  createdAt: string
  lastModified: string
  preview: string
}

export default function HistoryPage() {
  const [saveHistory, setSaveHistory] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const navigate = useNavigate();

  useEffect(() => {
    const savedPreference = localStorage.getItem("saveHistory")
    if (savedPreference) {
      setSaveHistory(JSON.parse(savedPreference))
    }

    if (savedPreference === "true") {
      const savedHistory = localStorage.getItem("codingHistory")
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    }
  }, [])

  const handleToggleHistory = (enabled: boolean) => {
    setSaveHistory(enabled)
    localStorage.setItem("saveHistory", JSON.stringify(enabled))

    if (!enabled) {
      localStorage.removeItem("codingHistory")
      setHistory([])
    } else {
      const savedHistory = localStorage.getItem("codingHistory")
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    }
  }

  const handleRegenerateRoom = (roomId: string) => {
    navigate(`/room/${roomId}`)
  }

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("codingHistory", JSON.stringify(updatedHistory))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Coding History
          </h1>
          <p className="text-xl text-gray-600">Manage your saved coding sessions and revisit your work</p>
        </motion.div>

        {/* Toggle Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Save History Locally</h3>
              <p className="text-gray-600">Enable this to save your coding sessions in your browser's local storage</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggleHistory(!saveHistory)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${
                saveHistory ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <motion.span
                animate={{ x: saveHistory ? 32 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg"
              />
            </motion.button>
          </div>
        </motion.div>

        {/* History List */}
        {saveHistory ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            {history.length === 0 ? (
              <div className="text-center py-16">
                <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No History Yet</h3>
                <p className="text-gray-500">Start coding to see your sessions appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {item.language}
                          </span>
                          <span className="text-sm text-gray-500">Room: {item.roomId}</span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <code className="text-sm text-gray-700 font-mono">{item.preview}</code>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {formatDate(item.createdAt)}</span>
                          <span>Modified: {formatDate(item.lastModified)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRegenerateRoom(item.roomId)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Regenerate
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteHistory(item.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center py-16"
          >
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">History Disabled</h3>
            <p className="text-gray-500">Enable history saving to see your coding sessions here</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
