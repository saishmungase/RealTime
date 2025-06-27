import { motion } from "framer-motion";
import { Home, Clock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState("/");

  useEffect(() => {
    if(location.pathname){
        setActivePath(location.pathname);
        return;
    }
    setActivePath("/")

  }, [])

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Clock, path: "/history", label: "History" },
    { icon: Plus, path: "/room", label: "Room" },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6, type: "spring", stiffness: 100 }}
      className="fixed bottom-6 w-full flex justify-center z-50"
    >

      <div className="bg-white/90 backdrop-blur-lg rounded-full px-6 py-3 shadow-2xl border border-blue-100">
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setActivePath(item.path);
                navigate(item.path);
              }}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                activePath === item.path
                  ? "text-white shadow-lg"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {activePath === item.path && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
