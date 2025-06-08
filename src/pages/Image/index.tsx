import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Pagination, Alert } from "react-bootstrap";
import { getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";

interface Image {
    id: number;
    cdn_path: string;
    uploaded: string;
}

const ImagesPage: React.FC = () => {
    const [images, setImages] = useState<Image[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);

    const fetchImages = async (page: number) => {
        try {
            setError(null); // Reset error state
            const response = await fetch(`${getHostAPIEndpoint()}/image/?page=${page}`);
            if (!response.ok) {
                throw new Error("Failed to fetch images");
            }
            const data = await response.json();
            setImages(data.items);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching images:", error);
            setError("Failed to load images. Please try again later.");
        }
    };

    useEffect(() => {
        fetchImages(currentPage);
    }, [currentPage]);

    const handlePageChange = (pageNumber: number): void => {
        setCurrentPage(pageNumber);
    };

    return (
        <Container className="mt-4">
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}
            <Row>
                {images.length > 0 ? (
                    images.map((image) => (
                        <Col key={image.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <Card>
                                <Card.Img variant="top" src={getHostEndpoint()+':8000'+image.cdn_path} alt={`Image ${image.id}`} />
                                <Card.Body>
                                    <Card.Title>Uploaded: {new Date(image.uploaded).toLocaleDateString()}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    !error && (
                        <Col>
                            <p className="text-center">No results found.</p>
                        </Col>
                    )
                )}
            </Row>
            {images.length > 0 && (
                <Pagination className="justify-content-center mt-4">
                    <Pagination.First
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    />
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                            key={i + 1}
                            active={i + 1 === currentPage}
                            onClick={() => handlePageChange(i + 1)}
                        >
                            {i + 1}
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
            )}
        </Container>
    );
};

export default ImagesPage;