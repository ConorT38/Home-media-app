import React, { useState, useEffect } from "react";
import { getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";
import { Form, Button, Table, Container, Row, Col, Alert, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CreateShowPage: React.FC = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [seasons, setSeasons] = useState(1);
    const [videos, setVideos] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState<Record<string, any>>({});
    const [errorLoading, setErrorLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        // Fetch paginated video data from API
        const fetchVideos = async (page: number) => {
            try {
                const response = await fetch(`${getHostEndpoint()}:8081/api/videos?page=${page}`);
                const data = await response.json();
                console.log(data);
                setVideos(data.items);
                setTotalPages(data.totalPages);
                setErrorLoading(false);
            } catch (error) {
                setErrorLoading(true);
            }
        };
        fetchVideos(currentPage);
    }, [currentPage]);

    const handleVideoSelect = (videoId: string) => {
        setSelectedVideos((prev) => ({
            ...prev,
            [videoId]: !prev[videoId],
        }));
    };

    const handleSubmit = async () => {
        const selectedVideoIds = Object.keys(selectedVideos).filter(
            (id) => selectedVideos[id]
        );
        const newShow = {
            name,
            description,
            thumbnail,
            seasons,
            videos: selectedVideoIds,
        };
        console.log("New Show Data:", newShow);
        // Submit newShow to API
        await fetch(`${getHostAPIEndpoint()}/show`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, description }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to create show");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Show created successfully:", data);
                // Optionally, redirect or clear the form
                window.location.href = `/show/${data.id}`;
            })
            .catch((error) => {
                console.error("Error creating show:", error);
            });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <Container>
            <h1>Create New Show</h1>
            <Form >
                <Form.Group controlId="formTitle">
                    <Form.Label>Title:</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formDescription">
                    <Form.Label>Description:</Form.Label>
                    <Form.Control
                        as="textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formThumbnail">
                    <Form.Label>Thumbnail URL:</Form.Label>
                    <Form.Control
                        type="text"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formSeasons">
                    <Form.Label>Total Seasons:</Form.Label>
                    <Form.Control
                        type="number"
                        value={seasons}
                        onChange={(e) => setSeasons(Number(e.target.value))}
                        min="1"
                        required
                    />
                </Form.Group>
                <h2>Videos</h2>
                {errorLoading ? (
                    <Alert variant="danger">Error loading videos.</Alert>
                ) : (
                    <>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>ID</th>
                                    <th>Title</th>
                                </tr>
                            </thead>
                            <tbody>
                                {videos.map((video: any) => (
                                    <tr key={video.id}>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={!!selectedVideos[video.id]}
                                                onChange={() => handleVideoSelect(video.id)}
                                            />
                                        </td>
                                        <td>{video.id}</td>
                                        <td>{video.title}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination>
                            {[...Array(totalPages)].map((_, index) => (
                                <Pagination.Item
                                    key={index + 1}
                                    active={index + 1 === currentPage}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    </>
                )}
                <Button variant="primary" type="button" onClick={async () => await handleSubmit()}>
                    Create Show
                </Button>
            </Form>
        </Container>
    );
};

export default CreateShowPage;
