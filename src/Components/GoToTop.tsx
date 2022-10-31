import React from 'react';
import {FormattedMessage} from "react-intl";

export default class GoToTop extends React.Component {
    state = {show: false};

    scrollTop(e) {
        e.preventDefault();

        window.scrollTo(0, 0);
    }

    handleScroll(e) {
        const newShow = window.scrollY > 100;
        if (newShow !== this.state.show) {
            this.setState({show: newShow});
        }
    }

    componentDidMount() {
        this.handleScroll = this.handleScroll.bind(this);
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    render() {
        if (!this.state.show) {
            return null;
        }

        return <div onClick={this.scrollTop} className="back-btn-shown">
            <span><FormattedMessage id="GO_TOP" /></span>
            <i className="fa fa-angle-up" title="Go top"/>
        </div>;
    }
}

