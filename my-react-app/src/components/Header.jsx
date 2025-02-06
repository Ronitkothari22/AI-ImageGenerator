import { motion } from "framer-motion"

const Header = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 py-4 relative">
        
        <div className="flex justify-center">
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
          >
            AI Image Generator
          </motion.h1>
        </div>
      </div>
    </motion.header>
  )
}

export default Header

