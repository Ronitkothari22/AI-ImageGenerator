import { motion } from "framer-motion"
import { FaDownload, FaShareAlt } from "react-icons/fa"

const ResultSection = ({ imageUrl }) => {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = "ai-generated-image.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My AI-Generated Image",
        text: "Check out this amazing AI-generated image!",
        url: imageUrl,
      })
    } else {
      alert("Sharing is not supported on this device.")
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-16 px-4"
    >
      <div className="max-w-2xl mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Your AI-Generated Image</h2>
        <motion.div whileHover={{ scale: 1.05 }} className="relative overflow-hidden rounded-lg shadow-xl">
          <img src={imageUrl || "/placeholder.svg"} alt="AI-generated image" className="w-full h-auto" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="mr-4 p-2 bg-purple-500 rounded-full text-white"
            >
              <FaDownload size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 bg-pink-500 rounded-full text-white"
            >
              <FaShareAlt size={24} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default ResultSection

