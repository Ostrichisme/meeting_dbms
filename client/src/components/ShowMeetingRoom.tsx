import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Layout from './Layout';
import { sqlQuery } from "../utils/util";
import Table from 'react-bootstrap/Table';
interface EquipmentID {
    ENo: number,
    Name: string
}
interface EquipmentDetail {
    equipments: string,
    location: string

}
interface Props{

}
interface State {
    roomEquip: Record<string, EquipmentDetail>,
    quantity: number,
    selectedEquipment: string,
    roomArr: string[],
    depArr:string[],
    equipment: EquipmentID[],
    queryFunc: string[],
    isSwitchOn: boolean,
    isInQuery: boolean,
    isExistQuery: boolean,
    tableState: tableState
}
enum tableState {
    default = 0,
    config = 1,
    sum = 2,
    inQuery = 3,
    existQuery = 4

}
export default class ShowMeetingRoom extends Component<Props, State> {
    state = {
        roomEquip: {} as Record<string, EquipmentDetail>,
        quantity: 0,
        selectedEquipment: "",
        depArr:[] as string[],
        roomArr: [] as string[],
        equipment: [] as EquipmentID[],
        queryFunc: ["Meeting Room Configuration", "SUM", "IN", "NOT IN", "EXISTS", "NOT EXISTS"],
        isSwitchOn: false,
        isInQuery: true,
        isExistQuery: true,
        tableState: tableState.default
    }
    async initEquipment() {
        const records = (await sqlQuery("select ENo,Name from equipment")).data as EquipmentID[];
        this.setState({ equipment: records });
    }
    equipList() {
        return this.state.equipment.map((equip, index) => {
            return (<option value={index + 1} key={index}>{equip.Name}</option>);
        }
        );
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
        const equipmentEL = (document.getElementById("Equipment") as HTMLSelectElement);
        const equipmentNameID = equipmentEL.value;
        const equipmentName = equipmentEL.options[equipmentEL.selectedIndex].text;
        switch (func) {
            case "0":
                try {
                    let mRoom: Record<string, EquipmentDetail> = {};
                    const records = await sqlQuery(this.getSqlStr(sql, "SELECT m.R_id,Name,Location,Quantity FROM equips eqps,equipment e,meeting_room m  where eqps.ENo=e.ENo and eqps.R_id=m.R_id"));
                    records.data.map((record: any) => {
                        if (!mRoom[record.R_id])
                            mRoom[record.R_id] = { equipments: `${record.Name}x${record.Quantity}`, location: record.Location };
                        else
                            mRoom[record.R_id].equipments += `、${record.Name}x${record.Quantity}`;
                        return null;
                    });
                    this.setState({ roomEquip: mRoom, selectedEquipment: equipmentName, tableState: tableState.config as tableState });

                } catch (e) {
                    (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = e;
                    this.setState({tableState: tableState.default as tableState });
                }
                break;
            case "1":
                try {
                    const sum = (await sqlQuery(this.getSqlStr(sql, `Select SUM(Quantity) as sum From equips Where ENo=${equipmentNameID}`))).data[0].sum as number;
                    this.setState({ quantity: sum, selectedEquipment: equipmentName, tableState: tableState.sum as tableState });

                } catch (e) {
                    (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = e;
                    this.setState({tableState: tableState.default as tableState });
                }
                break;
            case "2":
            case "3":
                try {
                    let defaultStr = `SELECT DISTINCT(R_id) FROM equips WHERE R_id in (SELECT R_id FROM equips WHERE ENo=${equipmentNameID})`;
                    let isInQuery = true;
                    if (func === "3") {
                        defaultStr = `SELECT DISTINCT(R_id) FROM equips WHERE R_id not in (SELECT R_id FROM equips WHERE ENo=${equipmentNameID})`;
                        isInQuery = false;
                    }

                    const roomID = (await sqlQuery(this.getSqlStr(sql, defaultStr)));
                    const roomArr = [] as string[];
                    roomID.data.map((room: any) => roomArr.push(room.R_id));
                    this.setState({ roomArr: roomArr, selectedEquipment: equipmentName, isInQuery: isInQuery, tableState: tableState.inQuery as tableState });

                } catch (e) {
                    (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = e;
                    this.setState({tableState: tableState.default as tableState });
                }
                break;
            case "4":
            case "5":
                try {
                    let defaultStr = `SELECT Name From department d WHERE EXISTS (SELECT * FROM meeting_room m WHERE d.DNo=m.DNo)`;
                    let isExistQuery = true;
                    if (func === "5") {
                        defaultStr = `SELECT Name From department d WHERE NOT EXISTS (SELECT * FROM meeting_room m WHERE d.DNo=m.DNo)`;
                        isExistQuery = false;
                    }

                    const depName = (await sqlQuery(this.getSqlStr(sql, defaultStr)));
                    const depArr = [] as string[];
                    depName.data.map((dep: any) => depArr.push(dep.Name));
                    this.setState({ depArr: depArr, selectedEquipment: equipmentName, isExistQuery: isExistQuery, tableState: tableState.existQuery as tableState });

                } catch (e) {
                    (document.getElementById("errorQueryMsg") as HTMLElement).innerHTML = e;
                    this.setState({tableState: tableState.default as tableState });
                }


        }
    }
    configList() {
        return Object.keys(this.state.roomEquip).map((room, index) => {
            const roomObj = this.state.roomEquip[room];
            return (
                <tr key={index}>
                    <td>{room}</td>
                    <td>{roomObj.equipments}</td>
                    <td>{roomObj.location}</td>
                </tr>
            )
        });
    }
    roomList() {
        return this.state.roomArr.map((room, index) => {
            return (
                <tr key={index}>
                    <td>{room}</td>
                </tr>
            );
        });
    }
    depList() {
        return this.state.depArr.map((dep, index) => {
            return (
                <tr key={index}>
                    <td>{dep}</td>
                </tr>
            );
        });
    }

    componentDidMount() {
        this.initEquipment();
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
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>Equipment</Form.Label>
                                    <Form.Control
                                        id="Equipment"
                                        as="select"
                                    >
                                        {this.equipList()}
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
                                    <Form.Control id="sqlArea" as="textarea" rows={10} placeholder={`ex:\nfunc1: SELECT m.R_id,Name,Location,Quantity FROM equips eqps,equipment e,meeting_room m  WHERE eqps.ENo=e.ENo and eqps.R_id=m.R_id\n\nfunc2: SELECT SUM(Quantity) as sum FROM equips WHERE ENo=1\n\nfunc3: SELECT DISTINCT(R_id) FROM equips WHERE R_id in (SELECT R_id FROM equips WHERE ENo=1)\n\nfunc4: SELECT DISTINCT(R_id) FROM equips WHERE R_id not in (SELECT R_id FROM equips WHERE ENo=1)\n\nfunc5: SELECT Name From department d WHERE EXISTS (SELECT * FROM meeting_room m WHERE d.DNo=m.DNo)\n\nfunc6: SELECT Name From department d WHERE NOT EXISTS (SELECT * FROM meeting_room m WHERE d.DNo=m.DNo)`}
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
                        <Table striped bordered hidden={this.state.tableState !== tableState.config}>
                            <thead>
                                <tr>
                                    <th>會議室</th>
                                    <th>配備</th>
                                    <th>位置</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.configList()}
                            </tbody>
                        </Table>
                        <Table striped bordered hidden={this.state.tableState !== tableState.sum}>
                            <thead>
                                <tr>
                                    <th>{`SUM(${this.state.selectedEquipment})`}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{this.state.quantity}</td>
                                </tr>
                            </tbody>
                        </Table>
                        <Table striped bordered hidden={this.state.tableState !== tableState.inQuery}>
                            <thead>
                                <tr>
                                    <th>{(this.state.isInQuery ? "有" : "沒有")}{`${this.state.selectedEquipment}的會議室`}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.roomList()}
                            </tbody>
                        </Table>
                        <Table striped bordered hidden={this.state.tableState !== tableState.existQuery}>
                            <thead>
                                <tr>
                                    <th>{(this.state.isExistQuery ? "有" : "沒有")+"會議室的部門"}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.depList()}
                            </tbody>
                        </Table>
                    </Form>

                </div>
            </Layout >
        )
    }
}
