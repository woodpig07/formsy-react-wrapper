import 'babel-polyfill'

import React, {Component, PropTypes} from 'react'
import Formsy from 'formsy-react'
import FormsyInput from './FormsyInput'

var FormsyWrapper = {}
var asyncValidationRules = {}

FormsyWrapper.addAsyncValidationRule = function (name, func) {
  asyncValidationRules[name] = func
}

class FormsyFormWrapper extends Component {

  static propTypes = {
    children: PropTypes.any
  }

  static childContextTypes = {
    formsyWrapper: PropTypes.object
  };

  constructor (props) {
    super(props)
    this.state = {
      isAsyncValid: true,   // if <FormsyWrapper.Input /> has async validator, this will change to false when component mount
      formClass: ''
    }
  }

  getChildContext () {
    return {
      formsyWrapper: {
        getAsyncValidationRules: this.getAsyncValidationRules,
        setAsyncValidationState: this.setAsyncValidationState.bind(this)
      }
    }
  }

  getAsyncValidationRules () {
    return asyncValidationRules
  }

  setAsyncValidationState (isAsyncValid) {
    // Invoke <Formsy.Form /> onInvalid() when async validation failed
    const {onInvalid, onValid} = this.props
    if (!isAsyncValid) {
      onInvalid && onInvalid()
    } else if (this.state.isSyncValid) {
      // only Invoke <Formsy.Form /> onValid() when both async/sync validation success
      onValid && onValid()
    }
    this.setState({isAsyncValid: isAsyncValid})
  }

  /* Porting <Formsy.Form /> reset() */
  reset () {
    this.refs.formsy.reset()
  }

  /* Porting <Formsy.Form /> getModel() */
  getModel () {
    return this.refs.formsy.getModel()
  }

  /* Porting <Formsy.Form /> updateInputsWithError() */
  updateInputsWithError (errors) {
    this.refs.formsy.updateInputsWithError(errors)
  }

  /* Porting <Formsy.Form /> onValid() */
  onValid () {
    const {onValid} = this.props
    const {isAsyncValid} = this.state
    // if this being invoked, the sync validation should success
    this.setState({isSyncValid: true})

    if (isAsyncValid) {
      return onValid && onValid()
    }
    // onValid && onValid()
  }

  /* Porting <Formsy.Form /> onInvalid() */
  onInvalid () {
    const {onInvalid} = this.props
    // if this being invoked, the sync validation should success
    this.setState({isSyncValid: false}, () => {
      onInvalid && onInvalid()
    })

  }

  /* Porting <Formsy.Form /> onChange() */
  onChange (currentValues, isChanged) {
    const {onChange} = this.props

    this.setState({formClass: ''})

    return onChange && onChange(currentValues, isChanged)
  }

  /* Porting <Formsy.Form /> onInvalidSubmit() */
  onInvalidSubmit (data, resetForm, invalidateForm) {
    const {onInvalidSubmit} = this.props
    this.setState({formClass: 'showFormError'})
    return onInvalidSubmit && onInvalidSubmit(data, resetForm, invalidateForm)
  }

  /* Porting <Formsy.Form /> onValidSubmit() */
  onValidSubmit (data, resetForm, invalidateForm) {
    const {onValidSubmit} = this.props
    const {isAsyncValid} = this.state
    if (isAsyncValid) {
      return onValidSubmit && onValidSubmit(data, resetForm, invalidateForm)
    }
    return false
  }

  /* Porting <Formsy.Form /> onSubmit() */
  onSubmit (data, resetForm, invalidateForm) {
    const {onSubmit} = this.props
    const {isAsyncValid} = this.state
    // Invoke <Formsy.Form /> onInvalidSubmit() when async validation failed
    if (!isAsyncValid) {
      this.onInvalidSubmit(data, resetForm, invalidateForm)
    }
    onSubmit && onSubmit(data, resetForm, invalidateForm)
  }

  render () {
    let newProps = {
      ...this.props,
      onValid: this.onValid.bind(this),
      onInvalid: this.onInvalid.bind(this),
      onChange: this.onChange.bind(this),
      onSubmit: this.onSubmit.bind(this),
      onInvalidSubmit: this.onInvalidSubmit.bind(this),
      onValidSubmit: this.onValidSubmit.bind(this),
      className: `${this.props.className || ''} ${this.state.formClass}`
    }
    return (
      <Formsy.Form {...newProps} ref='formsy'>
        {this.props.children}
      </Formsy.Form>
    )
  }
}

FormsyWrapper.Form = FormsyFormWrapper
FormsyWrapper.Input = FormsyInput

export default FormsyWrapper
