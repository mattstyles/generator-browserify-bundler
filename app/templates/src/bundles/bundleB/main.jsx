
import React from 'react'
import common from 'common/menu'


class Test extends React.Component {
    constructor( props ) {
        super( props )
    }

    render() {
        return (
            <h1>Bundle B</h1>
        )
    }
}

var el = document.createElement( 'div' )
document.body.appendChild( el )

React.render( <Test />, el )
