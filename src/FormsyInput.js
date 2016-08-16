import React, {Component, PropTypes} from 'react'
import {Decorator as FormsyElement} from 'formsy-react'
import classnames from 'classnames'
import debounce from './debounce'

// wrap async validation promise so the passed error can have information about validator name
function wrapPromise (promise, validatorName) {
  return new Promise((resolve, reject) => {
    return promise
      .then((payload) => {
        resolve(payload)
      },
      (err) => {
        reject({validatorName: validatorName, error: err})
      })   
  })
}

@FormsyElement()
class BaseInput extends Component {

  static propTypes = {
    locale: PropTypes.string,
    value: PropTypes.any,
    type: PropTypes.string,
    name: PropTypes.string,
    autoComplete: PropTypes.string,
    setValue: PropTypes.func,
    getValue: PropTypes.func,
    maxLength: PropTypes.number,
    asyncValidations: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    asyncValidationErrors: PropTypes.object,
    className: PropTypes.string,
    showRequired: PropTypes.func,
    showError: PropTypes.func,
    getErrorMessage: PropTypes.func
  };

  static contextTypes = {
    formsyWrapper: PropTypes.object
  };

  constructor (props, context) {
    super(props, context)
    this.state = {
      isValidating: false,
      responseError: null
    }
    this.debouncedHandleAsyncValidations = debounce(() => {
      this.handleAsyncValidations.call(this, this.state.fieldValue)
    }, 300)
  }

  componentDidMount () {
    if (this.props.asyncValidations) {
      this.context.formsyWrapper.setAsyncValidationState(false)
    }

  }

  handleChange (e) {
    // hide response error message if any
    this.setState({responseError: null})

    let value = e.target.value
    let {asyncValidations} = this.props

    this.props.setValue(value)
    this.setState({fieldValue: value})

    // only start asynchronous validations when synchronous validations scucess
    if (asyncValidations && this.props.isValid()) {
      this.debouncedHandleAsyncValidations()
    }
  }

  handleAsyncValidations (value) {
    if (!value) {
      return
    }
    let {asyncValidations} = this.props
    const {formsyWrapper} = this.context
    const asyncValidationRules = formsyWrapper.getAsyncValidationRules()
    let asyncValidationPromise = []

    this.setState({isValidating: true})

    if (typeof asyncValidations === 'string') {
      asyncValidations.split(',').forEach((validatorName) => {
        var validationMethod = asyncValidationRules[validatorName]
        if (validationMethod) {
          var p = wrapPromise(validationMethod(value), validatorName)
          asyncValidationPromise.push(p)
        }
      })
    } else if (typeof asyncValidations === 'object') {
      Object.keys(asyncValidations).forEach((validatorName) => {
        var validationMethod = asyncValidationRules[validatorName]
        if (validationMethod) {
          var p = wrapPromise(validationMethod(value, asyncValidations[validatorName]), validatorName)
          asyncValidationPromise.push(p)
        }
      })
    }
    return Promise.all(asyncValidationPromise)
      .then(() => {
        formsyWrapper.setAsyncValidationState(true)
        return this.setState({isValidating: false})
      })
      .catch(err => {
        var msg = this.getAsyncErrorMessage(err.validatorName)

        formsyWrapper.setAsyncValidationState(false)
        return this.setState({isValidating: false, responseError: msg})
      })
  }

  getAsyncErrorMessage (validatorName) {
    const {asyncValidationErrors, locale} = this.props
    if (asyncValidationErrors && asyncValidationErrors[validatorName]) {
      return (locale && asyncValidationErrors[validatorName][locale])
        ? asyncValidationErrors[validatorName][locale]
        : asyncValidationErrors[validatorName]
    }
    return null
  }

  render () {
    let {
      type,
      name,
      className,
      showRequired,
      showError,
      getValue,
      getErrorMessage
    } = this.props
    let classes = classnames(className, {
      'error': showError() || this.state.responseError,
      'required': showRequired(),
      'validating': this.state.isValidating
    })
    let errorMessage = showError() ? getErrorMessage() : this.state.responseError

    return (
      <div className={classes}>
        <input
          type={type || 'text'}
          name={name}
          value={getValue() || ''}
          onChange={::this.handleChange} />
        <span className='errorInfo'>{errorMessage}</span>
      </div>
    )
  }
}

/*
*
*/
export default class FormsyInput extends Component {

  static propTypes = {
    locale: PropTypes.string,
    validations: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    validationError: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    validationErrors: PropTypes.object
  }

  resetValue () {
    this.refs.baseInput.resetValue()
  }

  render () {
    let {validationError, validationErrors, locale} = this.props
    var parsedObj, newProps

    if (locale && validationErrors) {
      parsedObj = {}
      Object.keys(validationErrors).forEach((validatorName) => {
        parsedObj[validatorName] = validationErrors[validatorName][locale]
          ? validationErrors[validatorName][locale]
          : validationErrors[validatorName]
      })
      newProps = {...this.props, validationErrors: parsedObj}
      return <BaseInput {...newProps} ref='baseInput' />
    }

    if (locale && validationError) {
      if (typeof validationError === 'string') {
        parsedObj = validationError
      }
      if (typeof validationError === 'object') {
        parsedObj = validationError[locale] ? validationError[locale] : validationError.toString()
      }
      newProps = {...this.props, validationError: parsedObj}
      return <BaseInput {...newProps} ref='baseInput' />
    }

    return (
      <BaseInput
        {...this.props}
        ref='baseInput' />
    )
  }
}
