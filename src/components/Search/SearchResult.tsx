import React from "react";

export interface SearchResultProps {
  id: string;
  title: string;
}

const SearchResult: React.FC<SearchResultProps> = ({ id, title }) => {
  return (
    <>
      <div id="searchResult">
        <div className="row">
          <div className="col">
            <a
              href={"/video/" + id}
              style={{ textDecoration: "none", color: "greenyellow" }}
              className="card-body"
            >
              <span>{title}</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchResult;
