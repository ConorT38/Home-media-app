import "./bootstrap.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SearchPage } from "./pages/Search";
import Landing from "./pages/Landing";
import VideoContent from "./pages/Video";
import ViewShowsPage from "./pages/Shows/ViewShowsPage";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import CreateShowPage from "./pages/Shows/CreateShowPage";
import ShowDetailsPage from "./pages/Shows/ShowDetailsPage";
import SearchTorrentsPage from "./pages/Torrents/SearchTorrentsPage";
import { QueryClientProvider } from "react-query";
import queryClient from "./hooks/queryClient";
import ErrorPage from "./pages/ErrorPage";
import MyTorrentsPage from "./pages/Torrents/MyTorrentsPage";

const App: React.FC = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NavigationBar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/search/:query" element={<SearchPage />} />
            <Route path="/video/:id" element={<VideoContent />} />
            <Route path="/shows" element={<ViewShowsPage />} />
            <Route path="/show/create" element={<CreateShowPage />} />
            <Route path="/show/:id" element={<ShowDetailsPage />} />
            <Route path="/show/:id/season/:seasonNumber" element={<ShowDetailsPage />} />
            <Route path="/show/:id/season/:seasonNumber/epidsode/:episodeNumber" element={<ShowDetailsPage />} />
            <Route path="/torrents/search" element={<SearchTorrentsPage />} />
            <Route path="/torrents/my-torrents" element={<MyTorrentsPage />} />
            
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
};

export default App;
