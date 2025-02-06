import { useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { toast } from "react-toastify"

const ImageGenerationSection = ({ setGeneratedImage, setPrompt, hasGeneratedImage }) => {
  const [promptText, setPromptText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post("http://localhost:8000/generate-image", { prompt: promptText })
      if (response.data.success) {
        setGeneratedImage(response.data.imageUrl)
        setPrompt(promptText)
        toast.success("Image generated successfully!")
      }
    } catch (error) {
      console.error("Generation error:", error)
      toast.error(error.response?.data?.detail || "Failed to generate image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-16 px-4"
    >
      <div className="max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Generate Your AI Image</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Enter your prompt
            </label>
            <textarea
              id="prompt"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              required
              disabled={hasGeneratedImage}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-300"
            disabled={isLoading || hasGeneratedImage}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Generating...
              </div>
            ) : (
              "Generate Image"
            )}
          </motion.button>
        </form>
      </div>
    </motion.section>
  )
}

export default ImageGenerationSection

