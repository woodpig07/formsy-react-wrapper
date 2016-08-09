var debounce = (func, threshold, execAsap) => {
  var timeout = null

  return () => {
    var that = this
    var args = arguments.length >= 1 ? Array.prototype.slice.call(arguments, 0) : []
    var delayed = () => {
      if (!execAsap) {
        func.apply(that, args)
      }
      timeout = null
      return timeout
    }
    if (timeout) {
      clearTimeout(timeout)
    } else if (execAsap) {
      func.apply(that, args)
    }
    timeout = setTimeout(delayed, threshold || 100)
    return timeout
  }
}

export default debounce
