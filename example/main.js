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
      resolve('isUniqueUser')
    }, 2000)
  })
})

FormsyWrapper.addAsyncValidationRule('isUniqueEmail', (value, optionalVal) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('isUniqueEmail')
    }, 2000)
  })
})

class App extends Component {

  constructor (props) {
    super(props)
    this.state = {
      locale: 'en'
    }
  }

  onForm1Submit (formData) {
    this.setState({form1Result: 'validated data!'})
  }

  onForm2Submit (formData) {
    this.setState({form2Result: 'validated data!'})
  }

  onForm3Submit (formData) {
    this.setState({form3Result: 'validated data!'})
  }

  handleClick () {
    let {locale} = this.state
    locale = locale === 'en' ? 'zh' : 'en'
    this.setState({locale: locale})
  }

  render () {
    return (
      <div className='container'>
        <section>
          <h2>Success asynchronous validation</h2>
          <FormsyWrapper.Form onValidSubmit={::this.onForm1Submit} className='form'>
            <div className='form-item'>
              <label>username</label>
              <FormsyInput
                name='username'
                validations='isAlpha'
                validationError='Username has to be letter only!'
                asyncValidations='isUniqueUser'
                asyncValidationErrors={{isUniqueUser: 'username has to be unique'}}
                required />
            </div>
            <button type='submit' >submit</button>
            {this.state && this.state.form1Result}
          </FormsyWrapper.Form>
        </section>
        <section>
          <h2>Failed asynchronous validation</h2>
          <FormsyWrapper.Form onValidSubmit={::this.onForm2Submit} className='form'>
            <div className='form-item'>
              <label>user email</label>
              <FormsyInput
                name='email'
                validations='isEmail'
                validationError='This is not an email!'
                asyncValidations='isUniqueEmail'
                asyncValidationErrors={{isUniqueEmail: 'Email has to be unique'}}
                required />
            </div>
            <button type='submit' >submit</button>
            {this.state && this.state.form2Result}
          </FormsyWrapper.Form>
        </section>
        <section>
          <h2>Failed asynchronous validation and translation setup</h2>
          <span>click button to change locale to <button type='text' onClick={::this.handleClick}>{this.state.locale === 'en' ? 'zh' : 'en'}</button></span>
          <FormsyWrapper.Form onValidSubmit={::this.onForm3Submit} className='form'>
            <div className='form-item'>
              <label>user email</label>
              <FormsyInput
                name='email'
                validations='isEmail'
                validationError={{en: 'This is not an email!', zh: '非email格式'}}
                asyncValidations='isUniqueEmail'
                asyncValidationErrors={{isUniqueEmail: {en: 'Email has to be unique', zh: 'email必须是唯一的'}}}
                locale={this.state.locale}
                required />
            </div>
            <button type='submit' >submit</button>
            {this.state && this.state.form3Result}
          </FormsyWrapper.Form>
        </section>
      </div>
    )
  }
}

render(<App />, document.getElementById('app'))
