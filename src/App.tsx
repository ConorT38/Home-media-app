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
import ImagesPage from "./pages/Image";
import EpisodeVideoPage from "./pages/Shows/EpisodeVideoPage";
import ViewMoviesPage from "./pages/Movies/ViewMoviesPage";
import MovieVideoPage from "./pages/Movies/MovieVideoPage";
import CatalogPage from "./pages/Catalog/CatalogPage";

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
            <Route path="/show/:id/season/:seasonNumber/episode/:episodeNumber" element={<EpisodeVideoPage />} />
            <Route path="/torrents/search" element={<SearchTorrentsPage />} />
            <Route path="/torrents/my-torrents" element={<MyTorrentsPage />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="/movies" element={<ViewMoviesPage />} />
            <Route path="/movie/:id" element={<MovieVideoPage />} />
            <Route path="/catalog" element={<CatalogPage />} />

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
};

export default App;
