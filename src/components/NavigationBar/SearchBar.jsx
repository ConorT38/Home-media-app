import React, { Component } from 'react';
import { withRouter } from "react-router-dom";

class SearchBar extends Component {
    state = {
        search: ""
    };

    searchHandler = e => {
        e.preventDefault();
        this.props.history.push("/search/" + this.state.search);
    };

    render() {
        const { search } = this.state;
        return (
            <div>
                <form className="form-inline my-2 my-lg-0" onSubmit={e => this.searchHandler(e)}>
                    <input
                        className="form-control mr-sm-2"
                        type="text"
                        placeholder="Search"
                        value={search}
                        autoComplete="off"
                        onChange={e => this.setState({ search: e.target.value })}
                    />
                    <button className="btn btn-secondary my-2 my-sm-0" type="submit">
                        Search
              </button>
                </form>
            </div>
        );
    }
}

export default withRouter(SearchBar);