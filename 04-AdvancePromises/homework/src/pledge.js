"use strict";
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// TU CÓDIGO AQUÍ:

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

  static resolve(data) {
    if (data instanceof $Promise) {
      return data;
    }

    const promise = new $Promise(() => {});

    promise._internalResolve(data);

    return promise;
  }

  static all(data) {
    if (!Array.isArray(data)) {
      throw new TypeError();
    }
    const promesa = new $Promise((resolve, reject) => {
      const tamanio = data.length;
      let count = 0;
      let result = new Array(tamanio);
      data.forEach((e, i) => {
        if (e instanceof $Promise) {
          e.then((value) => {
            count++;
            result[i] = value;
            if (tamanio === count) {
              resolve(result);
            }
          }, reject);
        } else {
          count++;
          result[i] = e;
          if (tamanio === count) {
            resolve(result);
          }
        }
      });
    });
    return promesa;
  }
}

module.exports = $Promise;
/*------------------------------
/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
