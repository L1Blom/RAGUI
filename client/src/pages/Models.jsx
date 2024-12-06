import React from 'react';
import { Component } from 'react';
import AsyncSelect from 'react-select/async'
import Navbar from '../components/Navbar';
import myConfig from '../components/config';
class Models extends Component {

  state = {
    inputValue: '',
    selectedOption: '',
    cleareble: false,
    data: 'Select value from dropdown',
    models: []
  }    

  invoke_model(model) {
    this.setState({ data: 'Setting model' })
    async function fetchData(model) {
      let api = `${myConfig.API}/prompt/${myConfig.Project}/model?model=`+model
      const response = await fetch(`${api}`);
      return await response.text()
    }
    fetchData(model).then(data => { this.setState({ data: data}) });
  }

  componentDidMount() {
    let api = `${myConfig.API}/prompt/${myConfig.Project}/modelnames`

    fetch(`${api}`)
      .then(res => res.json())
        .then(data => 
          {
            this.setState({
                models: data
            })
        })
   }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption.value });
    this.invoke_model(selectedOption.value)
  }
  
  render() {
    //let options = this.state.cars.map(function (car) {
    //  return { value: car.make, label: car.make, image: car.link };
    //})
    let options = this.state.models.map(function (model) { 
      return { value: model, label: model };  
    });
    
    return (
      <div>
      <Navbar />
      <AsyncSelect
          className='select-search'
          value={this.state.selectedOption}
          onChange={this.handleChange}
          cleareble={this.state.cleareble}
          defaultOptions={options}
          formatOptionLabel={model => (
             <div className="car-option">
               <span>{model.label}</span>
             </div>
          )} />
        <div className="container pt-5">
          <div>{this.state.data.toString()}</div>
        </div>
      </div>
    );
   }
  };


export default Models;