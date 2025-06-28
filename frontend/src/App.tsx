import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Landing from './component/landing';
import Navbar from "./component/navbar";
import HistoryPage from "./component/history";
import Room from "./component/room";
import { Analytics } from "@vercel/analytics/react"


const App = () => {
  return (
    <BrowserRouter>
      <Analytics />
      <AppContent />
    </BrowserRouter>
  );
};

const AppContent = () => {
  const location = useLocation();
  const showNavbarRoutes = ["/room"]; 

  const shouldHideNavbar = showNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room" element={<Room />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </>
  );
};

export default App;
