import React, { Component,Fragment } from 'react';
import Header from './Header';

interface Props {
    children:React.ReactNode
}
interface State {
    
}

class Layout extends Component<Props, State> {
    state = {}

    render() {
        return (
            <Fragment>
                <Header />
                {this.props.children}
            </Fragment>
        )
    }
}

export default Layout
