import React, { Component } from 'react'
import Form from 'react-bootstrap/Form'
import Layout from './Layout';
import { sqlQuery } from "../utils/util";
interface EmpData {
    E_id: string,
    E_name: String
}
interface Props {

}
interface State {
    depEmp: Record<string, EmpData[]>,
    initiator: string,
    attendees: string[]
}

export default class AddMeeting extends Component<Props, State> {
    state = {
        depEmp: {} as Record<string, EmpData[]>,
        initiator: "",
        attendees: [] as string[]
    }
    componentDidMount() {
        this.initEmp();
        // this.setState({employee:await sqlQuery("SELECT E_id,E.Name as E_name,E.DNo,D.Name as D_name FROM employee as E,department as D where E.DNo=D.dno order by DNo;")})

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
    render() {
        console.log(this.state.attendees);
        return (
            <Layout>
                <div className="padding10">
                    <Form>
                        <Form.Group controlId="add_organizer">
                            <Form.Label>Initiator</Form.Label>
                            <Form.Control
                                as="select"
                                onChange={(e) => {
                                    const el= document.getElementById('addAttendees') as HTMLSelectElement;
                                    Array.from(el.options).map(option => option.selected=false);
                                    this.setState({ initiator: e.target.value, attendees: [e.target.value] })}}
                            >
                                {this.empList()}
                            </Form.Control>
                        </Form.Group>


                        <Form.Group>
                            <Form.Label>Attendees</Form.Label>
                            <select id="addAttendees" className="form-control" size={10} multiple onChange={(e) => {
                                const selectedOpts = Array.from(e.target.options).filter((option) => option.selected).map(option => option.value);
                                this.setState({ attendees: [this.state.initiator, ...selectedOpts] });
                            }}>
                                {this.empList(this.state.initiator)}
                            </select>
                        </Form.Group>
                        <Form.Group controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Example textarea</Form.Label>
                            <Form.Control as="textarea" rows={3} />
                        </Form.Group>
                    </Form>
                </div>
            </Layout>
        )
    }
}
