var debounce = (func, threshold, execAsap) => {
  var timeout = null;

  return () => {
    var that = this;
    var args = 1 <= arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
    var delayed = () => {
      if (!execAsap) {
        func.apply(that, args)
      }
      return timeout = null
    };
    if (timeout) {
      clearTimeout(timeout)
    } else if (execAsap) {
      func.apply(that, args)
    }
    return timeout = setTimeout(delayed, threshold || 100)
  }
}

export default debounce