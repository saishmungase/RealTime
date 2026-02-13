import { motion, Variants } from "framer-motion"
import { Code2, Users, Zap, Globe, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Landing() {
  const [roomCount, setRoomCount] = useState(-1);
  const navigate = useNavigate();
  useEffect(() => {
    pingBackend();
  }, []); 

  const words = ["Total", roomCount.toString(), "Rooms", "Generated"];

  const blurInUp: Variants = {
    hidden: { opacity: 0, y: 10, filter: "blur(8px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  const pingBackend = async () => {
      const response = await fetch("https://realtime-x8ey.onrender.com/health");
      const data = await response.json();
      setRoomCount(data.count)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-400/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-8 shadow-lg"
            >
              <Code2 className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
              CodeSync
            </h1>
            {roomCount !== -1 && (
              <div className="flex justify-center gap-2 text-xl md:text-xl font-medium text-gray-600 mt-8">
                {words.map((word, i) => (
                  <motion.h3
                    key={i}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={blurInUp}
                    className={`${
                      i === 1
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700"
                        : ""
                    }`}
                  >
                    {word}
                  </motion.h3>
                ))}
              </div>
            )}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Real-time collaborative coding made simple. Create rooms, invite friends, and code together in perfect
              harmony.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={()=>{
                  navigate("/room")
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Create New Room
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose CodeSync?</h2>
          <p className="text-xl text-gray-600">Experience the future of collaborative coding</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Real-time Collaboration",
              description: "Code together with multiple developers in real-time. See changes instantly as they happen.",
              color: "from-blue-500 to-blue-600",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "No setup required. Create a room and start coding immediately. Zero configuration needed.",
              color: "from-blue-400 to-blue-500",
            },
            {
              icon: Globe,
              title: "Multi-language Support",
              description: "Support for Python, Java, JavaScript, and many more programming languages.",
              color: "from-blue-600 to-blue-700",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100"
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full mb-6`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create or Join",
                description: "Create a new room or join an existing one with a room ID",
              },
              {
                step: "2",
                title: "Start Coding",
                description: "Choose your programming language and start writing code",
              },
              {
                step: "3",
                title: "Collaborate",
                description: "Invite others to join and code together in real-time",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-2xl font-bold mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Start Coding Together?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of developers already using CodeSync</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate("/room")
            }}
            className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
