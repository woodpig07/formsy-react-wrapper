# formsy-react-wrapper

Added a wrapper to [`formsy-react`](https://github.com/christianalfoni/formsy-react) to have asynchronous validations and translations for error messages.

## How to use

**To register asynchronous validator**

The validator function has to return a promise.

```
import FormsyWrapper from 'formsy-react-wrapper'
import request from 'superagent'

FormsyWrapper.addAsyncValidationRule('isUniqueEmail', (value, optionalVal) => {
  return new Promise((resolve, reject) => {
    request
      .post('/api/usercheck')
      .send({email: value})
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          reject('check failed')
        } else {
          resolve('check ok')
        }
      })
  })
})
```

**It provides an input component to use with wrapped form component**

```
import React, {Component} from 'react'
import FormsyWrapper from 'formsy-react-wrapper'

class App extends Component {
  render () {
    return (
      <FormsyWrapper.Form className='form'>
        <FormsyWrapper.Input
          name='email'
          validations='isEmail'                      // react-formsy API
          validationError='This is not an email!'    // react-formsy API
          asyncValidations='isUniqueEmail'           // register asynchronous validator name here
          asyncValidationErrors={{isUniqueEmail: 'Email has to be unique'}}  // for failed async validation error message
          required />
      </FormsyWrapper.Form>
    )
  }
}
```

**Error message can have translations by locale**

```
<FormsyWrapper.Input
  validationError={{en: 'This is not an email!', zh: '非email格式'}}
  asyncValidations='isUniqueEmail'
  asyncValidationErrors={{isUniqueEmail: {en: 'Email has to be unique', zh: 'email必须是唯一的'}}}
  locale={this.state.locale}   // `locale` should be either `en` or `zh`
  required />
```

## Example

**run example locally**
```
npm run example

// Check http://localhost:8080/
```

Or see [demo](https://woodpig07.github.io/formsy-react-wrapper/)

## API

formsy-react-wrapper posts the [Formsy.Form API](https://github.com/christianalfoni/formsy-react/blob/master/API.md) to `FormsyWrapper.Form`, you can use them in the same way.

**onValid()**

**onValidSubmit()**

These will be triggered only when both synchronous and asynchronous validation success


**onInvalid()**

**onInvalidSubmit()**

These will be triggered when either synchronous or asynchronous validation fails


**FormsyWrapper.addAsyncValidationRule(name, func)**

Adding async validation rules, the second parameter function must return a promise.
Example see [how to use](#how-to-use) section.

**FormsyWrapper.Form**

Use this instead of `Formsy.Form`. Example see [how to use](#how-to-use) section.

**FormsyWrapper.Input**

Must be used with `<FormsyWrapper.Form />`. Example see [how to use](#how-to-use) section.

**To register non-async valiation**

Call [`Formsy.addValidationRule(name, ruleFunc)`](https://github.com/christianalfoni/formsy-react/blob/master/API.md#formsyaddvalidationrulename-rulefunc) directly.

## TODO
- add more tests
- maybe a HOC method so that we add async validation to other form components.
