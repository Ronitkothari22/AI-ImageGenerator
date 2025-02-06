import { useState, useRef, useEffect } from "react"
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
  const [generatedImage, setGeneratedImage] = useState(null)
  const [prompt, setPrompt] = useState("")
  const [stallNo, setStallNo] = useState("")

  useEffect(() => {
    // Check for stored stallNo on component mount
    const storedStallNo = localStorage.getItem('stallNo')
    if (storedStallNo) {
      setStallNo(storedStallNo)
      setIsRegistered(true)
    }
  }, [])

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
      {!isRegistered && (
        <div id="registration">
          <RegistrationForm 
            setIsRegistered={setIsRegistered} 
            onRegister={(registeredStallNo) => setStallNo(registeredStallNo)}
          />
        </div>
      )}
      {isRegistered && (
        <>
          <div id="image-generation">
            <ImageGenerationSection 
              setGeneratedImage={setGeneratedImage} 
              setPrompt={setPrompt}
              hasGeneratedImage={Boolean(generatedImage)}
              stallNo={stallNo}
            />
          </div>
          {generatedImage && <ResultSection imageUrl={generatedImage} />}
        </>
      )}
      <ToastContainer position="bottom-right" theme="dark" />
    </motion.div>
  )
}

export default App

