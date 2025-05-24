import "./bootstrap.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SearchPage } from "./pages/Search";
import Landing from "./pages/Landing";
import VideoContent from "./pages/Video";
import ViewShowsPage from "./pages/Shows/ViewShowsPage";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import CreateShowPage from "./pages/Shows/CreateShowPage";
import ShowDetailsPage from "./pages/Shows/ShowDetailsPage";

const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/search/:query" element={<SearchPage />} />
          <Route path="/video/:id" element={<VideoContent />} />
          <Route path="/shows" element={<ViewShowsPage />} />
          <Route path="/shows/create" element={<CreateShowPage />} />
          <Route path="/shows/:id" element={<ShowDetailsPage />} />

        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
