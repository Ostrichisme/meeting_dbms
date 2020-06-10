import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Layout from './Layout';
import { sqlQuery } from "../utils/util";
interface EmpData {
    E_id: string,
    E_name: String
}
interface Props extends RouteComponentProps {

}
interface State {
    depEmp: Record<string, EmpData[]>,
    initiator: string,
    attendees: string[],
    availRoom: string[],
    availRoomFlag: boolean,
    availTime: number[],
    availTimeFlag: boolean,
    isSwitchOn: boolean
}

export default class AddMeeting extends Component<Props, State> {
    state = {
        depEmp: {} as Record<string, EmpData[]>,
        initiator: "",
        attendees: [] as string[],
        availRoom: [] as string[],
        availRoomFlag: false,
        availTime: [] as number[],
        availTimeFlag: false,
        isSwitchOn: false
    }
    componentDidMount() {
        this.initEmp();
    }
    async initEmp() {
        let depEmp: Record<string, EmpData[]> = {};
        const employees = await sqlQuery("SELECT E_id,E.Name as E_name,D.Name as D_name FROM employee as E,department as D where E.DNo=D.dno");
        employees.data.map((employee: any) => {
            if (!depEmp[employee.D_name])
                depEmp[employee.D_name] = [{ E_id: employee.E_id, E_name: employee.E_name }];
            else
                depEmp[employee.D_name].push({ E_id: employee.E_id, E_name: employee.E_name });
            return null;
        });
        this.setState({ depEmp: depEmp, initiator: employees.data[0].E_id as string, attendees: [employees.data[0].E_id as string] });
    }
    empList(filt = "") {
        let list = [];
        for (const dep of Object.keys(this.state.depEmp)) {
            list.push(
                <optgroup label={dep} key={dep}>
                    {this.state.depEmp[dep].filter(emp => emp.E_id !== filt).map((emp, index) => {
                        return (<option value={emp.E_id} key={index}>{emp.E_name}</option>);
                    })}
                </optgroup>);
        }
        return list;

    }
    checkAttenNum(arr: string[]) {
        if (arr.length > 9) {
            this.clearAttenSelected();
            this.setAttenErrorMsg(true);
            this.setState({ attendees: [this.state.initiator], availRoom: [] as string[], availRoomFlag: false, availTime: [] as number[], availTimeFlag: false });
        }
        else {
            this.setAttenErrorMsg(false);
            this.setState({ attendees: [this.state.initiator, ...arr], availRoom: [] as string[], availRoomFlag: false, availTime: [] as number[], availTimeFlag: false });
        }
    }
    clearAttenSelected() {
        this.setAttenErrorMsg(false);
        const el = document.getElementById('addAttendees') as HTMLSelectElement;
        Array.from(el.options).map(option => option.selected = false);
    }
    setAttenErrorMsg(flag: boolean) {
        const el = document.getElementById("attenErrorMsg") as HTMLElement;
        if (flag)
            el.innerHTML = "Maximum attendees: 9";
        else
            el.innerHTML = "";
    }
    async showMeetingRoom() {
        const roomsData = await sqlQuery(`SELECT R_id FROM meeting_room where Capacity>=${this.state.attendees.length}`);
        let rooms = [] as string[];
        roomsData.data.map((room: any) => rooms.push(room.R_id));
        this.setState({ availRoom: [...rooms], availRoomFlag: true, availTime: [] as number[], availTimeFlag: false });
    }
    roomList() {
        let list = [];
        list.push(<option key={"Room ID"} hidden>Room ID</option>);
        list.push(this.state.availRoom.map((room, index) => {
            return (<option value={room} key={index}>{room}</option>)
        }));
        return list;

    }
    async showTime(roomID: string) {
        const timesData = await sqlQuery(`SELECT distinct(Time) FROM attends where AttendDate=cast(now() as date) and R_id='${roomID}';`);
        let timeFlag = Array(24).fill(true);
        timesData.data.map((room: any) => timeFlag[room.Time] = false);
        const availTime = [] as number[];
        timeFlag.map((time, index) => {
            if (time)
                availTime.push(index);
            return null;
        });
        this.setState({ availTime: [...availTime], availTimeFlag: true });
    }
    timeList() {
        let list = [];
        list.push(<option key="Available Time" hidden>Time</option>);
        list.push(this.state.availTime.map((time, index) => {
            return (<option value={time} key={index}>{`${time}點`}</option>)
        }));
        return list;
    }
    async insertMeeting() {
        const selectedRoom = (document.getElementById("availRoom") as HTMLSelectElement).value;
        const selectedTime = (document.getElementById("availTime") as HTMLSelectElement).value;
        const el = document.getElementById("insertErrorMsg") as HTMLInputElement;
        if (selectedRoom === "Room ID" || selectedTime === "Time") {
            el.innerHTML = "Forgot to choose a meeting room or free time";
            return;
        }
        let subject = (document.getElementById("meetingSubject") as HTMLInputElement).value;
        if (subject === "")
            subject = `${selectedRoom}-${selectedTime}`;
        const date = new Date();
        const meetingDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        await sqlQuery(`INSERT INTO meeting (MeetingDate,Time,Subject,E_id) values 
            ('${meetingDate}',${selectedTime},'${subject}','${this.state.initiator}')`);
        const id = (await sqlQuery(`SELECT Max(M_id) as id FROM meeting`)).data[0].id;
        for (const atten of this.state.attendees) {
            await sqlQuery(`INSERT INTO attends (E_id,M_id,R_id,AttendDate,Time) values 
            ('${atten}',${id},'${selectedRoom}','${meetingDate}',${selectedTime})`);
        }
        this.props.history.push("/");
    }
    async insertSQLMeeting() {
        const queryStr = (document.getElementById("MeetingArea") as HTMLTextAreaElement).value;
        try {
            await sqlQuery(queryStr);
            (document.getElementById("errorInsertToMeeting") as HTMLElement).innerHTML = "";
            const id = (await sqlQuery(`SELECT Max(M_id) as id FROM meeting`)).data[0].id;
            (document.getElementById("insertMeetingID") as HTMLElement).innerHTML = `M_id: ${id}`;
        }
        catch (e) {
            (document.getElementById("errorInsertToMeeting") as HTMLElement).innerHTML = e;
        }
        return;
    }
    async insertSQLAttends() {
        const queryStr = (document.getElementById("AttendsArea") as HTMLTextAreaElement).value;
        try {
            await sqlQuery(queryStr);
            (document.getElementById("errorInsertToAttends") as HTMLElement).innerHTML = "";
            this.props.history.push("/");
        }
        catch (e) {
            (document.getElementById("errorInsertToAttends") as HTMLElement).innerHTML = e;
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
                            onChange={() => this.setState({ isSwitchOn: !this.state.isSwitchOn })}
                        />
                    </Form>
                    <Form hidden={this.state.isSwitchOn}>
                        <Row>
                            <Col lg={6}><Form.Group>
                                <Form.Label>Initiator</Form.Label>
                                <Form.Control
                                    as="select"

                                    onChange={(e) => {
                                        this.clearAttenSelected();
                                        this.setState({ initiator: e.target.value, attendees: [e.target.value], availRoom: [] as string[], availRoomFlag: false, availTime: [] as number[], availTimeFlag: false })
                                    }}
                                >
                                    {this.empList()}
                                </Form.Control>
                            </Form.Group></Col>
                            <Col lg={6}><Form.Group>
                                <Form.Label>Attendees</Form.Label>
                                <span id="attenErrorMsg" className="errorMsg"></span>
                                <select id="addAttendees" className="form-control" size={10} multiple onChange={(e) => {
                                    const selectedOpts = Array.from(e.target.options).filter((option) => option.selected).map(option => option.value);
                                    this.checkAttenNum(selectedOpts);
                                }}>
                                    {this.empList(this.state.initiator)}
                                </select>
                            </Form.Group><Form.Group>
                                    <Button variant="primary" onClick={() => { this.showMeetingRoom(); }}>
                                        Show Available Meeting Rooms
                        </Button>
                                </Form.Group></Col>
                        </Row>
                        <Row>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>Available Meeting Rooms</Form.Label>
                                    <Form.Control
                                        id="availRoom"
                                        defaultValue=""
                                        as="select"
                                        disabled={!this.state.availRoomFlag}
                                        onChange={(e) => { this.showTime(e.target.value) }}
                                    >
                                        {this.roomList()}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>Available Time</Form.Label>
                                    <Form.Control
                                        id="availTime"
                                        defaultValue=""
                                        as="select"
                                        disabled={!this.state.availTimeFlag}
                                    >
                                        {this.timeList()}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control type="text" id="meetingSubject" placeholder="Default: RoomID-Time" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group>
                            <Button variant="primary" onClick={() => this.insertMeeting()}>
                                Add Meeting
                        </Button>
                            <span id="insertErrorMsg" className="errorMsg"></span>
                        </Form.Group>

                    </Form>
                    <Form hidden={!this.state.isSwitchOn}>
                        <Form.Group>
                            <Form.Label>SQL Editor (Add to Meeting)</Form.Label>
                            <Form.Control id="MeetingArea" as="textarea" rows={5} placeholder="ex: INSERT INTO meeting (MeetingDate,Time,Subject,E_id) Values ('2020-06-09',14,'discussion','A195474162')
                             "/>
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" onClick={() => this.insertSQLMeeting()}>
                                Add to Meeting
                            </Button>
                            <span id="errorInsertToMeeting" className="errorMsg"></span>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>SQL Editor (Add to Attends)</Form.Label>
                            <span id="insertMeetingID" className="errorMsg"></span>
                            <Form.Control id="AttendsArea" as="textarea" rows={5} placeholder="ex: INSERT INTO attends (E_id,M_id,R_id,AttendDate,Time) Values ('A195474162',15,'B704','2020-06-09',14),('A291653701',15,'B704','2020-06-09',14)" />
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" onClick={() => this.insertSQLAttends()}>
                                Add to Attends
                            </Button>
                            <span id="errorInsertToAttends" className="errorMsg"></span>
                        </Form.Group>
                    </Form>
                </div>
            </Layout >
        )
    }
}
