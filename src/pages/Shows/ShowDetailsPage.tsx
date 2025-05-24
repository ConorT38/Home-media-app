import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";
import { useParams } from "react-router-dom";

const ShowDetailsPage: React.FC = () => {
    const [showDetails, setShowDetails] = useState<any>(null);
    const [errorLoading, setErrorLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addSeasonModalVisible, setAddSeasonModalVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [seasonNumber, setSeasonNumber] = useState(1);
    const [videos, setVideos] = useState<any[]>([]);

    const { id: showId } = useParams<{ id: string }>(); // Extract show ID from route params

    const getShowDetails = () => {
        fetch(`${getHostEndpoint()}:8081/api/shows/${showId}`)
            .then((response) => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(
                (result) => {
                    setShowDetails(result);
                    setTitle(result.name);
                    setDescription(result.description);
                    setErrorLoading(false);
                },
                () => {
                    setErrorLoading(true);
                }
            );
    };

    useEffect(() => {
        getShowDetails();
    }, []);

    const handleEditShow = () => {
        // Handle edit show logic here
        setEditModalVisible(false);
        fetch(`${getHostAPIEndpoint()}/shows/${showId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: title,
                description: description,
            }),
        })
            .then((response) => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(() => {
                getShowDetails(); // Refresh show details after update
            })
            .catch((error) => {
                console.error("Error updating show:", error);
            });
    };

    const handleAddSeason = () => {
        // Handle add season logic here
        setAddSeasonModalVisible(false);
    };

    return (
        <>
            <Container>
                <Row className="mb-4">
                    <Col>
                        <h1>Show Details</h1>
                    </Col>
                    <Col className="text-end">
                        <Button variant="primary" onClick={() => setEditModalVisible(true)}>
                            Edit Show
                        </Button>{" "}
                        <Button variant="success" onClick={() => setAddSeasonModalVisible(true)}>
                            Add Season
                        </Button>
                    </Col>
                </Row>

                {errorLoading ? (
                    <div className="alert alert-danger" role="alert">
                        Error occurred getting show details.
                    </div>
                ) : showDetails ? (
                    <Card>
                        <Card.Body>
                            <Card.Title>{showDetails.name}</Card.Title>
                            <Card.Text>{showDetails.description}</Card.Text>
                            <Card.Text>
                                <strong>Seasons:</strong> {showDetails.seasons}
                            </Card.Text>
                            <Card.Text>
                                <strong>Episodes:</strong> {showDetails.episodes}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                ) : (
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                )}
            </Container>

            {/* Edit Show Modal */}
            <Modal show={editModalVisible} onHide={() => setEditModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Show</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditModalVisible(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleEditShow}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Season Modal */}
            <Modal show={addSeasonModalVisible} onHide={() => setAddSeasonModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Season</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Season Number</Form.Label>
                            <Form.Control
                                type="number"
                                value={seasonNumber}
                                onChange={(e) => setSeasonNumber(Number(e.target.value))}
                            />
                        </Form.Group>
                    </Form>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Video ID</th>
                                <th>Title</th>
                            </tr>
                        </thead>
                        <tbody>
                            {videos.map((video) => (
                                <tr key={video.id}>
                                    <td>
                                        <Form.Check type="checkbox" />
                                    </td>
                                    <td>{video.id}</td>
                                    <td>{video.title}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setAddSeasonModalVisible(false)}>
                        Close
                    </Button>
                    <Button variant="success" onClick={handleAddSeason}>
                        Add Season
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ShowDetailsPage;
