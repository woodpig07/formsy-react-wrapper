import React, {Component, PropTypes} from 'react'
import Formsy from 'formsy-react'

var FormsyWrapper = {}
var asyncValidationRules = {}

FormsyWrapper.addAsyncValidationRule = function (name, func) {
    return asyncValidationRules[name] = func
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
    this.state = {formClass: ''}
  }

  getChildContext () {
    console.log(this.refs.formsy)
    return {
      formsyWrapper: {
        getAsyncValidationRules: this.getAsyncValidationRules
      }
    }
  }

  getAsyncValidationRules () {
    return asyncValidationRules
  }

  componentDidMount () {
    console.log(this.refs.formsy.getModel())
  }

  notifyFormError () {
    this.setState({formClass: 'showFormError'})
  }

  reset () {
    this.refs.formsy.reset()
  }

  resetFormError () {
    this.setState({formClass: ''})
  }

  render () {
    return (
      <Formsy.Form onInvalidSubmit={::this.notifyFormError} className={`form ${this.state.formClass}`} {...this.props} ref='formsy'>
        {this.props.children}
      </Formsy.Form>
    )
  }
}

FormsyWrapper.Form = FormsyFormWrapper

export default FormsyWrapper