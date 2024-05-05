import React, { useState } from 'react';
import { useNavigate} from "react-router-dom";

const SearchBar: React.FC = () => {
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    const searchHandler = (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/search/" + search);
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
