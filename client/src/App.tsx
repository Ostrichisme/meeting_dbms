import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Home from "./components/Home";
import AddMeeting from "./components/AddMeeting";
import UpdateGrade from "./components/UpdateGrade";
import ShowMeetingRoom from "./components/ShowMeetingRoom";
import ShowDepartment from "./components/ShowDepartment";
import UseSQL from "./components/UseSQL";
class App extends Component<{},{}> {
    render() {
        return (
            <div>
                <BrowserRouter>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/addmeeting" component={AddMeeting} />
                        <Route exact path="/updategrade" component={UpdateGrade} />
                        <Route exact path="/showmeetingroom" component={ShowMeetingRoom} />
                        <Route exact path="/showdepartment" component={ShowDepartment} />
                        <Route exact path="/usesql" component={UseSQL} />
                </BrowserRouter>
            </div>
        );
    }
}

export default App;
