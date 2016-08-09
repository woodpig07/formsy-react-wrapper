import React, {Component, PropTypes} from 'react'
import Formsy from 'formsy-react'

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
      isValid: false,
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

  setAsyncValidationState (isValid) {
    this.setState({isValid: isValid})
  }

  reset () {
    this.refs.formsy.reset()
  }

  onChange (currentValues, isChanged) {
    const {onChange} = this.props
    this.setState({formClass: ''})
    return onChange && onChange(currentValues, isChanged)
  }

  onInvalidSubmit (data, resetForm, invalidateForm) {
    const {onInvalidSubmit} = this.props
    this.setState({formClass: 'showFormError'})
    return onInvalidSubmit && onInvalidSubmit(data, resetForm, invalidateForm)
  }

  onValidSubmit (data, resetForm, invalidateForm) {
    const {onValidSubmit} = this.props
    const {isValid} = this.state
    if (isValid) {
      return onValidSubmit && onValidSubmit(data, resetForm, invalidateForm)
    }
    return false
  }

  onSubmit (data, resetForm, invalidateForm) {
    const {onSubmit} = this.props
    const {isValid} = this.state
    if (isValid) {
      return onSubmit && onSubmit(data, resetForm, invalidateForm)
    }
    return false
  }

  render () {
    let newProps = {
      ...this.props,
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

export default FormsyWrapper
