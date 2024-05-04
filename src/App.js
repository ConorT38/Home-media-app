import "./bootstrap.min.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { SearchPage } from "./pages/Search";
import Landing from "./pages/Landing";
import Video from "./pages/Video";

function App() {
  return (
    <Router>
      <Route exact path="/">
        <Landing />
      </Route>
      <Route path="/search">
        <SearchPage />
      </Route>
      <Route path="/video">
        <Video />
      </Route>
    </Router>
  );
}

export default App;
