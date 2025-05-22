import React, { useState } from 'react';
import { Stack, Button, Form } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

const SearchBar: React.FC = () => {
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    const searchHandler = (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/search/" + search);
    };

    return (
        <div>
            <form onSubmit={searchHandler}>
                <div>
                    <Stack direction="horizontal" gap={2}>
                        <Form.Control
                            type="text"
                            placeholder="Search"
                            value={search}
                            autoComplete="off"
                            onChange={e => setSearch(e.target.value)}
                        />
                        <Button variant="secondary" type="submit">
                            Search
                        </Button>
                    </Stack>
                </div>
            </form>
        </div>
    );
};

export default SearchBar;
