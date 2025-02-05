import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import RegistrationForm from "./components/RegistrationForm"
import ImageGenerationSection from "./components/ImageGenerationSection"
import ResultSection from "./components/ResultSection"

function App() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [generatedImage, setGeneratedImage] = useState("")

  const handleJoinClick = () => {
    window.location.href = '#registration'
  }

  const handleRegistrationSuccess = () => {
    setIsRegistered(true)
    window.location.href = '#image-generation'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white"
    >
      <Header />
      <HeroSection onJoinClick={handleJoinClick} />
      <div id="registration">
        <RegistrationForm setIsRegistered={handleRegistrationSuccess} />
      </div>
      {isRegistered && (
        <div id="image-generation">
          <ImageGenerationSection setGeneratedImage={setGeneratedImage} hasGeneratedImage={!!generatedImage} />
        </div>
      )}
      {generatedImage && <ResultSection imageUrl={generatedImage} />}
      <ToastContainer position="bottom-right" theme="dark" />
    </motion.div>
  )
}

export default App

