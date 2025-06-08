import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Container, Card } from "react-bootstrap";
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
        fetch(`${getHostEndpoint()}:8081/api/show/${showId}`)
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
        fetch(`${getHostAPIEndpoint()}/show/${showId}`, {
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
            <Container fluid className="position-relative" style={{ padding: 0, marginBottom: "2rem" }}>
                <div style={{ position: "relative", overflow: "hidden", display: "flex", justifyContent: "center" }}>
                    <img
                        src="https://c4.wallpaperflare.com/wallpaper/506/166/503/crime-drama-hbo-mafia-wallpaper-preview.jpg"
                        alt="Show Banner"
                        className="img-fluid"
                        style={{
                            width: "80%",
                            height: "auto",
                            filter: "brightness(0.7)",
                            objectFit: "cover",
                            objectPosition: "top", // Focus on the top part of the image
                            clipPath: "inset(0 0 33% 0)", // Remove the bottom third of the image
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: '10%',
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                            padding: "2rem",
                            color: "white",
                            width: "80%", // Match the image width to keep text aligned within the image
                        }}
                    >
                        <h1 style={{ marginBottom: "1rem" }}>{showDetails?.name || "Show Details"}</h1>
                        <p style={{ maxWidth: "600px", marginBottom: "1rem" }}>{showDetails?.description}</p>
                        <div>
                            <Button variant="primary" onClick={() => setEditModalVisible(true)} style={{ marginRight: "0.5rem" }}>
                                Edit Show
                            </Button>
                            <Button variant="success" onClick={() => setAddSeasonModalVisible(true)}>
                                Add Season
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
            <Container className="mt-4">
                {showDetails?.seasons && showDetails.seasons.length > 0 ? (
                    showDetails.seasons.map((season: any) => (
                        <Card key={season.id} className="mb-3">
                            <Card.Header>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Season {season.number}</span>
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            const element = document.getElementById(`season-${season.id}`);
                                            if (element) {
                                                element.classList.toggle("collapse");
                                            }
                                        }}
                                    >
                                        Toggle Episodes
                                    </Button>
                                </div>
                            </Card.Header>
                            <div id={`season-${season.id}`} className="collapse">
                                <Card.Body>
                                    {season.episodes && season.episodes.length > 0 ? (
                                        season.episodes.map((episode: any) => (
                                            <Card key={episode.id} className="mb-2">
                                                <Card.Body>
                                                    <h5>{episode.title}</h5>
                                                    <p>{episode.description}</p>
                                                </Card.Body>
                                            </Card>
                                        ))
                                    ) : (
                                        <p>No episodes available for this season.</p>
                                    )}
                                </Card.Body>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center">
                        <p>No seasons yet. Add a season to get started!</p>
                        <Button variant="success" onClick={() => setAddSeasonModalVisible(true)}>
                            Add Season
                        </Button>
                    </div>
                )}
            </Container>
            {/* Edit Show Modal */}
            < Modal show={editModalVisible} onHide={() => setEditModalVisible(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Show</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
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
            </Modal >

            {/* Add Season Modal */}
            < Modal show={addSeasonModalVisible} onHide={() => setAddSeasonModalVisible(false)}>
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
            </Modal >
        </>
    );
};

export default ShowDetailsPage;
