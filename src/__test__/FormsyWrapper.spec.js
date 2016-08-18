import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import React, {Component} from 'react'
import {mount, render, shallow} from 'enzyme'
import sinon from 'sinon/pkg/sinon'
import Formsy from 'formsy-react'
import FormsyWrapper from '../FormsyWrapper'

chai.use(chaiEnzyme())
const expect = chai.expect

describe('<FormsyWrapper.Form />', () => {
  it('should render <Formsy.Form /> with ref and contain no children', () => {
    const wrapper = mount(<FormsyWrapper.Form />)
    expect(wrapper.find(Formsy.Form)).to.have.lengthOf(1)
    expect(wrapper).to.have.ref('formsy')
    expect(wrapper.find('form').children()).to.have.lengthOf(0)
  })

  it('should pass appropriate props/attrs to <Formsy.Form />', () => {
    const wrapper = mount(<FormsyWrapper.Form className='form1' />)
    expect(wrapper.find(Formsy.Form).first().props()).to.contain.all.keys([
      'onValid',
      'onInvalid',
      'onChange',
      'onSubmit',
      'onValidSubmit',
      'onInvalidSubmit',
      'className'
      ])
    expect(wrapper.find(Formsy.Form).first().prop('className')).to.have.string('form1')
  })
})


describe('A simple form with <FormsyWrapper.Form /> and <FormsyWrapper.Input />', () => {

  class FormFixture extends Component {

    handleChange () {
      this.setState(this.refs.form.getModel())
    }

    reset () {
      this.refs.form.reset()
    }

    onValid () {
      console.log('onValid')
    }
    onInvalid () {
      console.log('onInvalid')
    }
    onInvalidSubmit () {
      console.log('onInvalidSubmit')
    }
    onValidSubmit () {
      console.log('onValidSubmit')
    }

    render () {
      return (
        <FormsyWrapper.Form ref='form'
          onChange={::this.handleChange}
          onValid={::this.onValid}
          onInvalid={::this.onInvalid}
          onValidSubmit={::this.onValidSubmit}
          onInvalidSubmit={::this.onInvalidSubmit}>
          <FormsyWrapper.Input name='username' required />
          <FormsyWrapper.Input name='email' required validations="isEmail" />
          <button type='submit'>Submit</button>
          <button type='button' onClick={::this.reset}>Reset</button>
        </FormsyWrapper.Form>
      )
    }
  }

  it('should render two Input component and have correct ref', () => {
    const wrapper = mount(<FormFixture />)
    expect(wrapper.find(FormsyWrapper.Input)).to.have.lengthOf(2)
    expect(wrapper).to.have.ref('form')
  })

  it('should be able to call getModel() and reset() as Formsy does', () => {
    const wrapper = mount(<FormFixture />)
    const input = wrapper.find('input[name="username"]')
    expect(input).to.have.value('')
    input.get(0).value = 'foobar'
    input.at(0).simulate('change')
    expect(wrapper).to.have.state('username').equal('foobar')
    wrapper.find('button[type="button"]').simulate('click')
    expect(input).to.have.value('')
  })

  it('should not submit if required fields are not filled', () => {
    sinon.spy(FormFixture.prototype, 'onInvalidSubmit')
    sinon.spy(FormFixture.prototype, 'onValidSubmit')
    const wrapper = mount(<FormFixture />)
    
    wrapper.find('form').simulate('submit')
    expect(FormFixture.prototype.onInvalidSubmit.called).to.be.true
    expect(FormFixture.prototype.onValidSubmit.called).to.be.false
  })

  it('should handle validation as Formsy does', () => {
    sinon.spy(FormFixture.prototype, 'onInvalid')
    sinon.spy(FormFixture.prototype, 'onValid')
    const wrapper = mount(<FormFixture />)
    const username = wrapper.find('input[name="username"]')
    const email = wrapper.find('input[name="email"]')

    username.get(0).value = 'foobar'
    username.at(0).simulate('change')
    expect(FormFixture.prototype.onInvalid.called).to.be.true

    email.get(0).value = 'foobar.com'
    email.at(0).simulate('change')
    expect(FormFixture.prototype.onInvalid.called).to.be.true

    email.get(0).value = 'foo@bar.com'
    email.at(0).simulate('change')
    expect(FormFixture.prototype.onValid.called).to.be.true
  })

  it('should add error class if validation failed', () => {
    const wrapper = mount(<FormFixture />)
    const input = wrapper.find('input[name="email"]')
    expect(input).to.have.value('')
    input.get(0).value = 'foobar'
    input.at(0).simulate('change')
    expect(wrapper.find(FormsyWrapper.Input).at(1).find('div')).to.have.className('error')
    input.get(0).value = 'foo@bar.com'
    input.at(0).simulate('change')    
    expect(wrapper.find(FormsyWrapper.Input).at(1).find('div')).to.not.have.className('error')
  })  
})

describe('A form with asynchronous validations', function () {

  FormsyWrapper.addAsyncValidationRule('isUniqueEmail', (value, optionalVal) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (value === 'foo@bar.com') {
          resolve('Success')
        } else {
          reject('Fail')
        }
      }, 100)
    })
  })

  class FormFixture extends Component {

    onValid () {
      console.log('onValid')
    }
    onInvalid () {
      console.log('onInvalid')
    }
    onInvalidSubmit () {
      console.log('onInvalidSubmit')
    }
    onValidSubmit () {
      console.log('onValidSubmit')
    }

    render () {
      return (
        <FormsyWrapper.Form
          ref='form2'
          onValid={::this.onValid}
          onInvalid={::this.onInvalid}
          onValidSubmit={::this.onValidSubmit}
          onInvalidSubmit={::this.onInvalidSubmit}>
          <FormsyWrapper.Input
            name='email'
            required
            value='fooxx@bar.com'
            validations="isEmail"
            asyncValidations='isUniqueEmail' />
          <button type='submit'>Submit</button>
        </FormsyWrapper.Form>
      )
    }
  }

  it('should invoke onInvalid() when async validation fail', function (done) {
    sinon.spy(FormFixture.prototype, 'onInvalid')
    const wrapper = mount(<FormFixture />)
    const input = wrapper.find('input')

    input.get(0).value = 'fooxx@bar.com'
    input.simulate('change')

    setTimeout(() => {
      expect(FormFixture.prototype.onInvalid.called).to.be.true
      done()
    }, 300)
  })

  it('should invoke onValid() when async validation success', function (done) {
    sinon.spy(FormFixture.prototype, 'onValid')
    const wrapper = mount(<FormFixture />)
    const input = wrapper.find('input')

    input.get(0).value = 'foo@bar.com'
    input.simulate('change')
    setTimeout(() => {
      wrapper.update()
      expect(FormFixture.prototype.onValid.called).to.be.true
      done()
    }, 3000)
  })

  it('should add error class if async validation failed', function (done) {
    const wrapper = mount(<FormFixture />)
    const input = wrapper.find('input')
    input.get(0).value = 'fooxx@bar.com'
    input.at(0).simulate('change')

    setTimeout(() => {
      expect(wrapper.find(FormsyWrapper.Input).at(0).find('div')).to.have.className('error')
      done()
    }, 5000)
  })  

  it('should not have error class if async validation success', function (done) {
    const wrapper = mount(<FormFixture />)
    const input = wrapper.find('input')
    input.get(0).value = 'foo@bar.com'
    input.at(0).simulate('change')

    setTimeout(() => {
      expect(wrapper.find(FormsyWrapper.Input).at(0).find('div')).to.not.have.className('error')
      done()
    }, 5000)
  })  
})