import React, { useEffect, useState } from "react";
import SearchResultsList from "../../components/Search/SearchResultsList";
import { useLocation } from "react-router-dom";
import { getHostAPIEndpoint } from "../../utils/common";
import { Container, Spinner, Pagination } from "react-bootstrap";

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [errorLoading, setErrorLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const location = useLocation();

  async function getSearchResults(searchTerm: string, page: number = 1) {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${getHostAPIEndpoint()}/search/${searchTerm}?page=${page}`
      );
      if (!response.ok) throw new Error(response.status.toString());
      const result = await response.json();
      console.log(result);
      setSearchResults(result.data || []);
      setTotalPages(result.pagination.totalPages || 1);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setErrorLoading(true);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const fetchSearchResults = async () => {
      const searchParam = location.pathname.match(/(?<=\/search\/).*/)?.[0];
      if (searchParam) {
        const decodedParam = decodeURI(searchParam);
        setSearchTerm(decodedParam);
        await getSearchResults(decodedParam, currentPage);
      }
    };
    fetchSearchResults();
  }, [location, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <Container>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <React.Fragment>
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
                  onClick={() => setCurrentTab(0)}
                  id="nav-home-tab"
                  href="javascript:;"
                >
                  Movies ({searchResults.length})
                </a>
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 1 ? "active" : "")
                  }
                  onClick={() => setCurrentTab(1)}
                  id="nav-profile-tab"
                  href="javascript:;"
                >
                  Series ({searchResults.length})
                </a>
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 2 ? "active" : "")
                  }
                  onClick={() => setCurrentTab(2)}
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
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
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
