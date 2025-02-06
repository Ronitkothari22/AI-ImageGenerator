import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const API_URL =
  import.meta.env.VITE_API_URL || "https://makerfest-backend.onrender.com";

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
});

const ImageGenerationSection = ({
  setGeneratedImage,
  setPrompt,
  hasGeneratedImage,
  stallNo,
}) => {
  const [promptText, setPromptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState(3);
  const [totalGenerations, setTotalGenerations] = useState(3);
  const [usedGenerations, setUsedGenerations] = useState(0);
  const navigate = useNavigate();

  console.log("ImageGenerationSection props:", { stallNo, hasGeneratedImage });

  useEffect(() => {
    console.log("stallNo changed:", stallNo);
    if (stallNo) {
      checkRemainingGenerations();
    }
  }, [stallNo]);

  const checkRemainingGenerations = async () => {
    try {
      const response = await axiosInstance.get(`/check-generation-limit/${stallNo}`);
      setRemainingGenerations(response.data.remaining_generations);
      setTotalGenerations(response.data.total_generations);
      setUsedGenerations(response.data.used_generations);
    } catch (error) {
      console.error("Error checking generation limit:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submission details:", {
      promptText: promptText,
      promptTextTrimmed: promptText.trim(),
      stallNo: stallNo,
      stallNoTrimmed: stallNo?.trim(),
      hasStallNo: Boolean(stallNo),
      hasPrompt: Boolean(promptText),
    });

    if (!promptText.trim() || !stallNo) {
      toast.error("Please enter a prompt and ensure stall number is set");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/generate-image', {
        prompt: promptText.trim(),
        stallNo: stallNo.trim(),
      });

      if (response.data.success) {
        setGeneratedImage(response.data.imageUrl);
        setPrompt(promptText);
        setRemainingGenerations(response.data.remainingGenerations);
        setUsedGenerations(
          totalGenerations - response.data.remainingGenerations
        );
        toast.success("Image generated successfully!");
        navigate('/result');
      }
    } catch (error) {
      console.error("Generation error:", error);
      if (error.response?.status === 429) {
        toast.error(
          `This stall has reached the limit of ${totalGenerations} image generations for this competition.`
        );
      } else if (error.response?.status === 422) {
        toast.error(
          "Invalid input. Please check your prompt and stall number."
        );
      } else {
        toast.error(
          error.response?.data?.detail ||
            "Failed to generate image. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8 px-4"
    >
      <div className="max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Generate Your AI Image
        </h2>
        <div className="mb-4 text-center">
          <p className="text-sm font-medium">
            Remaining Generations: {remainingGenerations} of {totalGenerations}
          </p>
          {usedGenerations > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              You have used {usedGenerations} generation
              {usedGenerations !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {remainingGenerations > 0 ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="prompt"
                className="block text-sm font-medium mb-2"
              >
                Enter your prompt
              </label>
              <textarea
                id="prompt"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                required
                disabled={hasGeneratedImage || isLoading}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-300 mb-4"
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

            <p className="text-sm text-gray-300 text-center italic">
              Note: Image generation may take up to 30 seconds. Please wait
              while we create your unique image.
            </p>
          </form>
        ) : (
          <div className="text-center p-4 bg-red-500 bg-opacity-20 rounded-lg">
            <p className="text-lg font-semibold">
              This stall has reached the limit of {totalGenerations} image
              generations for this competition.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default ImageGenerationSection;