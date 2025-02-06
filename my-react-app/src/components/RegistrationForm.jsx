import { useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { toast } from "react-toastify"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const RegistrationForm = ({ setIsRegistered, onRegister }) => {
  const [projectName, setProjectName] = useState("")
  const [stallNo, setStallNo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({
    stallNo: ''
  })

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      stallNo: ''
    }

    // Validate stall number
    if (!stallNo.trim()) {
      newErrors.stallNo = 'Stall number is required'
      isValid = false
    }

    // Validate project name
    if (!projectName.trim()) {
      toast.error("Project name is required")
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        projectName: projectName.trim(),
        stallNo: stallNo.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        localStorage.setItem('stallNo', stallNo.trim())
        onRegister(stallNo.trim())
        console.log("Registration successful with stall number:", stallNo)
        toast.success("Registration successful! Redirecting to image generation...")
        setIsRegistered(true)
      }
    } catch (error) {
      console.error("Registration error:", error)
      if (error.response?.status === 400) {
        if (error.response.data.detail.includes("stall")) {
          setErrors(prev => ({ ...prev, stallNo: error.response.data.detail }))
          toast.error("This stall number is already registered")
        } else {
          toast.error(error.response.data.detail)
        }
      } else if (error.response?.status === 422) {
        toast.error("Please fill in all required fields correctly")
      } else {
        toast.error("Registration failed. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
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
        <h2 className="text-3xl font-bold mb-6 text-center">Register for the Competition</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-sm font-medium mb-2">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isSubmitting}
              placeholder="Enter your project name"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="stallNo" className="block text-sm font-medium mb-2">
              Stall Number
            </label>
            <input
              type="text"
              id="stallNo"
              value={stallNo}
              onChange={(e) => {
                setStallNo(e.target.value)
                setErrors(prev => ({ ...prev, stallNo: '' }))
              }}
              className={`w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.stallNo ? 'border-red-500 border-2' : ''
              }`}
              required
              disabled={isSubmitting}
              placeholder="Enter your stall number"
            />
            {errors.stallNo && (
              <p className="text-red-500 text-sm mt-1">{errors.stallNo}</p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Registering...
              </div>
            ) : (
              "Register"
            )}
          </motion.button>
        </form>
      </div>
    </motion.section>
  )
}

export default RegistrationForm

