((_w) => {
  const {applyMiddleware, combineReducers, createStore, compose} = Redux;

  const getStateRoot = (state, callerId) => {
    let root = state;
    let target = state;
    if(callerId) {
     if(!root[callerId]) {
       root = Object.assign({}, {...state}, {[callerId]: {}});
     }
      target = root[callerId];
    }
    return {root, target};
  };

  const reducerCreator = (reducer, initialState = {}) => {
    return (state = initialState, action) => {
      let {root, target} = getStateRoot(state, action.callerId);
      reducer(target, action);
      return root;
    };
  };

  const _timestampReducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE':
        state.value = (new Date()).toLocaleString();
        break;
      default: break;
    }
    return state;
  };
  const _counterReducer = (state, action) => {
    switch (action.type) {
      case 'COUNTER-ADD':
        state.value = (state.value || 0) + action.value;
        break;
      default:
        break;
    }
    return state;
  };

  const counterReducer = reducerCreator(_counterReducer, {value: 0});
  const timestampReducer = reducerCreator(_timestampReducer);

  const middleware = (args) => {
    return next => action => {
      let returnValue = next(action);
      return returnValue;
    };
  };

  const composer1 = (args, a, b) => {
    return next => args => {
      const store = next(args);
      return store;
    };
  };


  const store = createStore(
    combineReducers({
      counter: counterReducer,
      timestamp: timestampReducer,
    }),
    compose(
      applyMiddleware(middleware),
      composer1()),
    );

  _w.actions = {
    counter: {
      add: (value, callerId) => {
        store.dispatch({
          type: 'COUNTER-ADD',
          value,
          callerId,
        });
      },
    },
  };


  _w.ReduxMixin = PolymerRedux(store);
  _w.store = store;
})(window);
