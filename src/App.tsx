import "./bootstrap.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SearchPage } from "./pages/Search";
import Landing from "./pages/Landing";
import VideoContent from "./pages/Video";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/search/:query" element={<SearchPage />} />
        <Route path="/video/:id" element={<VideoContent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
