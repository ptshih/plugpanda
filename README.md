# Configuration

[Configuration](CONFIGURATION.md)

# Todo

[Todo](TODO.md)

# Known Issues

#### 2015-01-08

None

# How It Works

Based on React and Flux.

## Redux Three Principles

#### Single source of truth

**The state of your whole application is stored in an object tree within a single store.**

This makes it easy to create universal apps, as the state from your server can be serialized and hydrated into the client with no extra coding effort. A single state tree also makes it easier to debug or introspect an application; it also enables you to persist your app’s state in development, for a faster development cycle. Some functionality which has been traditionally difficult to implement - Undo/Redo, for example - can suddenly become trivial to implement, if all of your state is stored in a single tree.

#### State is read-only

**The only way to mutate the state is to emit an action, an object describing what happened.**

This ensures that neither the views nor the network callbacks will ever write directly to the state. Instead, they express an intent to mutate. Because all mutations are centralized and happen one by one in a strict order, there are no subtle race conditions to watch out for. As actions are just plain objects, they can be logged, serialized, stored, and later replayed for debugging or testing purposes.

#### Changes are made with pure functions

**To specify how the state tree is transformed by actions, you write pure reducers.**

Reducers are just pure functions that take the previous state and an action, and return the next state. Remember to return new state objects, instead of mutating the previous state. You can start with a single reducer, and as your app grows, split it off into smaller reducers that manage specific parts of the state tree. Because reducers are just functions, you can control the order in which they are called, pass additional data, or even make reusable reducers for common tasks such as pagination.

## Data Flow

Redux architecture revolves around a strict unidirectional data flow.

This means that all data in an application follows the same lifecycle pattern, making the logic of your app more predictable and easier to understand. It also encourages data normalization, so that you don't end up with multiple, independent copies of the same data that are unaware of one another.

1. You call `store.dispatch(action)`

You can call store.dispatch(action) from anywhere in your app, including components and XHR callbacks, or even at scheduled intervals.

2. The Redux store calls the reducer function you gave it.

3. The Redux store saves the complete state tree returned by the reducer.

## Component

A standard [React Component](https://facebook.github.io/react/docs/component-api.html)

- Not allowed to interact directly with the Store
- Communicates with the Store via Actions and Property Callbacks

## Container Component

A special Component that is allowed to interface with the Store.

- Subscribes to change events from a Store
- Propagates Store changes to child Components as properties

## Dispatcher

A standard [Flux Dispatcher](https://facebook.github.io/flux/docs/dispatcher.html)

It’s important to note that you’ll only have a single dispatcher in an application.

## Store

Based on a [Flux](https://facebook.github.io/flux/docs/overview.html) store and inspired by [Redux](http://redux.js.org/docs/introduction/ThreePrinciples.html).

It’s important to note that you’ll only have a single store in an application. When you want to split your data handling logic, you’ll use reducer composition instead of many stores.

- Holds application state
- Emits changes to all Containers that are subscribed
- Allows access to state via `getState(property)`
- Allows state to be updated via `dispatch(action)`
- Registers listeners via `subscribe(listener)`

## Action

Actions are payloads of information that send data from your application to your store. They are the only source of information for the store. You send them to the store using `store.dispatch()`.

## Reducers

Inspired by [Redux Reducers](http://redux.js.org/docs/basics/Reducers.html)

Things you should never do inside a reducer:

- Mutate its arguments
- Perform side effects like API calls and routing transitions
- Calling non-pure functions, e.g. Date.now() or Math.random()
