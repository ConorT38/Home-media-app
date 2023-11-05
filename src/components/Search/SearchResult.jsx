import React, { Component } from "react";

class SearchResult extends Component {
  render() {
    const { id, title, views } = this.props;

    return (
      <React.Fragment>
        <div id={"searchResult"}>
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
      </React.Fragment>
    );
  }
}

export default SearchResult;
