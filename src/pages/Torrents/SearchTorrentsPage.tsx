import React, { useState } from "react";
import { Form, Button, Table, Spinner, Pagination, Container, Modal, Toast } from "react-bootstrap";
import { useMutation, useQuery } from "react-query";
import { TorrentSites } from "../../types/torrents";
import { getHostAPIEndpoint } from "../../utils/common";

const fetchSearchResults = async (site: string, query: string) => {
    const response = await fetch(`${getHostAPIEndpoint()}/torrent/search?site=${site}&query=${query}`);
    if (!response.ok) {
        throw new Error("Failed to fetch search results");
    }
    return response.json();
};

const downloadTorrent = async (name: string, magnetUri: string, category: string) => {
    const response = await fetch(`${getHostAPIEndpoint()}/torrent/download`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, magnetUri, category }),
    });

    if (!response.ok) {
        throw new Error("Failed to download torrent");
    }
};

const SearchTorrentsPage: React.FC = () => {
    const [site, setSite] = useState("");
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedMagnet, setSelectedMagnet] = useState("");
    const [selectedName, setSelectedName] = useState("");
    const [category, setCategory] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");
    const [downloading, setDownloading] = useState<string | null>(null);

    const { data, isLoading, refetch } = useQuery(
        ["searchResults", site, query],
        async () => await fetchSearchResults(site, query),
        {
            enabled: false, // Only fetch when explicitly triggered
        }
    );

    const { mutate: initiateDownload } = useMutation(
        async ({ name, magnetUri, category }: { name: string, magnetUri: string; category: string }) =>
            await downloadTorrent(name, magnetUri, category),
        {
            onError: (error) => {
                console.error("Error initiating download:", error);
                setToastMessage("Failed to initiate torrent download.");
                setToastVariant("danger");
                setShowToast(true);
                setDownloading(null);
            },
            onSuccess: () => {
                setToastMessage("Torrent download initiated successfully!");
                setToastVariant("success");
                setShowToast(true);
                setDownloading(null);
            },
        }
    );

    const handleSearch = () => {
        if (site.trim() && query.trim()) {
            setCurrentPage(1); // Reset to first page on new search
            refetch();
        } else {
            setToastMessage("Please enter both site and query.");
            setToastVariant("warning");
            setShowToast(true);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDownloadClick = (name: string, magnetUri: string) => {
        setSelectedName(name);
        setSelectedMagnet(magnetUri);
        setShowModal(true);
    };

    const handleModalDownload = () => {
        if (category) {
            setDownloading(selectedMagnet);
            initiateDownload({ name: selectedName, magnetUri: selectedMagnet, category });
            setShowModal(false);
            setCategory(""); // Reset category
        } else {
            setToastMessage("Please select a category.");
            setToastVariant("warning");
            setShowToast(true);
        }
    };

    return (
        <Container>
            <h1 className="my-4">Search Torrents</h1>
            <Form className="mb-4" onSubmit={(e) => e.preventDefault()}>
                <div className="d-flex align-items-end">
                    <Form.Group controlId="query" className="me-3 flex-grow-1">
                        <Form.Label>Query</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter search query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="site" className="me-3 flex-grow-2">
                        <Form.Label>Site</Form.Label>
                        <Form.Select
                            value={site}
                            onChange={(e) => setSite(e.target.value)}
                        >
                            <option value="">Select a site</option>
                            {Object.values(TorrentSites).map((siteOption) => (
                                <option key={siteOption} value={siteOption}>
                                    {siteOption}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button variant="primary" onClick={handleSearch}>
                        Search
                    </Button>
                </div>
            </Form>

            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                data?.data?.length > 0 ? (
                    <>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Seeders</th>
                                    <th>Leechers</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.data.slice((currentPage - 1) * 10, currentPage * 10).map((result: any, index: number) => (
                                    <tr key={index}>
                                        <td>{(currentPage - 1) * 10 + index + 1}</td>
                                        <td><a href={result.url}>{result.name}</a></td>
                                        <td>{result.size}</td>
                                        <td>{result.seeders}</td>
                                        <td>{result.leechers}</td>
                                        <td>
                                            <Button
                                                variant="success"
                                                onClick={() => handleDownloadClick(result.name, result.magnet)}
                                                disabled={downloading === result.magnet}
                                            >
                                                {downloading === result.magnet ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />{" "}
                                                        Downloading...
                                                    </>
                                                ) : (
                                                    "Download"
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination className="justify-content-center">
                            {Array.from({ length: Math.ceil(data?.data?.length / 10) }, (_, i) => (
                                <Pagination.Item
                                    key={i + 1}
                                    active={i + 1 === currentPage}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    </>
                ) : (
                    <p className="text-center">No results found.</p>
                )
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="category">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select a category</option>
                                <option value="movies">Movie</option>
                                <option value="shows">Show</option>
                                <option value="games">Game</option>
                                <option value="software">Software</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleModalDownload}>
                        Download
                    </Button>
                </Modal.Footer>
            </Modal>

            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={3000}
                autohide
                className={`position-fixed bottom-0 end-0 m-3 bg-${toastVariant}`}
            >
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </Container>
    );
};

export default SearchTorrentsPage;