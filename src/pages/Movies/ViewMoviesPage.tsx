import React, { useState, useEffect } from "react";
import { getCdnHostEndpoint, getHostAPIEndpoint } from "../../utils/common";
import { Container, Row, Col, Card, Alert, Pagination, Form } from "react-bootstrap";

const ViewMoviesPage: React.FC = () => {
    const [mediaResults, setMediaResults] = useState([]);
    const [errorLoading, setErrorLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const getMovies = (url: string) => {
        fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error(response.statusText);
                else return response.json();
            })
            .then(
                (result) => {
                    console.log(result);
                    setMediaResults(result.items);
                    setErrorLoading(false);
                },
                () => {
                    setErrorLoading(true);
                }
            );
    };

    const searchShows = (url: string) => {
        fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error(response.statusText);
                else return response.json();
            })
            .then(
                (result) => {
                    console.log(result);
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
            ? `${getHostAPIEndpoint()}/search?query=${searchQuery}&page=${currentPage}`
            : `${getHostAPIEndpoint()}/movie?page=${currentPage}`;
        if (searchQuery) {
            searchShows(endpoint);
        } else {
            getMovies(endpoint);
        }
    }, [searchQuery, currentPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to the first page on new search
    };

    return (
        <Container>
            <Row className="mb-4 align-items-center">
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Search for shows..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </Col>
                <Col xs="auto">
                    <a href="/show/create" className="btn btn-primary">
                        Create
                    </a>
                </Col>
            </Row>

            {/* Results Section */}
            <Row>
                {!errorLoading ? (
                    mediaResults?.map((object: any) => (
                        <Col md={4} sm={6} className="mb-4" key={object.id}>
                            <Card className="h-100">
                                <Card.Body>
                                    <Card.Img
                                        variant="top"
                                        src={object.thumbnail_cdn_path ? getCdnHostEndpoint() + object.thumbnail_cdn_path : '/default-thumbnail.jpg'}
                                        alt={object.name}
                                        style={{ height: "200px", objectFit: "cover" }}>

                                    </Card.Img>

                                    <Card.Title>
                                        <a
                                            href={"/movie/" + object.id}
                                            style={{
                                                textDecoration: "none",
                                                color: "greenyellow",
                                            }}
                                        >
                                            {object.name}
                                        </a>
                                    </Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <Alert variant="danger">
                            Error occurred getting media results.
                        </Alert>
                    </Col>
                )}
            </Row>

            {/* Pagination */}
            <Row className="mt-4">
                <Col className="d-flex justify-content-center">
                    <Pagination>
                        <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </Pagination.Prev>
                        <Pagination.Next
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </Pagination.Next>
                    </Pagination>
                </Col>
            </Row>
        </Container>
    );
};

export default ViewMoviesPage;
