import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Room from './component/room';
import Landing from './component/landing';
import Navbar from "./component/navbar";
import HistoryPage from "./component/history";

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

const AppContent = () => {
  const location = useLocation();
  const showNavbarRoutes = ["/hidden"]; 

  const shouldHideNavbar = showNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<Room />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </>
  );
};

export default App;
