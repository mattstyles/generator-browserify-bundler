import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import glob from 'glob'
import hrtime from 'pretty-hrtime'
import minimist from 'minimist'
import { watch } from 'chokidar'

import * as babel from 'babel'

let argv = minimist( process.argv.slice( 2 ) )
let globPath = './**/_index.js'
let mode = 'build'

/**
 * Log decorator
 */
function log( ...args ) {
    console.log( chalk.grey( '[' + mode + ']' ), ...args )
}

/**
 * @param file <String> filepath to file to transpile
 * @returns <Promise> resolves to writing the transpiled file to disk
 */
function transpile( file ) {
    return new Promise( ( resolve, reject ) => {
        log( 'Transpiling:', chalk.yellow( file ) )
        babel.transformFile( file, {
            ast: false,
            optional: [
                'es7.classProperties'
            ]
        }, ( err, res ) => {
            if ( err ) {
                return reject( Object.assign( err, {
                    filename: file
                }))
            }

            var outPath = path.join( path.dirname( file ), path.basename( file ).replace( /^_/, '' ) )

            log( 'Writing:', chalk.green( outPath ) )
            fs.writeFile( path.resolve( outPath ), res.code, {
                encoding: 'utf8'
            }, err => {
                if ( err ) {
                    return reject( err )
                }
                resolve()
            })
        })
    })
}

/**
 * Watches files and runs transpilation on change
 */
function watcher() {
    mode = 'watch'
    watch( globPath )
        .on( 'change', transpile )
}

/**
 * Grab the files to transpile from their glob and get it on
 */
var startTime = process.hrtime()
glob( globPath, ( err, files ) => {
    if ( err ) {
        throw new Error( err )
    }

    Promise.all( files.map( transpile ) )
        .then( res => {
            var endTime = process.hrtime( startTime )
            log( 'done', chalk.magenta( hrtime( endTime ).replace( /\s/, '' ) ) )

            if ( argv.watch ) {
                watcher()
            }
        })
        .catch( err => {
            if ( err.loc && err.codeFrame && err.filename ) {
                console.error( chalk.red( 'Error in file' ), err.filename, err.loc )
                console.error( err.codeFrame )
            }
            console.error( err.message )
        })
})
