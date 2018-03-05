((_w) => {
  const fn = (((_w1, _console) => {
    const commonjsGlobal = typeof _w1 !== 'undefined'
      ? _w1 : typeof global !== 'undefined'
        ? global : typeof self !== 'undefined'
          ? self : {};

    let win;

    if (typeof _w1 !== 'undefined') {
      win = _w1;
    } else {
      if (typeof commonjsGlobal !== 'undefined') {
        win = commonjsGlobal;
      } else {
        if (typeof self !== 'undefined') {
          win = self;
        } else {
          win = {};
        }
      }
    }

    const [window1, console1, _extends] = [win, _console, Object.assign];

    const CustomEvent = window1.CustomEvent;
    const Polymer = window1.Polymer;
    let reduxIdSeed = 0;

    const PolymerRedux = (store) => {
      if (!store) {
        throw new TypeError('PolymerRedux: expecting a redux store.');
      } else {
        if (!['getState', 'dispatch', 'subscribe'].every(k => typeof store[k] === 'function')) {
          throw new TypeError('PolymerRedux: invalid store object.');
        }
      }

      const subscribers = new Map();

      const getPrivateStatePath = (statePath, callerId) => {
        let arr = statePath.split('.');
        arr.splice(1, 0, callerId);
        return arr.join('.');
      };

      const bind = (element, staticProperties) => {
        const _state = store.getState();

        const {properties, bindings} = Object.keys(staticProperties).reduce((p, name) => {
          const prop = {...staticProperties[name]};

          if (Object.prototype.hasOwnProperty.call(prop, 'statePath')) {
            if (prop.private === true) {
              const orgStatePath = prop.statePath;
              prop.statePath = getPrivateStatePath(orgStatePath, element.reduxId);
              const oValue = Polymer.Path.get(_state, orgStatePath);
              Polymer.Path.set(_state, prop.statePath, oValue);
            }
            if (!prop.readOnly && prop.notify) {
              console1.warn(`PolymerRedux: <${element.constructor.is}>.${name} has "notify" enabled, two-way bindings goes against Redux's paradigm`);
            }
            p.bindings.push(name);
          }
          p.properties[name] = prop;
          return p;
        }, {properties: {}, bindings: []});

        const update = function update(state) {
          let propertiesChanged = false;
          bindings.forEach((name) => {
            const statePath = properties[name].statePath;

            const value = typeof statePath === 'function'
              ? statePath.call(element, state) : Polymer.Path.get(state, statePath);

            const changed = element._setPendingPropertyOrPath(name, value, true);
            propertiesChanged = propertiesChanged || changed;
          });
          if (propertiesChanged) {
            element._invalidateProperties();
          }
        };

        const unsubscribe = store.subscribe(() => {
          const detail = store.getState();
          update(detail);

          element.dispatchEvent(new CustomEvent('state-changed', {detail}));
        });

        subscribers.set(element, unsubscribe);
        update(store.getState());

        return update;
      };

      const unbind = (element) => {
        const off = subscribers.get(element);
        if (typeof off === 'function') {
          off();
        }
      };

      const collect = (what, which) => {
        let res = {};
        while (what) {
          res = _extends({}, what[which], res); // Respect prototype priority
          what = Object.getPrototypeOf(what);
        }
        return res;
      };

      return (parent) => {
        return class ReduxMixin extends parent {
          constructor() {
            if (!_w.ReduxCaller) {_w.ReduxCaller = {};}
            super();

            const actions = collect(this.constructor, 'actions');
            Object.defineProperty(this, '_reduxActions', {
              configurable: true,
              value: actions,
            });
            this.reduxId = this.getAttribute('redux-id') || `rdx-id-${(++reduxIdSeed)}`;
            _w.ReduxCaller[this.reduxId] = this;
          }

          connectedCallback() {
            const properties = collect(this.constructor, 'properties');
            bind(this, properties);
            super.connectedCallback();
          }

          disconnectedCallback() {
            unbind(this);
            super.disconnectedCallback();
          }

          _getActionDispatcher(action) {
            return Polymer.Path.get(window.actions || {}, action);
          }

          privateDispatch(args) {
            const {action, value} = args;
            if (action) {
              const actionDispatcher = this._getActionDispatcher(action);
              if (actionDispatcher && actionDispatcher.constructor === Function) {
                return actionDispatcher(value, this.reduxId);
              }
            } else {
              return store.dispatch(Object.assign({}, args, {callerId: this.reduxId}));
            }
          }

          dispatch(args) {
            const {action, value} = args;
            if(action) {
              const actionDispatcher = this._getActionDispatcher(action);
              if (actionDispatcher && actionDispatcher.constructor === Function) {
                return actionDispatcher(value);
              }
            } else {
              return store.dispatch(args);
            }
          }

          getState() {
            return store.getState();
          }
        };
      };
    }

    return PolymerRedux;
  })(_w, _w.console));

  _w.PolymerRedux = fn;
})(window);
