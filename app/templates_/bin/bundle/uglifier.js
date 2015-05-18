
var uglify = require( 'uglifyjs' )
var chalk = require( 'chalk' )

/**
 * Process expects to receive a message containing the code to uglify
 */
process.on( 'message', function( message ) {
    /**
     * If in debug mode then send back untouched code, otherwise smash it in
     */
    process.send({
        body: process.env.debug === 'true'
            ? message.body
            : uglify.minify( message.body, {
                fromString: true
            }).code
    })
})
