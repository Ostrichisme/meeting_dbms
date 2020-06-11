import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Layout from './Layout';
import { sqlQuery } from "../utils/util";
import Table from 'react-bootstrap/Table';
interface DepInfo {
    Name:string,
    Count:number,
    Max:number,
    Min:number,
    Avg:number
}
interface Props {

}
interface State {
    depInfo: DepInfo[],
    seniorDepArr:string[]
    queryFunc: string[],
    isSwitchOn: boolean,
    tableState: tableState
}
enum tableState {
    default = 0,
    info=1,
    senior=2

}
export default class ShowDepartment extends Component<Props, State> {
    state = {
        depInfo: [] as DepInfo[],
        seniorDepArr:[] as string[],
        queryFunc: ["Department Info", "Departments with Senior Executives"],
        isSwitchOn: false,
        tableState: tableState.default
    }
    funcList() {
        return this.state.queryFunc.map((func, index) => {
            return (<option value={index} key={index}>{func}</option>);
        }
        );
    }
    getSqlStr(sql: boolean, defaultStr: string) {
        let query = "";
        if (sql)
            query = (document.getElementById("sqlArea") as HTMLInputElement).value;
        else
            query = defaultStr;
        return query;
    }
    async execFunc(sql: boolean) {
        (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = "";
        const func = (document.getElementById("queryFunc") as HTMLSelectElement).value;
        switch (func) {
            case "0":
                try {
                    let depInfo= [] as DepInfo[];
                    const records = await sqlQuery(this.getSqlStr(sql, "SELECT d.Name,COUNT(*) as Count,MAX(Grade) as Max,MIN(Grade) as Min,AVG(Grade) as Avg FROM employee e,department d WHERE e.DNo=d.DNo GROUP BY d.Name ORDER BY Count DESC"));
                    records.data.map((record: DepInfo) => {
                        depInfo.push({Name:record.Name,Count:record.Count,Max:record.Max,Min:record.Min,Avg:parseFloat(record.Avg.toFixed(1))});
                        return null;
                    });
                    this.setState({  depInfo:depInfo,tableState: tableState.info as tableState });

                } catch (e) {
                    (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = e;
                    this.setState({tableState: tableState.default as tableState });
                }
                break;
            case "1":
                try {
                    let seniorDepArr=[] as string[];
                    const seniorDeps = (await sqlQuery(this.getSqlStr(sql, "SELECT d.Name FROM employee e,department d WHERE e.DNo=d.DNo GROUP BY d.Name HAVING Max(Grade)>=8")));
                    seniorDeps.data.map((dep:any)=>seniorDepArr.push(dep.Name as string));
                    this.setState({ seniorDepArr: seniorDepArr, tableState: tableState.senior as tableState });

                } catch (e) {
                    (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = e;
                    this.setState({tableState: tableState.default as tableState });
                }
                break;
           

        }
    }
    depInfoList() {
        
        return this.state.depInfo.map((dep, index) => {
            return (
                <tr key={index}>
                    <td>{dep.Name}</td>
                    <td>{dep.Count}</td>
                    <td>{dep.Max}</td>
                    <td>{dep.Min}</td>
                    <td>{dep.Avg}</td>
                </tr>
            )
        });
    }
    seniorList() {
        return this.state.seniorDepArr.map((dep,index)=>{
            return (
                <tr key={index}>
                    <td>{dep}</td>
                </tr>
            );
        });
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
                                this.setState({ isSwitchOn: !this.state.isSwitchOn })
                            }}
                        />
                    </Form>
                    <Form>
                        <Row>
                            <Col lg={4}><Form.Group>
                                <Form.Label>Query Function</Form.Label>
                                <Form.Control
                                    as="select"
                                    id="queryFunc"
                                >
                                    {this.funcList()}
                                </Form.Control>
                            </Form.Group>
                            </Col>
                            <Col lg={4} hidden={this.state.isSwitchOn}>
                                <Form.Label>Execute Function</Form.Label>
                                <Form.Group>
                                    <Button variant="primary" onClick={() => this.execFunc(false)}>
                                        Execute
                                </Button>
                                </Form.Group>
                            </Col>
                            <Col lg={4} hidden={!this.state.isSwitchOn}>
                                <Form.Group>
                                    <Form.Label>SQL Editor</Form.Label>
                                    <Form.Control id="sqlArea" as="textarea" rows={10} placeholder={`ex:\nfunc1: SELECT d.Name,COUNT(*) as Count,MAX(Grade) as Max,MIN(Grade) as Min,AVG(Grade) as Avg FROM employee e,department d WHERE e.DNo=d.DNo GROUP BY d.Name ORDER BY Count DESC\n\nfunc2: SELECT d.Name FROM employee e,department d WHERE e.DNo=d.DNo GROUP BY d.Name HAVING Max(Grade)>=8`}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Button variant="primary" onClick={() => this.execFunc(true)}>
                                        Execute
                            </Button>
                                </Form.Group>
                            </Col>
                        </Row>
                        <span id="errorQueryMsg" className="errorMsg"></span>
                        <Table striped bordered hidden={this.state.tableState !== tableState.info}>
                            <thead>
                                <tr>
                                    <th>部門</th>
                                    <th>員工人數</th>
                                    <th>最高職等</th>
                                    <th>最低職等</th>
                                    
                                    <th>平均職等</th>
                                </tr>
                            </thead>
                            <tbody>
                            {this.depInfoList()}
                            </tbody>
                        </Table>
                        <Table striped bordered hidden={this.state.tableState !== tableState.senior}>
                            <thead>
                                <tr>
                                    <th>有高階主管的部門</th>
                                </tr>
                            </thead>
                            <tbody>
                            {this.seniorList()}
                            </tbody>
                        </Table>

                    </Form>

                </div>
            </Layout >
        )
    }
}
