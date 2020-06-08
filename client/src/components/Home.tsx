import React, { Component } from 'react'
import Layout from './Layout';
interface Props {

}
interface State {
    a: string
}

class Home extends Component<Props, State> {
    state = { a: "sss" };
    render() {
        return (
            <Layout>
                <div className="container-fluid">ss</div>
            </Layout>
        )
    }
}

export default Home
