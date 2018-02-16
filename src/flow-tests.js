// @flow

import React, {type Node} from 'react'
import PureRenderCallbackComponent from './pure-render-callback-component'

type P = {
  children: () => Node,
  extraProps?: {a?: string},
}

export default class TestComponent extends PureRenderCallbackComponent<P, {}> {
  render() {
    return this.props.children()
  }
}

// $FlowExpectError
const C1 = <TestComponent />

// $FlowExpectError
const C2 = <TestComponent extraProps={{}} />

const C3 = <TestComponent>{() => {}}</TestComponent>

const C4 = <TestComponent extraProps={{}}>{() => {}}</TestComponent>

const C5 = (
  <TestComponent test="test" extraProps={{}}>
    {() => {}}
  </TestComponent>
)

const C6 = <TestComponent test="test">{() => {}}</TestComponent>
