import React, { Component } from 'react'
import axios from 'axios';
import Header from './Header';
import Layout from './Layout';
interface Props {

}
interface State {
    a: string
}

class Home extends Component<Props, State> {
    state = { a: "sss" };
    async aa(str: string) {
        let response = await axios.post("http://localhost:5000/api/query", { query: str });
        console.log(response);
    }
    render() {
        this.aa("select * from department");
        return (
            <Layout>
                <div>ddd</div>
            </Layout>
        )
    }
}

export default Home
