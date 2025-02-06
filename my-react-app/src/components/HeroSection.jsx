import { motion } from "framer-motion"

const HeroSection = ({ onJoinClick }) => {
  return (
    <section className="min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="w-full h-full bg-gradient-to-br from-purple-800 via-blue-800 to-black opacity-50"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-20 px-4">
        {/* Logo Section */}
        <motion.img
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          src="public/logo white.png"
          alt="AI Generator Logo"
          className="w-32 h-32 md:w-48 md:h-48 mb-6"
        />

        {/* Title Section */}
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center"
        >
          Join Our Competition
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg md:text-xl mb-6 text-center"
        >
          Unleash your creativity with cutting-edge AI technology
        </motion.p>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onJoinClick}
          className="px-8 py-3 mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Join the Competition
        </motion.button>

        {/* Guidelines Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="w-full max-w-2xl bg-black bg-opacity-40 rounded-lg mb-8"
        >
          {/* Guidelines Header - Fixed */}
          <div className="sticky top-0 bg-black bg-opacity-90 p-4 rounded-t-lg z-20">
            <h2 className="text-2xl font-bold text-purple-400 text-center">
              Guidelines for Participation
            </h2>
          </div>

          {/* Guidelines Content - Scrollable */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
            {/* Theme Section */}
            <div className="bg-black bg-opacity-30 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-pink-400">Theme:</h3>
              <ul className="list-disc pl-5 text-gray-100 space-y-2">
                <li>Create images that capture the essence of Maker Fest Vadodara 2025.</li>
                <li>Include stalls, decorations, projects, and the lively atmosphere of the fest in your creations.</li>
              </ul>
            </div>

            {/* Submission Rules Section */}
            <div className="bg-black bg-opacity-30 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-pink-400">Submission Rules:</h3>
              <ul className="list-disc pl-5 text-gray-100 space-y-2">
                <li>Each stall/maker team can submit up to 3 images only.</li>
                <li>Entries are per team/stall, not individuals. Collaborate with your team for the best submissions!</li>
              </ul>
            </div>

            {/* Judging & Prizes Section */}
            <div className="bg-black bg-opacity-30 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-pink-400">Judging & Prizes:</h3>
              <ul className="list-disc pl-5 text-gray-100">
                <li>Judging criteria will include creativity, relevance to the theme, and originality.</li>
              </ul>
            </div>

            {/* Deadlines Section */}
            <div className="bg-black bg-opacity-30 p-4 rounded-lg">
              <p className="font-semibold text-purple-400">Submission Deadline: <span className="text-gray-100">9th February, 2:00 PM</span></p>
              <p className="font-semibold text-purple-400">Winners Announcement: <span className="text-gray-100">During the Valedictory Function on 9th February evening.</span></p>
            </div>

            {/* How to Submit Section */}
            <div className="bg-black bg-opacity-30 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-pink-400">How to Submit:</h3>
              <p className="text-gray-100">Make sure you enter your correct stall number and project name. Once submitted, these details will not be changed.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection

