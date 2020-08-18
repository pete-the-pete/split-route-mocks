# split-route-mocks

## Params
All params are *required*.
* mocksPrefix - the string that is used in setupRouteResponseMocks. 

  * ex. for setupRouteResponseMocks('foo'), use --mocksPrefix=foo
  
* mocksIdentifier - the Identifier that will be used in the import AND in the call to addRouteMocks
  
  * ex. `import foo from 'foo/mocks', which will be used for `addRouteMocks(food)`, use --mocksIdentifier=foo

* mocksPath - the relative path for the mocks to be imported
  
  * ex. `import fo from 'foo/mocks', use --mocksPath='foo/mocks'

## To Use:
1. clone the repo
2. npm install
3. run 
`js
jscodeshift --parser=flow -t ../opensource/split-route-mocks/index.js --mocksPrefix='acorn' --mocksIdentifier=foo --mocksPath='test-helpers/foo/mocks'
`
