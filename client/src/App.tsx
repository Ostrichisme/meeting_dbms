import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Home from "./components/Home";
import AddMeeting from "./components/AddMeeting";
class App extends Component<{},{}> {

    render() {
        return (
            <div>
                <BrowserRouter>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/addmeeting" component={AddMeeting} />
                </BrowserRouter>
            </div>
        );
    }
}

export default App;
