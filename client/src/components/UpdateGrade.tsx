import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Layout from './Layout';
import { sqlQuery } from "../utils/util";
import Table from 'react-bootstrap/Table';
interface EmpData {
    E_id: string,
    E_name: String
}
interface EmpDetail {
    EName: string,
    Sex: string,
    Grade: number,
    DName: string

}
interface Props extends RouteComponentProps {

}
interface State {
    depEmp: Record<string, EmpData[]>,
    empDetail: EmpDetail,
    selectedEmpID: string,
    isSelectEmp: boolean,
    isSwitchOn: boolean
}

export default class UpdateGrade extends Component<Props, State> {
    state = {
        depEmp: {} as Record<string, EmpData[]>,
        empDetail: {} as EmpDetail,
        selectedEmpID: "",
        isSelectEmp: false,
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
        this.setState({ depEmp: depEmp });
    }
    empList(filt = "") {
        let list = [];
        list.push(<option key={"Employee Name"} hidden>Select Employee...</option>);
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
    async queryGrade(id: string) {
        const grade = (await sqlQuery(`SELECT Grade FROM employee where E_id='${id}'`)).data[0].Grade as number;
        (document.getElementById("EmpGrade") as HTMLInputElement).value = grade.toString();
        const empDetail = await this.selectEmpDetail(id);
        this.setState({ isSelectEmp: true, selectedEmpID: id, empDetail: empDetail });
    }
    async selectEmpDetail(id: string) {
        return (await sqlQuery(`select E.Name as EName,Sex,Grade,D.Name as DName from employee as E,department as D where E_id='${id}' and E.DNo=D.DNo`)).data[0] as EmpDetail;
    }
    selectedEmpData() {
            return Object.values(this.state.empDetail).map((value, index) => <td key={index}>{value}</td>);
    }
    async updateGrade() {
        if (this.state.selectedEmpID === "") {
            (document.getElementById("errorUpdateMsg") as HTMLElement).innerHTML = "Please select an employee";
            return;
        }
        else
        (document.getElementById("errorUpdateMsg") as HTMLElement).innerHTML = "";
        if (!this.state.isSwitchOn) {
           
            const grade = (document.getElementById("EmpGrade") as HTMLInputElement).value;
            await sqlQuery(`
            UPDATE employee
            SET Grade=${grade}
            WHERE E_id='${this.state.selectedEmpID}'`);
        }
        else {
            const queryStr = (document.getElementById("sqlArea") as HTMLTextAreaElement).value;
            try {
                await sqlQuery(queryStr);
                (document.getElementById("errorUpdateMsg") as HTMLElement).innerHTML = "";
            }
            catch (e) {
                (document.getElementById("errorUpdateMsg") as HTMLElement).innerHTML = e;
                return;
            }

        }
        const empDetail = await this.selectEmpDetail(this.state.selectedEmpID);
        this.setState({ empDetail: empDetail });
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
                                (document.getElementById("errorUpdateMsg") as HTMLElement).innerHTML = "";
                                this.setState({ isSwitchOn: !this.state.isSwitchOn })
                            }}
                        />
                    </Form>
                    <Form>
                        <Row>
                            <Col lg={4}><Form.Group>
                                <Form.Label>Employee</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={(e) => this.queryGrade(e.target.value)}
                                >
                                    {this.empList()}
                                </Form.Control>
                            </Form.Group>
                            </Col>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>Employee Grade(5~9)</Form.Label>
                                    <Form.Control
                                        id="EmpGrade"
                                        as="input"
                                        type="number"
                                        step={1}
                                        min={5}
                                        max={9}
                                        disabled={this.state.isSwitchOn ? true : this.state.isSelectEmp ? false : true}
                                    >
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col lg={4} hidden={this.state.isSwitchOn}>
                                <Form.Label>Update Grade</Form.Label>
                                <Form.Group>
                                    <Button variant="primary" onClick={() => this.updateGrade()}>
                                        Update
                                </Button>
                                </Form.Group>
                            </Col>
                            <Col lg={4} hidden={!this.state.isSwitchOn}>
                                <Form.Group>
                                    <Form.Label>SQL Editor (Update Grade)</Form.Label>
                                    <Form.Control id="sqlArea" as="textarea" rows={8} placeholder="UPDATE employee SET Grade=7 WHERE E_id='A192671783'
                             "/>
                                </Form.Group>
                                <Form.Group>
                                    <Button variant="primary" onClick={() => this.updateGrade()}>
                                        Update
                            </Button>
                                </Form.Group>
                            </Col>
                        </Row>
                        <span id="errorUpdateMsg" className="errorMsg"></span>
                        <Table striped bordered>
                            <thead>
                                <tr>
                                    <th>姓名</th>
                                    <th>性別</th>
                                    <th>職等</th>
                                    <th>部門</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>

                                    {this.selectedEmpData()}
                                </tr>
                            </tbody>
                        </Table>
                    </Form>

                </div>
            </Layout >
        )
    }
}
