import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Layout from './Layout';
import { sqlQuery } from "../utils/util";
import Table from 'react-bootstrap/Table';
interface Props {

}
interface State {
    tableHeader: string[],
    tableBody: any[],
    queryResult: boolean

}

export default class UseSQL extends Component<Props, State> {
    state = {
        queryResult: false,
        tableHeader: [] as string[],
        tableBody: [] as any[]
    }
    async sendQuery() {
        try {
            (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML ="";
            const query = (document.getElementById("sqlArea") as HTMLInputElement).value;
            const records = (await sqlQuery(query)).data;
            if(query.toLowerCase().includes("select"))
                this.setState({ tableHeader: Object.keys(records[0]), tableBody: records,queryResult:true });
        }
        catch (e) {
            (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = e;
            this.setState({queryResult:false });
        }

    }
    tableHeader() {
        return this.state.tableHeader.map((header, index) => <td key={index}>{header}</td>);
    }
    tableBody() {
        return this.state.tableBody.map((bodyObj: any, index) => <tr key={index}>{Object.keys(bodyObj).map((key: string, index) => <td key={index}>{bodyObj[key]}</td>)}</tr>);
    }

    render() {
        return (
            <Layout>
                <div className="padding10">
                    <Form>
                        <Form.Group>
                            <Form.Label>SQL Editor</Form.Label>
                            <Form.Control id="sqlArea" as="textarea" rows={10} placeholder={"Write down SQL commands here."}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" onClick={() => this.sendQuery()}>
                                Execute
                            </Button>
                        </Form.Group>
                        <span id="errorQueryMsg" className="errorMsg"></span>
                        <Table striped bordered hidden={!this.state.queryResult}>
                            <thead>
                                <tr>
                                    {this.tableHeader()}
                                </tr>

                            </thead>
                            <tbody>
                                {this.tableBody()}
                            </tbody>
                        </Table>
                    </Form>

                </div>
            </Layout >
        )
    }
}
