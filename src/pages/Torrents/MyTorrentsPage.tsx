import React from 'react';
import { useQuery } from 'react-query';
import { Table, Spinner, ProgressBar, Alert, Container } from 'react-bootstrap';
import { getHostAPIEndpoint } from '../../utils/common';

const fetchTorrents = async () => {
    const response = await fetch(getHostAPIEndpoint() + '/torrent/');
    if (!response.ok) {
        throw new Error('Failed to fetch torrents');
    }
    return response.json();
};

const MyTorrentsPage: React.FC = () => {
    const { data, isLoading, isError } = useQuery('torrents', fetchTorrents, {
        refetchInterval: 5000,
    });

    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (isError) {
        return (
            <Container className="text-center mt-5">
                <Alert variant="danger">Failed to load torrents. Please try again later.</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            {data && data.length > 0 ? (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Done</th>
                            <th>Have</th>
                            <th>ETA</th>
                            <th>Up</th>
                            <th>Down</th>
                            <th>Ratio</th>
                            <th>Status</th>

                        </tr>
                    </thead>
                    <tbody>
                        {data.map((torrent: any) => (
                            <tr key={torrent.id}>
                                <td>{torrent.id}</td>
                                <td>{torrent.name}</td>
                                <td>
                                    <ProgressBar
                                        now={parseFloat(torrent.done.replace('%', ''))}
                                        label={`${torrent.done}%`}
                                    />
                                </td>
                                <td>{torrent.have}</td>
                                <td>{torrent.eta}</td>
                                <td>{torrent.up}</td>
                                <td>{torrent.down}</td>
                                <td>{torrent.ratio}</td>
                                <td>{torrent.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <Alert variant="info">No results found.</Alert>
            )}
        </Container>
    );
};

export default MyTorrentsPage;