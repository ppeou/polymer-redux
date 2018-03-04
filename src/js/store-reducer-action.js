((_w) => {
  const counter = (state = { value: 0 }, action) => {
    switch (action.type) {
      case 'COUNTER-ADD':
        state.value += action.value;
        return state;
      default:
        return state;
    }
  };

  const store = Redux.createStore(Redux.combineReducers({ counter }));

  _w.actions = {
    counter: {
      add: (value) => {
        store.dispatch({
          type: 'COUNTER-ADD',
          value,
        });
      },
    },
  };


  _w.ReduxMixin = PolymerRedux(store);
})(window);
