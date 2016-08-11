import {expect} from 'chai'
import debounce from '../debounce'
var testVar, testFn
describe('debounce function', function() {
  beforeEach(function() {
    testVar = false
    testFn = function() {
      testVar = true
    }
  })

  it('should not execute function within threshhold', function() {
    debounce(testFn, 200)()
    expect(testVar).to.not.be.ok
  })

  it('should execute function after threshhold', function() {
    debounce(testFn, 200)()
    setTimeout(function() {
      expect(testVar).to.be.ok
    }, 300)
  })

  it('should execute function immediately if the third argument is set as true', function() {
    debounce(testFn, 200, true)()
    expect(testVar).to.be.ok
  })
})