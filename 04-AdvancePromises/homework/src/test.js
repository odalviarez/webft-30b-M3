class $Promise {
  constructor(executor) {
    this._state = "pending";
    this._value = undefined;
    this._handlerGroups = [];

    if (typeof executor !== "function") {
      throw new TypeError(`executor:${executor} is not a function`);
    }

    executor(
      (value) => this._internalResolve(value), //Se puede hacer con this._internalResolve.bind(this) y evitamos las => function
      (value) => this._internalReject(value)
    );
  }

  _internalResolve(data) {
    if (this._state === "pending") {
      this._state = "fulfilled";
      this._value = data;
      this._callHandlers();
    }
  }
  _internalReject(data) {
    if (this._state === "pending") {
      this._state = "rejected";
      this._value = data;
      this._callHandlers();
    }
  }

  _callHandlers() {
    while (this._handlerGroups.length > 0) {
      let current = this._handlerGroups.shift();

      if (this._state === "fulfilled") {
        if (current.successCb) {
          try {
            const result = current.successCb(this._value);
            if (result instanceof $Promise) {
              result.then(
                (value) => current.downstreamPromise._internalResolve(value), //Se puede hacer con this._internalResolve.bind(this) y evitamos las => function
                (value) => current.downstreamPromise._internalReject(value)
              );
            } else {
              current.downstreamPromise._internalResolve(result);
            }
          } catch (err) {
            current.downstreamPromise._internalReject(err);
          }
        } else {
          current.downstreamPromise._internalResolve(this._value);
        }
      }

      if (this._state === "rejected") {
        if (current.errorCb) {
          try {
            const result = current.errorCb(this._value);
            if (result instanceof $Promise) {
              result.then(
                (value) => current.downstreamPromise._internalResolve(value), //Se puede hacer con this._internalResolve.bind(this) y evitamos las => function
                (value) => current.downstreamPromise._internalReject(value)
              );
            } else {
              current.downstreamPromise._internalResolve(result);
            }
          } catch (err) {
            current.downstreamPromise._internalReject(err);
          }
        } else {
          current.downstreamPromise._internalReject(this._value);
        }
      }
    }
  }

  then(successCb, errorCb) {
    const downstreamPromise = new $Promise(() => {});

    //if (typeof successCb !== "function") successCb = false;
    //if (typeof errorCb !== "function") errorCb = false;
    this._handlerGroups.push({
      successCb: typeof successCb === "function" ? successCb : false,
      errorCb: typeof errorCb === "function" ? errorCb : false,
      downstreamPromise: downstreamPromise,
    });
    if (this._state !== "pending") this._callHandlers();

    return downstreamPromise;
  }

  catch(errorCb) {
    return this.then(null, errorCb);
  }

  resolve() {  }

}


function noop() {}
let test = new $Promise (noop)
    console.log(typeof test.resolve);
    