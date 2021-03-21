import React, { Component } from "react";
import SearchResult from "./SearchResult";

class SearchResultsList extends Component {
    render() {
        const { searchResults } = this.props;
        return (
            <React.Fragment>
                {searchResults.map(object => (
                    <div>
                        <div className="card status-card">
                            <div className="card-body">
                                <div className="container">
                                    <div className="row">
                                        <SearchResult
                                            id={object.id}
                                            title={object.title}
                                            mediaLink={object.cdn_path}
                                            views={object.views}
                                            uploaded={object.uploaded}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <br />
                    </div>
                ))}
            </React.Fragment>
        );
    }
}

export default SearchResultsList;