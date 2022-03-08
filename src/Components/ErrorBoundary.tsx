
import { Alert } from 'reactstrap';
import React from 'react';

function ErrorHandler({ error }) {
  return <Alert color="danger">
    <i className="fas fa-exclamation-circle me-1" />
    { error && ((error.response && error.response.data && error.response.data.message) || error.message) }
  </Alert>;
}

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorHandler error={this.state.error} />;
    }

    return this.props.children;
  }
}
