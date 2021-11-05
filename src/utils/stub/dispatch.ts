export enum ActionTypes {
  JANUS_DESTROYED = 'JANUS_DESTROYED',
  JANUS_INITIALIZED = 'JANUS_INITIALIZED',
}

type ActionCreator = (payload?: any) => {
  type: ActionTypes,
  payload?: any
}

export const action: (action: ActionTypes) => ActionCreator = (action) => (payload?: any) => ({type: action, payload})

// stub dispatch to talk to redux store
export const dispatch = (thing: string | ActionCreator) => (args?: any) =>  {
  if (typeof thing === 'function') {
    const action = thing(args)
    console.warn(`Dispatch: ${action.type} with${action.payload ? ` ${JSON.stringify(action.payload)}` : 'out a payload'}`)
  } else {
    console.error(`Dispatch: ${thing}`)
  }
}
