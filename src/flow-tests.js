// @flow

import React, {type Node} from 'react'
import PureRenderPropComponent from './pure-render-prop-component'

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

type PNoExtraProps = {
  children: () => Node,
  test?: string,
}

class TestComponentChildren extends PureRenderPropComponent<PChildren, {}> {
  render() {
    return this.props.children()
  }
}

class TestComponentRender extends PureRenderPropComponent<PRender, {}> {
  render() {
    return this.props.render()
  }
}

class TestComponentNoExtraProps extends PureRenderPropComponent<
  PNoExtraProps,
  {}
> {
  render() {
    return this.props.children()
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
