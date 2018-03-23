# PureRenderPropComponent

[![npm version](https://badge.fury.io/js/pure-render-prop-component.svg)](https://www.npmjs.com/package/pure-render-prop-component)
[![Build Status](https://travis-ci.org/Leeds-eBooks/pure-render-prop-component.svg?branch=master)](https://travis-ci.org/Leeds-eBooks/pure-render-prop-component)
[![Greenkeeper badge](https://badges.greenkeeper.io/Leeds-eBooks/pure-render-prop-component.svg)](https://greenkeeper.io/)

```sh
npm install --save pure-render-prop-component
# or
yarn add pure-render-prop-component
```

The [render prop pattern](https://reactpatterns.com/#render-callback) in React allows us to build highly functional components, but it doesn’t play well with how React currently manages re-rendering.

```js
import React, {Component} from 'react'

class CurrentTime extends Component {
  state = {currentTime: Date.now()}
  render() {
    return this.props.children(this.state.currentTime)
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <CurrentTime>
          {// *
          currentTime => (
            <div>
              <p>{this.props.pageTitle}</p>
              <p>{currentTime}</p>
            </div>
          )}
        </CurrentTime>
      </div>
    )
  }
}
```

Here, our `CurrentTime` component will re-render every time our `App` component renders, even if neither `CurrentTime`’s `state` nor its `props` (in this case, its `children` function) have changed.

However, changing `CurrentTime` to [inherit from `PureComponent`](https://reactjs.org/docs/react-api.html#reactpurecomponent) doesn’t help. [The React docs explain why](https://reactjs.org/docs/render-props.html#be-careful-when-using-render-props-with-reactpurecomponent): `PureComponent` compares `state` and `props`, and **only** if a property of `state` or of `props` has changed, does it re-render. In the above case, every time `App` re-renders, the render prop supplied to `CurrentTime` (marked `*`) is recreated. Two functions which look the same are still two different functions, so `CurrentTime#props.children` has changed, and `CurrentTime` re-renders.

We can solve this by, [as the React docs put it](https://reactjs.org/docs/render-props.html#be-careful-when-using-render-props-with-reactpurecomponent), defining the function “as an instance method”, in other words, moving the function out of our `App` component’s `render` method.

```js
import React, {Component, PureComponent} from 'react'

class CurrentTime extends PureComponent {
  state = {currentTime: Date.now()}
  render() {
    return this.props.children(this.state.currentTime)
  }
}

class App extends Component {
  currentTimeCallback = currentTime => (
    <div>
      <p>{this.props.pageTitle}</p>
      <p>{currentTime}</p>
    </div>
  )

  render() {
    return (
      <div>
        <CurrentTime>{this.currentTimeCallback}</CurrentTime>
      </div>
    )
  }
}
```

Now, `currentTimeCallback` is only created once. `PureComponent` compares `props` before and after the re-render of `App`, finds that the `children` function hasn’t changed, and aborts the re-render of `CurrentTime`. Performance improved!

**But there is a big problem waiting to happen.** Our `currentTimeCallback` doesn’t just depend on the `currentTime` argument passed down from our `CurrentTime` component. It also renders `App`’s `props.pageTitle`. But with the above setup, when `pageTitle` changes, `currentTimeCallback` will not re-render. It will show **the old `pageTitle`**.

I struggled with this problem, trying all sorts of horrible hacks, until I came across [this Github issue on the React repo](https://github.com/facebook/react/issues/4136), and the [suggestion](https://github.com/facebook/react/issues/4136#issuecomment-112168425) by a React developer of a possible solution. `PureRenderPropComponent` is my implementation of that solution.

## Usage

```js
import React, {Component} from 'react'
import PureRenderPropComponent from 'pure-render-prop-component'

class CurrentTime extends PureRenderPropComponent {
  state = {currentTime: Date.now()}
  render() {
    return this.props.children(this.state.currentTime, this.props.extraProps)
    // NOTE: PureRenderPropComponent also supports a prop named 'render' ☟
    return this.props.render(this.state.currentTime, this.props.extraProps)
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <CurrentTime extraProps={{pageTitle: this.props.pageTitle}}>
          {(currentTime, extraProps) => (
            <div>
              <p>{extraProps.pageTitle}</p>
              <p>{currentTime}</p>
            </div>
          )}
        </CurrentTime>
        {
          // NOTE: PureRenderPropComponent also supports a prop named 'render'
          // (instead of 'children') ☟
        }
        <CurrentTime
          extraProps={{pageTitle: this.props.pageTitle}}
          render={(currentTime, extraProps) => (
            <div>
              <p>{extraProps.pageTitle}</p>
              <p>{currentTime}</p>
            </div>
          )}
        />
      </div>
    )
  }
}
```

Now, our render prop will always re-render when, and **only** when, `CurrentTime#state.currentTime` or `App#props.pageTitle` change.

You can also pass other props into your render prop component and they will be treated in the same way.

```js
import React, {Component} from 'react'
import PureRenderPropComponent from 'pure-render-prop-component'

class CurrentTime extends PureRenderPropComponent {
  state = {currentTime: Date.now()}

  format(timestamp) {
    return String(new Date(timestamp))
  }

  render() {
    const time = this.props.format
      ? this.format(this.state.currentTime)
      : this.state.currentTime
    return this.props.children(time, this.props.extraProps)
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <CurrentTime
          format={true}
          extraProps={{pageTitle: this.props.pageTitle}}>
          {(currentTime, extraProps) => (
            <div>
              <p>{extraProps.pageTitle}</p>
              <p>{currentTime}</p>
            </div>
          )}
        </CurrentTime>
      </div>
    )
  }
}
```

Here, our render prop will also re-render when the boolean passed into `CurrentTime`’s `format` prop changes.

## Caveats & Assumptions

* `PureRenderPropComponent` assumes you will either use a `props.children` prop:

  ```js
  <RenderCallbackComponent>
    {(val, extraProps) => <Node />}
  <RenderCallbackComponent>
  ```

  or a “render prop”:

  ```js
  <RenderCallbackComponent render={(val, extraProps) => <Node />} />
  ```

  Using either one for a purpose other than [the render prop pattern](https://reactpatterns.com/#render-prop) will lead to unexpected behaviour, including but not limited to a stale UI due to missed renders.

## How does it work?

```js
shouldComponentUpdate(nextProps, nextState) {
  const {props, state} = this
  const omitKeys = ['extraProps', 'children', 'render']
  return (
    !shallowEqual(state, nextState) ||
    !shallowEqual(omit(props, omitKeys), omit(nextProps, omitKeys)) ||
    !shallowEqual(props.extraProps, nextProps.extraProps)
  )
}
```
