// Shims and polyfills.
require('es5-shim')
require('es5-shim/es5-sham')
require('es6-shim')
require('babel-polyfill')

import React, {Component} from 'react'
import {render} from 'react-dom'
import FormsyWrapper from '../src/FormsyWrapper'
import FormsyInput from '../src/FormsyInput'

require('./main.styl')

FormsyWrapper.addAsyncValidationRule('isUniqueUser', (value, optionalVal) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('isUniqueUser')

    }, 2000)
  })
})

class App extends Component {

  onFormSubmit (formData) {
    console.log(formData)
  }

  render () {
    return (
      <FormsyWrapper.Form onValidSubmit={::this.onFormSubmit}>
        <FormsyInput
          name='username'
          asyncValidations='isUniqueUser'
          asyncValidationErrors={{isUniqueUser: 'username has to be unique'}}
          required />
        <button type='submit' >submit</button>
      </FormsyWrapper.Form>
    )
  }
}

render(<App />, document.getElementById('app'))