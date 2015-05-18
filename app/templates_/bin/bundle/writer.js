
var path = require( 'path' )
var fs = require( 'fs' )
var EventEmitter = require( 'events' )
var util = require( 'util' )
var fork = require( 'child_process' ).fork

var chalk = require( 'chalk' )
var hrtime = require( 'pretty-hrtime' )
var concat = require( 'concat-stream' )



/**
 * @constructs
 */
var Writer = module.exports = function( opts ) {
    EventEmitter.call( this )
    this.sources = 0

    this.argv = opts.argv

    this.stream = this.stream.bind( this )
}

util.inherits( Writer, EventEmitter )


/**
 * Returns a concat stream for factor-bundle browserify plugin
 */
Writer.prototype.stream = function( bundleName ) {
    var outPath = path.join( this.argv.o || this.argv.output, bundleName + '.js' )
    return concat( function writable( body ) {
        this.sources++
        var startTime = process.hrtime()

        var debug = !!this.argv.d || !!this.argv.debug
        var child = fork( path.join( __dirname, './uglifier.js' ), {
            env: {
                debug: debug
            }
        })

        console.log(
            chalk.grey( '  [bundler]' ),
            debug
                ? 'Writing:'
                : 'Uglifying:',
            chalk.yellow( bundleName )
        )

        // Send the child the code to manipulate
        child.send({
            bundleName: bundleName,
            body: body.toString()
        })

        // When the child is finished it will post back the code to write
        child.on( 'message', function onMinified( message ) {
            fs.writeFile( outPath, message.body, { encoding: 'utf8' }, function onWriteComplete( err ) {
                if ( err ) {
                    console.log( chalk.red( 'Error: writing' ) )
                    throw new Error( err )
                }

                if ( this.argv.verbose ) {
                    console.log(
                        chalk.grey( '  [bundler]' ),
                        chalk.blue( '-' ),
                        'Write complete:',
                        chalk.yellow( bundleName ),
                        chalk.magenta( hrtime( process.hrtime( startTime ) ) )
                    )
                }

                if ( --this.sources === 0 ) {
                    this.emit( 'write:finish' )
                }

                child.kill()
            }.bind( this ))
        }.bind( this ))

        child.on( 'error', function onChildError( err ) {
            console.error( err )
        })

    }.bind( this ))
}
