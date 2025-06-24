import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table, Container, Card, Spinner, Pagination } from "react-bootstrap";
import { getCdnHostEndpoint, getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";
import { useParams } from "react-router-dom";
import { ShowEpisode, Video } from "../../types";

const ShowDetailsPage: React.FC = () => {
    const [showDetails, setShowDetails] = useState<any>(null);
    const [errorLoading, setErrorLoading] = useState(false);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addSeasonModalVisible, setAddSeasonModalVisible] = useState(false);
    const [videosLoading, setVideosLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    // Pagination settings
    const [totalPages, setTotalPages] = useState(0); // Total number of pages
    const [totalItems, setTotalItems] = useState(0); // Total number of items
    // State for show details
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [seasonNumber, setSeasonNumber] = useState(1);
    const [thumbnailPath, setThumbnailPath] = useState('/default-thumbnail.jpg');
    const [videos, setVideos] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVideoIds, setSelectedVideoIds] = useState<number[]>([]);

    const [seasons, setSeasons] = useState<{ seasonNumber: number; episodes: ShowEpisode[]; }[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { id: showId } = useParams<{ id: string }>(); // Extract show ID from route params

    const getShowDetails = async () => {
        await fetch(`${getHostEndpoint()}:8081/api/show/${showId}`)
            .then((response) => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(
                (result) => {
                    if (!result) {
                        window.location.href = "/404"; // Redirect to 404 page if no show is found
                        return;
                    }
                    console.log("Show details fetched:", result);
                    setShowDetails(result);
                    setTitle(result.name);
                    setDescription(result.description);
                    setThumbnailPath(getCdnHostEndpoint() + result?.thumbnail_cdn_path);
                    setErrorLoading(false);
                },
                () => {
                    setErrorLoading(true);
                    window.location.href = "/404"; // Redirect to 404 page on error
                }
            );
    };

    const getSeasonsDetails = async () => {
        try {
            const response = await fetch(`${getHostEndpoint()}:8081/api/show/${showId}/season`);
            if (!response.ok) throw new Error(response.statusText);
            const result: any[] = await response.json();
            console.log("Seasons details fetched:", result);

            // Group episodes by season_number
            const grouped = result.reduce((acc: Record<number, ShowEpisode[]>, episode: any) => {
                const seasonNum = episode.season_number;
                if (!acc[seasonNum]) {
                    acc[seasonNum] = [];
                }
                acc[seasonNum].push({
                    id: episode.id,
                    show_id: episode.show_id,
                    season: episode.season_number,
                    episodeNumber: episode.episode_number,
                    video: {
                        id: episode.video_id,
                        filename: episode.filename,
                        title: episode.title,
                        cdn_path: episode.cdn_path,
                        uploaded: episode.uploaded ? new Date(episode.uploaded) : null,
                        views: episode.views,
                        entertainment_type: episode.entertainment_type,
                        thumbnail_cdn_path: episode.thumbnail_cdn_path,
                    },
                });
                return acc;
            }, {});

            // Convert grouped object to array of { seasonNumber, episodes }
            const seasonsArr = Object.entries(grouped)
                .map(([seasonNumber, episodes]) => ({
                    seasonNumber: Number(seasonNumber),
                    episodes: episodes.sort((a, b) => a.episodeNumber - b.episodeNumber), // Sort by episode number
                }))
                .sort((a, b) => a.seasonNumber - b.seasonNumber); // Sort by season number

            console.log("Grouped seasons:", seasonsArr);
            setSeasons(seasonsArr);
            return result;
        } catch (error) {
            console.error("Error fetching seasons details:", error);
            return null;
        }
    };


    useEffect(() => {
        getShowDetails();
        getSeasonsDetails();
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

    const handleAddSeason = async () => {
        if (!seasonNumber || selectedVideoIds.length === 0) {
            setAddSeasonModalVisible(false);
            return;
        }
        try {
            // 1. Create the season
            const seasonRes = await fetch(`${getHostAPIEndpoint()}/show/${showId}/season`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seasonNumber: seasonNumber }),
            });
            if (!seasonRes.ok) throw new Error("Failed to create season");
            const seasonData = await seasonRes.json();
            const seasonId = seasonData.id;

            // 2. Add episodes to the season
            const episodes = selectedVideoIds.map((videoId, idx) => ({
                videoId,
                episodeNumber: idx + 1,
            }));
            const episodesRes = await fetch(`${getHostAPIEndpoint()}/show/${showId}/season/${seasonId}/episodes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ episodes }),
            });
            if (!episodesRes.ok) throw new Error("Failed to add episodes");

            // 3. Refresh show details and close modal
            await getShowDetails();
            setAddSeasonModalVisible(false);
            setSelectedVideoIds([]);
        } catch (err) {
            console.error(err);
            setAddSeasonModalVisible(false);
        }
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
        if (addSeasonModalVisible) {
            setVideosLoading(true);
            fetch(`${getHostAPIEndpoint()}/video?limit=100&page=${currentPage}&search=${encodeURIComponent(searchTerm)}`)
                .then((response) => {
                    if (!response.ok) throw new Error(response.statusText);
                    return response.json();
                })
                .then(
                    (result) => {
                        console.log("Videos fetched:", result);
                        setVideos(result.items);
                        setTotalPages(result.totalPages);
                        setTotalItems(result.totalItems);
                        setErrorLoading(false);
                    },
                    () => {
                        setVideos([]);
                    }
                )
                .finally(() => {
                    setVideosLoading(false);
                });
        }
    }, [addSeasonModalVisible, currentPage]);

    useEffect(() => {
        if (addSeasonModalVisible && searchTerm) {
            setVideosLoading(true);
            fetch(`${getHostAPIEndpoint()}/search/videos/${encodeURIComponent(searchTerm)}?limit=100&page=${currentPage}`)
                .then((response) => {
                    if (!response.ok) throw new Error(response.statusText);
                    return response.json();
                })
                .then(
                    (result) => {
                        console.log("Videos fetched from search:", result);
                        setVideos(result?.data);
                        setTotalPages(result?.pagination.totalPages);
                        setTotalItems(result?.pagination?.total);
                        setErrorLoading(false);
                    },
                    () => {
                        setVideos([]);
                    }
                )
                .finally(() => {
                    setVideosLoading(false);
                });
        }
    }, [addSeasonModalVisible, currentPage, searchTerm]);

    useEffect(() => {
        if (addSeasonModalVisible) {
            setCurrentPage(1); // Reset to first page when modal opens
        }
    }
        , [addSeasonModalVisible]);
    useEffect(() => {
        if (addSeasonModalVisible) {
            setSelectedVideoIds([]); // Reset selected videos when modal opens
        }
    }
        , [addSeasonModalVisible]);
    useEffect(() => {
        if (addSeasonModalVisible) {
            setSearchTerm(""); // Reset search term when modal opens
        }
    }, [addSeasonModalVisible]);

    return (
        <>
            <Container fluid className="position-relative" style={{ padding: 0, marginBottom: "0" }}>
                <div
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        maxHeight: "650px", // Reduced height for banner area
                        minHeight: "220px",
                        alignItems: "flex-start",
                        background: "#222",
                        width: "100%", // Ensure it spans the full width of the screen
                    }}
                >
                    <img
                        loading="lazy"
                        src={thumbnailPath}
                        alt="Show Banner"
                        className="img-fluid"
                        style={{
                            width: "100%", // Make the image span the full width
                            height: "100%",
                            objectFit: "cover", // Ensure the image covers the area without distortion
                            objectPosition: "center", // Center the image
                            filter: "brightness(0.7)",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                            padding: "2rem",
                            color: "white",
                            width: "100%", // Adjust to match the full width of the container
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
                {seasons && seasons.length > 0 ? (
                    seasons.map((season: any) => (
                        <>
                            <h3 key={season.seasonNumber} className="mt-4">
                                Season {season.seasonNumber}
                            </h3>
                            <div
                                id={`season-${season.seasonNumber}-episodes-row`}
                                style={{
                                    overflowX: "auto",
                                    paddingBottom: "1rem",
                                    scrollbarWidth: "none", // Firefox
                                    msOverflowStyle: "none", // IE/Edge
                                }}
                                className="hide-scrollbar"
                            >
                                <div style={{ display: "inline-flex", gap: "1rem" }}>
                                    {season.episodes?.filter((e: ShowEpisode) => e.season === season.seasonNumber).map((episode: ShowEpisode, index: number) => (
                                        <Card
                                            key={episode.id || index}
                                            style={{
                                                width: "18rem",
                                                display: "inline-block",
                                                verticalAlign: "top",
                                                minWidth: "18rem",
                                                maxWidth: "18rem",
                                            }}
                                        >
                                            <Card.Img
                                                loading="lazy"
                                                variant="top"
                                                src={
                                                    episode.video?.thumbnail_cdn_path
                                                        ? `${getCdnHostEndpoint()}${episode.video.thumbnail_cdn_path}`
                                                        : "/default-thumbnail.jpg"
                                                }
                                                style={{ height: "200px", objectFit: "cover" }}
                                            />
                                            <Card.Body>
                                                <Card.Title>
                                                    <span>
                                                        {`S${season.seasonNumber}E${episode.episodeNumber}: `}
                                                        <a
                                                            href={`/show/${episode.show_id}/season/${season.seasonNumber}/episode/${episode.episodeNumber}`}
                                                            style={{ textDecoration: "none" }}
                                                        >
                                                            {episode.video.title}
                                                        </a>
                                                    </span>
                                                </Card.Title>
                                                <Card.Text>
                                                    <small>{episode.video?.views ?? 0} views</small>
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </>
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
                    {videosLoading ? (
                        <div className="text-center">
                            <p>Loading videos...</p>
                            <div className="d-flex justify-content-center">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        </div>
                    ) : (
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
                                {videos?.filter(v => !selectedVideoIds.includes(v.id)).map((video) => (
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
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Pagination className="w-100 justify-content-center">
                        <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        />
                        {Array.from({ length: totalPages }, (_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === currentPage}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        />
                    </Pagination>
                    <div className="text-center mt-2">
                        <small>Total Items: {totalItems}</small>
                    </div>
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
