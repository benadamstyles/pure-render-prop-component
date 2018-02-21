// @flow

import React, {type Node} from 'react'
import PureRenderCallbackComponent from './pure-render-callback-component'

type PChildren = {
  children: () => Node,
  extraProps?: {a?: string},
  test?: string,
}

type PRender = {
  render: () => Node,
  extraProps?: {a?: string},
  test?: string,
}

class TestComponentChildren extends PureRenderCallbackComponent<PChildren, {}> {
  render() {
    return this.props.children()
  }
}

class TestComponentRender extends PureRenderCallbackComponent<PRender, {}> {
  render() {
    return this.props.render()
  }
}

// $FlowExpectError
const C1c = <TestComponentChildren />
// $FlowExpectError
const C1r = <TestComponentRender />

// $FlowExpectError
const C2c = <TestComponentChildren extraProps={{}} />
// $FlowExpectError
const C2r = <TestComponentRender extraProps={{}} />

const C3c = <TestComponentChildren>{() => {}}</TestComponentChildren>
const C3r = <TestComponentRender render={() => {}} />

const C4c = (
  <TestComponentChildren extraProps={{}}>{() => {}}</TestComponentChildren>
)
const C4r = <TestComponentRender extraProps={{}} render={() => {}} />

const C5c = (
  <TestComponentChildren test="test" extraProps={{}}>
    {() => {}}
  </TestComponentChildren>
)
const C5r = (
  <TestComponentRender test="test" extraProps={{}} render={() => {}} />
)

const C6c = (
  <TestComponentChildren test="test">{() => {}}</TestComponentChildren>
)
const C6r = <TestComponentRender test="test" render={() => {}} />
