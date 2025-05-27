import React, { useState } from "react";
import { Form, Button, Table, Spinner, Pagination, Container } from "react-bootstrap";
import { useMutation, useQuery } from "react-query";
import { TorrentSites } from "../../types/torrents";
import { getHostAPIEndpoint } from "../../utils/common";

const fetchSearchResults = async (site: string, query: string) => {
    const response = await fetch(`http://192.168.0.25:8009/api/v1/search?site=${site}&query=${query}`);
    if (!response.ok) {
        throw new Error("Failed to fetch search results");
    }
    return response.json();
};

const downloadTorrent = async (magnetUri: string) => {
    try {
        const response = await fetch(`${getHostAPIEndpoint()}/torrent/download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ magnetUri }),
        });

        if (!response.ok) {
            throw new Error("Failed to download torrent");
        }

        alert("Torrent download initiated successfully!");
    } catch (error) {
        console.error("Error downloading torrent:", error);
        alert("An error occurred while downloading the torrent.");
    }
};

const SearchTorrentsPage: React.FC = () => {
    const [site, setSite] = useState("");
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, refetch } = useQuery(
        ["searchResults", site, query],
        async () => await fetchSearchResults(site, query),
        {
            enabled: false, // Only fetch when explicitly triggered
        }
    );

    const { mutate: initiateDownload } = useMutation(
        async (magnetUri: string) => await downloadTorrent(magnetUri),
        {
            onError: (error) => {
                console.error("Error initiating download:", error);
                alert("Failed to initiate torrent download.");
            },
            onSuccess: () => {
                alert("Torrent download initiated successfully!");
            },
        }
    );

    const handleSearch = () => {
        if (site.trim() && query.trim()) {
            setCurrentPage(1); // Reset to first page on new search
            refetch();
        } else {
            alert("Please enter both site and query.");
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
                                                onClick={() => initiateDownload(result.magnet)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                    />
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
        </Container>
    );
};

export default SearchTorrentsPage;