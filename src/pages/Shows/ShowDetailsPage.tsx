import React, { useState, useEffect } from "react";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { getHostEndpoint } from "../../utils/common";

const ShowDetailsPage: React.FC = () => {
    const [mediaResults, setMediaResults] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [errorLoading, setErrorLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const getMediaResults = (url: string) => {
        fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error(response.statusText);
                else return response.json();
            })
            .then(
                (result) => {
                    setMediaResults(result);
                    setErrorLoading(false);
                },
                () => {
                    setErrorLoading(true);
                }
            );
    };

    useEffect(() => {
        const endpoint = searchQuery
            ? `${getHostEndpoint()}:8081/api/search?query=${searchQuery}&page=${currentPage}`
            : `${getHostEndpoint()}:8081/api/top/media?page=${currentPage}`;
        getMediaResults(endpoint);
    }, [searchQuery, currentPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to the first page on new search
    };

    return (
        <div className="App">
            <NavigationBar />
            <div className="container py-5">
                {/* Search Bar */}
                <div className="row mb-4">
                    <div className="col-md-12">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search for shows..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {/* Results Section */}
                <div className="row">
                    {!errorLoading ? (
                        mediaResults.map((object: any) => (
                            <div className="col-md-4 col-sm-6 mb-4" key={object.id}>
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <a
                                                href={"/video/" + object.id}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "greenyellow",
                                                }}
                                            >
                                                {object.title}
                                            </a>
                                        </h5>
                                        <p className="card-text">
                                            {object.description}
                                        </p>
                                        <p className="card-text">
                                            <strong>Seasons:</strong> {object.seasons}
                                        </p>
                                        <p className="card-text">
                                            <strong>Episodes:</strong> {object.episodes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-md-12">
                            <div className="alert alert-danger" role="alert">
                                Error occurred getting media results.
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="row mt-4">
                    <div className="col-md-12 d-flex justify-content-center">
                        <nav>
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    >
                                        Previous
                                    </button>
                                </li>
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage((prev) => prev + 1)}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowDetailsPage;
