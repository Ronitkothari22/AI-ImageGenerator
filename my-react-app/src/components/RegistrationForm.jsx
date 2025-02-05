import { useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { toast } from "react-toastify"

const RegistrationForm = ({ setIsRegistered }) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [stallNo, setStallNo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await axios.post("http://localhost:8000/api/register", {
        name,
        email,
        stallNo
      })

      if (response.data.success) {
        toast.success("Registration successful!")
        // Small delay before redirecting to ensure toast is visible
        setTimeout(() => {
          setIsRegistered(true)
        }, 1500)
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.response?.data?.detail || "Registration failed. Please try again.")
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
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="stallNo" className="block text-sm font-medium mb-2">
              Stall Number
            </label>
            <input
              type="text"
              id="stallNo"
              value={stallNo}
              onChange={(e) => setStallNo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isSubmitting}
            />
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

