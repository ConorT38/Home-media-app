import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Container, Card } from "react-bootstrap";
import { getCdnHostEndpoint, getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";
import { useParams } from "react-router-dom";

const ShowDetailsPage: React.FC = () => {
    const [showDetails, setShowDetails] = useState<any>(null);
    const [errorLoading, setErrorLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addSeasonModalVisible, setAddSeasonModalVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [seasonNumber, setSeasonNumber] = useState(1);
    const [thumbnailPath, setThumbnailPath] = useState('/default-thumbnail.jpg');
    const [videos, setVideos] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVideoIds, setSelectedVideoIds] = useState<number[]>([]);
    const filteredVideos = videos.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { id: showId } = useParams<{ id: string }>(); // Extract show ID from route params

    const getShowDetails = async () => {
        await fetch(`${getHostEndpoint()}:8081/api/show/${showId}`)
            .then((response) => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(
                (result) => {
                    console.log("Show details fetched:", result);
                    setShowDetails(result);
                    setTitle(result.name);
                    setDescription(result.description);
                    setThumbnailPath(getCdnHostEndpoint() + result?.thumbnail_cdn_path );
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

    const handleVideoSelect = (videoId: number) => {
        setSelectedVideoIds((prevSelected) => {
            if (prevSelected.includes(videoId)) {
                return prevSelected.filter((id) => id !== videoId);
            } else {
                return [...prevSelected, videoId];
            }
        });
    };

    useEffect(() => {
        fetch(`${getHostAPIEndpoint()}/video?limit=100`)
            .then((response) => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(
                (result) => {
                    console.log("Videos fetched:", result);
                    setVideos(result.items);
                },
                () => {
                    setVideos([]);
                }
            );
    }
    , []);

    return (
        <>
            <Container fluid className="position-relative" style={{ padding: 0, marginBottom: "2rem" }}>
                <div
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        height: "920px", // Fixed height for banner area
                        minHeight: "220px",
                        alignItems: "flex-start",
                        background: "#222",
                    }}
                >
                    <img
                        src={thumbnailPath}
                        alt="Show Banner"
                        className="img-fluid"
                        style={{
                            width: "80%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top",
                            filter: "brightness(0.7)",
                            clipPath: "inset(0 0 33% 0)",
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
                            width: "80%",
                            height: "100%",
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
            <Modal show={editModalVisible} onHide={() => setEditModalVisible(false)} >
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
            <Modal show={addSeasonModalVisible} onHide={() => setAddSeasonModalVisible(false)} fullscreen>
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
                        <Form.Group className="mb-3">
                            <Form.Label>Search Videos</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Search by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Episode #</th>
                                <th></th>
                                <th>Video ID</th>
                                <th>Title</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedVideoIds.map((videoId, idx) => {
                                const video = videos.find(v => v.id === videoId);
                                if (!video) return null;
                                return (
                                    <tr key={video.id}>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={true}
                                                onChange={() => handleVideoSelect(video.id)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                min={1}
                                                style={{ width: 70, display: "inline-block" }}
                                                value={idx + 1}
                                                onChange={e => {
                                                    const newPos = Math.max(1, Math.min(selectedVideoIds.length, Number(e.target.value)));
                                                    if (newPos === idx + 1) return;
                                                    // Move videoId to newPos-1
                                                    const newArr = [...selectedVideoIds];
                                                    newArr.splice(idx, 1);
                                                    newArr.splice(newPos - 1, 0, videoId);
                                                    setSelectedVideoIds(newArr);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={() => {
                                                    if (idx > 0) {
                                                        const newArr = [...selectedVideoIds];
                                                        [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                                                        setSelectedVideoIds(newArr);
                                                    }
                                                }}
                                                style={{ marginRight: 2 }}
                                                disabled={idx === 0}
                                            >↑</Button>
                                            <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={() => {
                                                    if (idx < selectedVideoIds.length - 1) {
                                                        const newArr = [...selectedVideoIds];
                                                        [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]];
                                                        setSelectedVideoIds(newArr);
                                                    }
                                                }}
                                                disabled={idx === selectedVideoIds.length - 1}
                                            >↓</Button>
                                        </td>
                                        <td>{video.id}</td>
                                        <td>{video.title}</td>
                                    </tr>
                                );
                            })}
                            {filteredVideos.filter(v => !selectedVideoIds.includes(v.id)).map((video) => (
                                <tr key={video.id}>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={false}
                                            onChange={() => handleVideoSelect(video.id)}
                                        />
                                    </td>
                                    <td></td>
                                    <td></td>
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
