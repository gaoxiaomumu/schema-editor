import React from 'react';
import { Input, Row, Col, Form, Select, Checkbox, Button, Icon, Modal } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import _ from 'underscore';


const product = {
  title: 'Product',
  type: 'object',
  properties: {
    id: {
      description: 'The unique identifier for a product',
      type: 'number'
    },
    name: {
      type: 'string'
    },
    price: {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      },
      minItems: 1,
      uniqueItems: true
    },
    array: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          length: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' }
        }
      },
      minItems: 1,
      uniqueItems: true
    },
    dimensions: {
      type: 'object',
      properties: {
        length: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' }
      },
      required: ['length', 'width', 'height']
    }
  },
  required: ['id', 'name', 'price']
};

function checkJsonSchema(json) {
  let newJson = Object.assign({}, json);
  if (_.isUndefined(json.type) && _.isObject(json.properties)) {
    newJson.type = 'object';
  }

  return newJson;
}

// const mapping = (name, data, changeHandler) => {
//   return {
//     string: <SchemaString onChange={changeHandler} ref={name} data={data} />,
//     number: <SchemaNumber onChange={changeHandler} ref={name} data={data} />,
//     array: <SchemaArray onChange={changeHandler} ref={name} data={data} />,
//     object: <SchemaObject onChange={changeHandler} ref={name} data={data} />,
//     boolean: <SchemaBoolean onChange={changeHandler} ref={name} data={data} />
//   }[data.type];
// };

const mapping = (name, data, changeHandler) => {

  switch(data.type) {
 
    case 'array':
      return <SchemaArray onChange={changeHandler} ref={name} data={data} />;
    break;
    case 'object':
      return <SchemaObject onChange={changeHandler} ref={name} data={data} />;
    break;
    default:
      return <AdvModal onChange={changeHandler} name={name} data={data}/>
      // return <SchemaOther dataSource={data}/>
  }

}

class AdvModal extends React.Component {
  constructor(props) {
    super(props);
  }

  state = { visible: false }
  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = (e) => {
    
    this.setState({
      visible: false,
    });
  }
  handleCancel = (e) => {
    
    this.setState({
      visible: false,
    });
  }

  mapping = (name, data, changeHandler) => {
    
    return {
      string: <SchemaString onChange={changeHandler} ref={name} data={data} />,
      number: <SchemaNumber onChange={changeHandler} ref={name} data={data} />,
      array: <SchemaArray onChange={changeHandler} ref={name} data={data} />,
      object: <SchemaObject onChange={changeHandler} ref={name} data={data} />,
      boolean: <SchemaBoolean onChange={changeHandler} ref={name} data={data} />
    }[data.type];
  } 

  render() {
    const { data, name } = this.props
    return (
      <div>
        <Button onClick={this.showModal}>高级</Button>
        <Modal
          title="Basic Modal"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
        
            {this.mapping(name, data)}
          
        </Modal>
      </div>
    )
  }
}

class SchemaObject extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.propsToState(props);
  }

  propsToState = props => {
    var data = props.data;
    data.properties = data.properties || {};
    data.required = data.required || [];
    data.propertyNames = [];
    // convert from object to array
    data.properties = Object.keys(data.properties).map(function(name) {
      data.propertyNames.push(name);
      var item = data.properties[name];
      return item;
    });
    return data;
  };
  componentDidMount() {}

  componentWillReceiveProps(newProps) {
    this.setState(this.propsToState(newProps));
  }

  deleteItem = (event, index) => {
    var requiredIndex = this.state.required.indexOf(this.state.propertyNames[index]);
    if (requiredIndex !== -1) {
      this.state.required.splice(requiredIndex, 1);
    }
    this.state.properties.splice(index, 1);
    this.state.propertyNames.splice(index, 1);
    this.setState(this.state);
  };
  changeItem = (value, name, index) => {
    if (name == 'type') {
      this.state.properties[index].type = value;
    } else if (name == 'field') {
      this.state.propertyNames[index] = value;
    }
    this.setState(this.state);
  };
  changeRequired = (name, event) => {
    if (event.target.checked) this.state.required.push(name);
    else {
      var i = this.state.required.indexOf(name);
      this.state.required.splice(i, 1);
    }
    this.setState(this.state);
  };
  change = event => {
    this.state[event.target.name] = event.target.checked;
    this.setState(this.state);
  };
  changeText = (value, name, index) => {
    this.state.properties[index][name] = value;
    this.setState(this.state);
  };
  onChange = () => {
    this.props.onChange();
    this.trigger('change');
  };
  componentDidUpdate = () => {
    this.onChange();
  };
  add = () => {
    this.state.properties.push({ name: '', type: 'string' });
    this.setState(this.state);
  };
  export = () => {
    var self = this;
    var properties = {};
    Object.keys(this.state.properties).forEach((index) => {
      //var name = self.state.properties[index].name;
      var name = this.state.propertyNames[index];
      
      if (typeof this.refs['item' + index] != 'undefined' && name.length > 0) {
        properties[name] = this.refs['item' + index].export();
      } else {
        properties[name] = this.state.properties[index]
      }
        
    });
    return {
      type: 'object',
      properties: properties,
      required: this.state.required.length ? this.state.required : undefined
    };
  };
  on = (event, callback) => {
    this.callbacks = this.callbacks || {};
    this.callbacks[event] = this.callbacks[event] || [];
    this.callbacks[event].push(callback);

    return this;
  };
  trigger = event => {
    if (this.callbacks && this.callbacks[event] && this.callbacks[event].length) {
      for (var i = 0; i < this.callbacks[event].length; i++) {
        this.callbacks[event][i]();
      }
    }

    return this;
  };

  render() {
    var self = this;
    console.log(this.state);
    var optionFormStyle = {
      paddingLeft: '25px',
      paddingTop: '4px'
    };
    var requiredIcon = {
      fontSize: '1em',
      color: 'red',
      fontWeight: 'bold',
      paddingLeft: '5px'
    };
    var fieldStyle = {
      paddingBottom: '10px'
    };
    var objectStyle = {
      borderLeft: '2px dotted gray',
      paddingLeft: '8px',
      paddingTop: '6px',
      marginLeft: '20px',
      marginTop: '60px'
    };
    var typeSelectStyle = {
      marginLeft: '5px'
    };
    var deletePropStyle = {
      border: '1px solid black',
      padding: '0px 4px 0px 4px',
      pointer: 'cursor'
    };
    return (
      <div style={objectStyle}>
        {this.state.properties.map((value, index) => {
          var name = self.state.propertyNames[index];
          var copiedState = JSON.parse(JSON.stringify(this.state.properties[index]));
          var optionForm = mapping('item' + index, copiedState, this.onChange);
          return (
            <Row data-index={index} key={index}>
              <Col span={4} className ="col-item">
                <Input
                  onChange={e => this.changeItem(e.target.value, 'field', index)}
                  value={name}
                />
              </Col>
              <Col span={2} className ="col-item">
                <Select
                  style={typeSelectStyle}
                  onChange={e => this.changeItem(e, 'type', index)}
                  value={value.type}
                >
                  <Option value="string">string</Option>
                  <Option value="number">number</Option>
                  <Option value="array">array</Option>
                  <Option value="object">object</Option>
                  <Option value="boolean">boolean</Option>
                </Select>
              </Col>
              <Col span={2} className ="col-item">
                <span style={requiredIcon}>*</span>
                <Checkbox
                  onChange={e => this.changeRequired(name, e)}
                  checked={this.state.required.indexOf(name) != -1}
                >
                  必要
                </Checkbox>
              </Col>
              <Col span={4} className ="col-item">
                <Input
                  placeholder="默认值"
                  value={value.default}
                  onChange={e => this.changeText(e.target.value, 'default', index)}
                />
              </Col>
              <Col span={4} className ="col-item">
                <TextArea
                  placeholder="备注"
                  value={value.description}
                  onChange={e => this.changeText(e.target.value, 'description', index)}
                />
              </Col>
              <Col span={1} className ="col-item">
                <span onClick={e => this.deleteItem(e, index)}>
                  <Icon type="delete" />
                </span>
              </Col>
              <div style={optionFormStyle}>{optionForm}</div>
            </Row>
          );
        })}
        <Button onClick={this.add} className="add-btn">再添加一项</Button>
      </div>
    );
  }
}

class SchemaString extends React.Component {
  export = () => {
		return {
			type: 'string'
		};
	}
  render() {
    return <div>String</div>;
  }
}

class SchemaInt extends React.Component {
  render() {
    return <div>SchemaInt</div>;
  }
}

class SchemaArray extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.data;
  }

  change = event => {
    this.state.items.type = event;
    this.setState(this.state);
  };
  export = () => {
    console.log(this.refs['items'])
    return {
      items: _.isUndefined(this.refs['items']) ? {} : this.refs['items'].export(),
      minItems: this.state.minItems,
      maxItems: this.state.maxItems,
      uniqueItems: this.state.uniqueItems ? true : undefined,
      format: this.state.format,
      type: 'array'
    };
  };
  componentDidUpdate = () => {
    this.onChange();
  };
  onChange = () => {
    this.props.onChange();
  };

  render() {
    var self = this;
    var optionFormStyle = {
      paddingLeft: '25px',
      paddingTop: '8px'
    };
    this.state.items = this.state.items || { type: 'string' };
    var optionForm = mapping('items', this.state.items, this.onChange);
    return (
      <div style={{ marginTop: '60px' }}>
        <div className = "array-item-type">
          Items Type:
          <Select name="itemtype" onChange={e => this.change(e)} value={this.state.items.type}>
            <Option value="string">string</Option>
            <Option value="number">number</Option>
            <Option value="array">array</Option>
            <Option value="object">object</Option>
            <Option value="boolean">boolean</Option>
          </Select>
        </div>
        <div style={optionFormStyle}>{optionForm}</div>
      </div>
    );
  }
}

class SchemaNumber extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.data;
  }

  export = () => {
		var o = JSON.parse(JSON.stringify(this.state));
		o.type = 'number';
		delete o.name;
		return o;
	}
  render() {
    return <div>SchemaNumber</div>;
  }
}

class SchemaBoolean extends React.Component {
  export = () => {
		return {
			type: 'boolean',
			format: 'checkbox'
		}
	}
  render() {
    return <div>SchemaBoolean</div>;
  }
}

class jsonSchema extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  onChange = (value, item, index) => {
    console.log(value, item, index);
  };

  handleSubmit = e => {};
  

  getValue = () => {
    console.log(this.refs.object.export())
		return this.export();
  }
  
  export = (e) => {
    console.log(e)
  }

  render() {
    return (
      <div>
        <SchemaObject onChange={this.onChange} ref='object' data={product} onExport={this.export}/>
        <Button onClick={this.getValue}>导出</Button>
      </div>
    );
  }
}

export default jsonSchema;
