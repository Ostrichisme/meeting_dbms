import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Home from "./components/Home";
import AddMeeting from "./components/AddMeeting";
import UpdateGrade from "./components/UpdateGrade";
class App extends Component<{},{}> {

    render() {
        return (
            <div>
                <BrowserRouter>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/addmeeting" component={AddMeeting} />
                        <Route exact path="/updategrade" component={UpdateGrade} />
                </BrowserRouter>
            </div>
        );
    }
}

export default App;
