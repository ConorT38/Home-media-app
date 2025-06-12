import React, { useState } from "react";
import { getCdnHostEndpoint, getHostAPIEndpoint } from "../../utils/common";
import { Form, Button, Container } from "react-bootstrap";

const CreateShowPage: React.FC = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [seasons, setSeasons] = useState(1);
    const [selectedVideos, setSelectedVideos] = useState<Record<string, any>>({});

    const uploadThumbnail = async (): Promise<any> => {
        if (!thumbnailFile) {
            throw new Error("No thumbnail file selected");
        }

        const formData = new FormData();
        formData.append("image", thumbnailFile);

        const response = await fetch(`${getHostAPIEndpoint()}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload thumbnail");
        }

        const data = await response.json();
        return data;
    };

    const handleSubmit = async () => {
        try {
            const thumbnailData = await uploadThumbnail();
            const selectedVideoIds = Object.keys(selectedVideos).filter(
                (id) => selectedVideos[id]
            );

            const newShow = {
                name,
                description,
                thumbnail_id: thumbnailData.file.id,
                videos: selectedVideoIds,
            };

            console.log("Creating show with data:", newShow);

            const response = await fetch(`${getHostAPIEndpoint()}/show`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newShow),
            });

            if (!response.ok) {
                throw new Error("Failed to create show");
            }

            const data = await response.json();
            window.location.href = `/show/${data.id}`;
        } catch (error) {
            console.error("Error creating show:", error);
        }
    };

    return (
        <Container>
            <h1>Create New Show</h1>
            <Form>
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
                    <Form.Label>Thumbnail:</Form.Label>
                    <Form.Control
                        type="file"
                        onChange={(e) => setThumbnailFile((e.target as HTMLInputElement).files?.[0] || null)}
                        required
                    />
                </Form.Group>
                <hr />

                <Button variant="primary" type="button" onClick={async () => await handleSubmit()}>
                    Create Show
                </Button>
            </Form>
        </Container>
    );
};

export default CreateShowPage;
