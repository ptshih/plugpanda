# How It Works

Based on React and Flux.

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

## Fetch Mixin

TBD


# Todo
- improve error handling
- multiple active sessions
- power is reduced status???
- session override mode to not stop when hitting limit


# Known Issues
- none
