import React, { useEffect, useState } from "react";
import SearchResultsList from "../../components/Search/SearchResultsList";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { useLocation } from "react-router-dom";

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [errorLoading, setErrorLoading] = useState<boolean>(false);

  const location = useLocation();
  async function getSearchResults(searchTerm: string) {
    try {
      const response = await fetch(
        "http://homemedia.lan:8081/api/search/" + searchTerm
      );
      if (!response.ok) throw new Error(response.status.toString());
      const result = await response.json();
      setSearchResults(result);
    } catch (error) {
      setErrorLoading(true);
    }
  }

  useEffect(() => {
    const searchParam = location.pathname.match(/(?<=\/search\/).*/)?.[0];
    if (searchParam) {
      setSearchTerm(decodeURI(searchParam));
      getSearchResults(decodeURI(searchParam));
    }
  }, [location]);

  useEffect(() => {
    const searchParam = window.location.href.match(/(?<=\/search\/).*/)?.[0];
    if (searchParam) {
      setSearchTerm(decodeURI(searchParam));
      getSearchResults(decodeURI(searchParam));
    }
  }, []);

  return (
    <React.Fragment>
      <NavigationBar />
      <div className="container">
        {!errorLoading ? (
          <>
            <div className="card-title">Showing results for: {searchTerm}</div>
            <nav>
              <div className="nav nav-tabs" id="nav-tab" role="tablist">
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 0 ? "active" : "")
                  }
                  onClick={(e) => setCurrentTab(0)}
                  id="nav-home-tab"
                  href="javascript:;"
                >
                  Movies ({searchResults.length})
                </a>
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 1 ? "active" : "")
                  }
                  onClick={(e) => setCurrentTab(1)}
                  id="nav-profile-tab"
                  href="javascript:;"
                >
                  Series ({searchResults.length})
                </a>
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 2 ? "active" : "")
                  }
                  onClick={(e) => setCurrentTab(2)}
                  id="nav-contact-tab"
                  href="javascript:;"
                >
                  Documentaries ({searchResults.length})
                </a>
              </div>
            </nav>
            {searchResults.length < 1 ? (
              <div>No Search Results for that term</div>
            ) : (
              <div>
                <br />
                <SearchResultsList searchResults={searchResults} />
              </div>
            )}
          </>
        ) : (
          <div className="card-title">
            Error occurred searching for: {searchTerm}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
