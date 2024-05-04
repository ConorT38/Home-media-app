import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

const SearchBar: React.FC = () => {
    const [search, setSearch] = useState("");

    const history = useHistory();

    const searchHandler = (e: React.FormEvent) => {
        e.preventDefault();
        history.push("/search/" + search);
    };

    return (
        <div>
            <form className="form-inline my-2 my-lg-0" onSubmit={searchHandler}>
                <input
                    className="form-control mr-sm-2"
                    type="text"
                    placeholder="Search"
                    value={search}
                    autoComplete="off"
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-secondary my-2 my-sm-0" type="submit">
                    Search
                </button>
            </form>
        </div>
    );
};

export default SearchBar;
