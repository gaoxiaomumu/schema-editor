import React from 'react';
import ReactDOM from 'react-dom';
import { Card } from 'antd';
import Schema from './jsonSchema.js'

class App extends React.Component {
  render() {
    return (
      <div className="wrapper" style={{ maxHeight: '900px' }}>
        <Schema />
      </div>
    );
  }
}

ReactDOM.render(<App name="Ykit-Starter-Antd" />, document.getElementById('app'));

// hot-reload
if (module.hot) {
  module.hot.accept();
}
