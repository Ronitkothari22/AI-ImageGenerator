import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import RegistrationForm from "./components/RegistrationForm"
import ImageGenerationSection from "./components/ImageGenerationSection"
import ResultSection from "./components/ResultSection"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

function App() {
  const [generatedImage, setGeneratedImage] = useState(null)
  const [prompt, setPrompt] = useState("")
  const [stallNo, setStallNo] = useState(localStorage.getItem("stallNo") || "")
  const [isRegistered, setIsRegistered] = useState(!!stallNo)
  const [showRegistration, setShowRegistration] = useState(false)

  useEffect(() => {
    // Check for stored stallNo on component mount
    const storedStallNo = localStorage.getItem('stallNo')
    if (storedStallNo) {
      setStallNo(storedStallNo)
      setIsRegistered(true)
    }
  }, [])

  const handleJoinClick = () => {
    setShowRegistration(true)
  }

  const handleRegistrationSuccess = (newStallNo) => {
    setStallNo(newStallNo)
    setIsRegistered(true)
    setShowRegistration(false)
  }

  return (
    <Router>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white"
      >
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection onJoinClick={handleJoinClick} />
              {showRegistration && !isRegistered && (
                <RegistrationForm 
                  setIsRegistered={setIsRegistered}
                  onRegister={handleRegistrationSuccess}
                />
              )}
              {isRegistered && (
                <ImageGenerationSection
                  setGeneratedImage={setGeneratedImage}
                  setPrompt={setPrompt}
                  hasGeneratedImage={!!generatedImage}
                  stallNo={stallNo}
                />
              )}
            </>
          } />
          <Route path="/result" element={
            <ResultSection imageUrl={generatedImage} />
          } />
          <Route path="/generate" element={
            isRegistered ? (
              <ImageGenerationSection
                setGeneratedImage={setGeneratedImage}
                setPrompt={setPrompt}
                hasGeneratedImage={!!generatedImage}
                stallNo={stallNo}
              />
            ) : (
              <Navigate to="/" />
            )
          } />
        </Routes>
        <ToastContainer position="bottom-right" theme="dark" />
      </motion.div>
    </Router>
  )
}

export default App

