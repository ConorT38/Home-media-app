import React, { Component } from "react";

class SearchResult extends Component {
    render() {
        const { id, title, uploaded, views } = this.props;

        return (
            <React.Fragment>
                <div id={"searchResult"}>
                    <div className="row">
                        <div className="col">
                            <b>Title: </b>
                            <a
                                href={"/video/" + id}
                                style={{ textDecoration: "none" }}
                                className="card-body"
                            >
                                <span>{title}</span>
                            </a>
                            <br />{views} views | uploaded on {uploaded}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default SearchResult;