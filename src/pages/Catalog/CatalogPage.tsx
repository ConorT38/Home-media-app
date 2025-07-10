import React, { useState, useEffect } from "react";
import { Spinner, Button } from "react-bootstrap";
import { getHostAPIEndpoint } from "../../utils/common";
import { Video } from "../../types";

const CatalogPage: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const fetchVideos = async (page: number) => {
        setIsLoading(true);
        try {
            const url = `${getHostAPIEndpoint()}/video?page=${page}`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error("Failed to fetch videos");
            }
            const data = await res.json();
            setVideos(data.items);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos(currentPage);
    }, [currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <React.Fragment>
            <div className="container">
                <h4>Catalog</h4>
                <hr />
                <div className="row">
                    {videos.map((video, index) => (
                        <div key={index} className="col-md-4 mb-4">
                            <div className="card">
                                <img
                                    src={video.thumbnail_cdn_path || "/default-thumbnail.jpg"}
                                    className="card-img-top"
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{video.title}</h5>
                                    <p className="card-text">{video?.uploaded}</p>
                                    <p className="card-text">{video.views} views</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-between">
                    <Button variant="dark" disabled={currentPage === 1} onClick={handlePreviousPage}>
                        Previous
                    </Button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <Button variant="dark" disabled={currentPage === totalPages} onClick={handleNextPage}>
                        Next
                    </Button>
                </div>
            </div>
        </React.Fragment>
    );
};

export default CatalogPage;