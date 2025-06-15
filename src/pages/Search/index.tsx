import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCdnHostEndpoint, getHostAPIEndpoint } from "../../utils/common";
import { Container, Spinner, Pagination, Card } from "react-bootstrap";

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [movies, setMovies] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
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

      setMovies(result.data.movies || []);
      setShows(result.data.shows || []);
      setVideos(result.data.videos || []);

      // Update total pages based on the current tab
      if (currentTab === 0) {
        setTotalPages(result.pagination.movies.totalPages || 1);
      } else if (currentTab === 1) {
        setTotalPages(result.pagination.shows.totalPages || 1);
      } else if (currentTab === 2) {
        setTotalPages(result.pagination.videos.totalPages || 1);
      }

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
  }, [location, currentPage, currentTab]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getCurrentTabData = () => {
    if (currentTab === 0) return movies;
    if (currentTab === 1) return shows;
    if (currentTab === 2) return videos;
    return [];
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
                  onClick={() => {
                    setCurrentTab(0);
                    setCurrentPage(1); // Reset page when switching tabs
                  }}
                  id="nav-home-tab"
                  href="javascript:;"
                >
                  Movies ({movies.length})
                </a>
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 1 ? "active" : "")
                  }
                  onClick={() => {
                    setCurrentTab(1);
                    setCurrentPage(1); // Reset page when switching tabs
                  }}
                  id="nav-profile-tab"
                  href="javascript:;"
                >
                  Shows ({shows.length})
                </a>
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 2 ? "active" : "")
                  }
                  onClick={() => {
                    setCurrentTab(2);
                    setCurrentPage(1); // Reset page when switching tabs
                  }}
                  id="nav-contact-tab"
                  href="javascript:;"
                >
                  Videos ({videos.length})
                </a>
              </div>
            </nav>
            {getCurrentTabData().length < 1 ? (
              <div>No Search Results for that term</div>
            ) : (
              <div>
                <br />
                <Container>
                  <div className="d-flex flex-wrap justify-content-start">
                    {getCurrentTabData().map((item, index) => (
                      <a
                        key={index}
                        href={
                          currentTab === 0
                            ? `/movie/${item.id}`
                            : currentTab === 1
                              ? `/show/${item.id}`
                              : `/video/${item.id}`
                        }
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Card
                          style={{ width: "18rem", margin: "0.5rem" }}
                          className="flex-grow-1"
                        >
                          <Card.Img
                            variant="top"
                            src={item.thumbnail_cdn_path ? getCdnHostEndpoint() + item.thumbnail_cdn_path : "/default-thumbnail.jpg"}
                            alt={item.name || item.title}
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                          <Card.Body>
                            <Card.Title>{item.name || item.title}</Card.Title>
                            {currentTab === 1 && (
                              <Card.Text>
                                {item.total_seasons && <div>Seasons: {item.total_seasons}</div>}
                                {item.total_episodes && <div>Episodes: {item.total_episodes}</div>}
                              </Card.Text>
                            )}
                          </Card.Body>
                        </Card>
                      </a>
                    ))}
                  </div>
                  <Pagination className="justify-content-center mt-3">
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
                </Container>
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
