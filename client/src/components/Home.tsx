import React, { Component } from 'react'
import Layout from './Layout';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { sqlQuery } from '../utils/util';
interface meetingInfo {
    id: number,
    attendees: string,
    room: string,
    subject: string,
    time: number
}
interface Props {

}
interface State {
    isSwitchOn: boolean
    meetings: meetingInfo[]
}

class Home extends Component<Props, State> {
    state = {
        isSwitchOn: false,
        meetings: [] as meetingInfo[]
    };

    componentDidMount() {
        this.initMeetingInfo();
    }
    async initMeetingInfo() {
        const records = await sqlQuery("SELECT a.M_id,Name,R_id,Subject,a.Time FROM attends a,employee e,meeting m WHERE AttendDate=cast(now() as date) and a.M_id=m.M_id and a.E_id=e.E_id ORDER BY Time,M_id");
        let meetingID = 0;
        let meetings = [] as meetingInfo[];
        records.data.map((record: any) => {
            if (record.M_id === meetingID)
                meetings[meetings.length - 1].attendees += `, ${record.Name}`;
            else {
                meetings.push({ id: record.M_id, attendees: record.Name, room: record.R_id, subject: record.Subject, time: record.Time });
                meetingID = record.M_id;
            }
        }
        );
        this.setState({ meetings: meetings });
    }
    meetingList() {
        return this.state.meetings.map((meeting, index) =>
            <tr key={index}>
                <td>
                    <Button variant="secondary" onClick={() => this.delete(meeting.id)}>刪除</Button>
                </td>
                <td>{meeting.id}</td>
                <td>{meeting.attendees}</td>
                <td>{meeting.room}</td>
                <td>{meeting.subject}</td>
                <td>{meeting.time}點</td>
            </tr>);
    }
    async delete(id: number) {
        await sqlQuery(`DELETE FROM meeting WHERE M_id=${id};DELETE FROM attends WHERE M_id=${id};`);
        this.initMeetingInfo();
    }
    async deleteSQL() {
        try {
            (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = "";
            const query = (document.getElementById("sqlArea") as HTMLInputElement).value;
            await sqlQuery(query);
            this.initMeetingInfo();
        } catch (e) {
            (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = e;
        }
    }
    render() {
        return (
            <Layout>
                <div className="padding10">
                    <Form>
                        <Form.Check
                            type="switch"
                            label="Use SQL Editor"
                            id="custom-switch"
                            checked={this.state.isSwitchOn}
                            onChange={() => {
                                (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = "";
                                this.setState({ isSwitchOn: !this.state.isSwitchOn })
                            }}
                        />
                    </Form>
                    <Form hidden={!this.state.isSwitchOn}>
                        <Form.Group>
                            <Form.Label>SQL Editor</Form.Label>
                            <Form.Control id="sqlArea" as="textarea" rows={8} placeholder="ex: DELETE FROM meeting WHERE M_id=19;DELETE FROM attends WHERE M_id=19;
                             "/>
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" onClick={() => this.deleteSQL()}>
                                Delete
                            </Button>
                            <span id="errorQueryMsg" className="errorMsg"></span>
                        </Form.Group>
                    </Form>
                    
                    <Table striped bordered className="MarginTop">
                        <thead>
                            <tr>
                                <th className="deleteWidth">刪除</th>
                                <th>會議編號</th>
                                <th>與會者</th>
                                <th>會議室</th>
                                <th>會議主題</th>
                                <th>時間</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.meetingList()}
                        </tbody>
                    </Table>
                </div>
            </Layout>
        )
    }
}

export default Home
