let addImports;
try {
  addImports = require('jscodeshift-add-imports');
} catch (e) {
  addImports = () => {};
  
}

function addRouteMocksStatement(api, options, node) {
  const _addRouteMocksStatement = api.expressionStatement(
    api.callExpression(
      api.memberExpression(node.value.expression.callee.object, api.identifier('addRouteMocks')),
      [api.identifier(options.mocksIdentifier)]
    )
  );
  if (!node.parentPath.parentPath.value.body.filter(n => n.expression.arguments && n.expression.arguments.length && n.expression.arguments[0].name === options.mocksIdentifier).length) {
    node.insertBefore(_addRouteMocksStatement);
  }
  return node;
}

// Press ctrl+space for code completion
export default function transformer(fileinfo, { jscodeshift: api, report }, options) {
  let lastBlock;
  let found = false;
  const _report = report || console.log;

  const root = api(fileinfo.source);

  if (!options.mocksPrefix) {
    options.mocksPrefix = 'messaging'
    options.mocksIdentifier = 'messagingMocks'
    options.mocksPath = 'voyager-test-helpers/test-support/messaging/route-mocks'
  }

  return root
    // find the relevant setupRouteResponseMocks
    .find(api.ExpressionStatement, (node) => {
      if (node.expression.callee &&
        node.expression.callee.property &&
        node.expression.callee.property.name === 'setupRouteResponseMocks') {
        try {
          return node.expression.arguments[0].value.startsWith(options.mocksPrefix);
        } catch (e) {
          const _arg = node.expression.arguments[0];
          _report(`using variable for route mocks name. ${node.expression.callee.object.name}.setupRouteResponseMocks(${_arg.name}) at line:${_arg.loc.start.line}`);
        }
      }
    }).forEach((node) => {
      // add the import if it doesn't already exist
      const importStatement = api.importDeclaration(
        [api.importDefaultSpecifier(api.identifier(options.mocksIdentifier))],
        api.stringLiteral(options.mocksPath),
        "value"
      );
      addImports(root, importStatement);

      // add the function call if this is the first time see it in the parent
      if (lastBlock !== node.parentPath.parentPath) {
        lastBlock = node.parentPath.parentPath;
        addRouteMocksStatement(api, options, node);
      }
      return node;
    }).toSource({
      quote: 'single',
    }).replace(
      new RegExp(`\\s(\nimport.+${options.mocksPath})`),
      '$1'
    );
}
