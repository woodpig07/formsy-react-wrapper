import React, {Component, PropTypes} from 'react'
import {Decorator as FormsyElement} from 'formsy-react'
import classnames from 'classnames'

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
      responseError: null
    }
  }

  handleChange (e) {
    // hide response error message if any
    this.setState({responseError: null})

    let value = e.target.value
    let {asyncValidations} = this.props

    if (asyncValidations) {
      const {formsyWrapper} = this.context
      const asyncValidationRules = formsyWrapper.getAsyncValidationRules()
      let asyncValidationPromise = []

      if (typeof asyncValidations === 'string') {
        asyncValidations.split(',').forEach((validatorName) => {
          var validationMethod
          if (validationMethod = asyncValidationRules[validatorName]) {
            asyncValidationPromise.push(validationMethod(value))
          }
        })
      } else if (typeof asyncValidations === 'object') {
        Object.keys(asyncValidations).forEach((validatorName) => {
          var validationMethod
          if (validationMethod = asyncValidationRules[validatorName]) {
            asyncValidationPromise.push(validationMethod(value, asyncValidations[validatorName]))
          }
        })
      }
      return Promise.all(asyncValidationPromise)
        .then(() => {
          return this.props.setValue(value)
        })
        .catch(err => {
          console.log(err)
          err = this.getAsyncErrorMessage(err)
            ? this.getAsyncErrorMessage(err)
            : err

          return this.setState({responseError: err})
        })
    }
    return this.props.setValue(value)
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
      locale,
      className,
      getValue,
      showRequired,
      showError,
      getErrorMessage,
      placeholder
    } = this.props
    let classes = classnames(className, {'error': showError() || this.state.responseError, 'required': showRequired()})
    let errorMessage = showError() ? getErrorMessage() : this.state.responseError

    return (
      <div className={classes}>
        <input
          type={type || 'text'}
          name={name}
          onChange={::this.handleChange}/>
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

  constructor (props) {
    super(props)
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
      return <BaseInput {...newProps} ref='baseInput'/>
    }

    if (locale && validationError) {
      if (typeof validationError === 'string') {
        parsedObj = validationError
      }
      if (typeof validationError === 'object') {
        parsedObj = validationError[locale] ? validationError[locale] : validationError.toString()
      }
      newProps = {...this.props, validationError: parsedObj}
      return <BaseInput {...newProps} ref='baseInput'/>
    }

    return (
      <BaseInput
      {...this.props}
      ref='baseInput'/>
    )
  }
}
