
import path from 'path'

import { Base } from 'yeoman-generator'
import chalk from 'chalk'
import yosay from 'yosay'
import osenv from 'osenv'
import glob from 'glob'

export default class BundlerGenerator extends Base {
    constructor( ...args ) {
        super( ...args )

        this.option( 'skip-prompt', {
            desc: 'Skips the prompt and uses defaults',
            required: false,
            defaults: false
        })

        if ( process.env.DEBUG ) {
            this.destinationRoot( path.join( __dirname, '/../debug' ) )
        }
    }

    pkg = require( '../package.json' )

    static prompts = [{
        name: 'projectName',
        message: 'What is the name of your project?',
        validate: str => {
            return !/\s/.test( str )
        }
    }, {
        name: 'projectDescription',
        message: 'What is the project description?'
    }, {
        name: 'authorName',
        message: 'What is the author name?',
        default: osenv.user(),
        store: true
    }, {
        name: 'userName',
        message: 'What is your github username?',
        default: osenv.user().toLowerCase().replace( /\s/g, '' ),
        store: true
    }]

    hello() {
        this.log( yosay([
            chalk.cyan( 'Generator Bundler' ),
            'Feed me information...'
        ].join( '\n' )))
    }

    prompting() {
        let done = this.async()

        if ( this.options[ 'skip-prompt' ] ) {
            this.log( 'Skipping prompt' )
            this.props = {
                projectName: 'debug-project',
                projectDescription: 'project description',
                authorName: 'Arthur Debug',
                userName: 'adebug'
            }
            return done()
        }

        this.prompt( BundlerGenerator.prompts, props => {
            this.props = props
            done()
        })
    }

    app() {
        var done = this.async()

        this.log( 'Copying templates' )

        glob( path.join( this.sourceRoot(), '**/*' ), {
            dot: true
        }, ( err, files ) => {
            if ( err ) {
                throw new Error( err )
            }

            files.map( file => {
                return file.replace( this.sourceRoot(), '' )
            })
                .forEach( file => {
                    this.fs.copyTpl(
                        this.templatePath( file ),
                        this.destinationPath( file ),
                        this.props
                    )
                })

            done()
        })
    }

    install() {
        if ( this.options[ 'skip-install' ] ) {
            this.log( 'Skipping install' )
            return
        }

        this.installDependencies({
            bower: false
        })
    }
}
