const initialState = {
  current: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "CURRENT":
      return {
        ...state,
        current: { valor: 1 },
      };
    default:
      return state;
  }
};

export default reducer;
