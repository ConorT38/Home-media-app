import React from "react";
import SearchResult, { SearchResultProps } from "./SearchResult";

interface SearchResultsListProps {
  searchResults: SearchResultProps[];
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({
  searchResults,
}) => {
  return (
    <>
      {searchResults.map((object) => (
        <div key={object.id}>
          <div className="card status-card">
            <div className="card-body">
              <div className="container">
                <div className="row">
                  <SearchResult id={object.id} title={object.title} />
                </div>
              </div>
            </div>
          </div>
          <br />
        </div>
      ))}
    </>
  );
};

export default SearchResultsList;
