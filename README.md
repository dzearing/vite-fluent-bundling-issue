# Minimal repro for Vite bundling issue

The only meanigful code changes made to this repository after running `yarn create @vitejs/app` were in commit `5b468d7587717e38d4f3868c3df93c413e9c96ee`, which added the [`@fluentui/react`](https://github.com/microsoft/fluentui/tree/master/packages/react) dependency and added the following imports to [`src/App.tsx`](src/App.tsx):
```ts
import "@fluentui/react/lib/Pivot";
import "@fluentui/react/lib/index";
```

When running `yarn dev` on this repository and navigating to the served page, the page fails due to a runtime exception:
```
styled.tsx:123 Uncaught TypeError: Cannot read property 'displayName' of undefined
    at styled (styled.tsx:123)
    at Pivot.tsx:12
```

The issue is in the resulting pre-bundled chunk for Pivot, where `PivotBase` is passed as an argument to `styled` before it is defined later in the file:
```js
// line 12977
// node_modules/@fluentui/react/lib/components/Pivot/Pivot.base.js
var React67 = __toModule(require_react());

// node_modules/@fluentui/react/lib/utilities/useOverflow.js
// ...

// line 13355
// node_modules/@fluentui/react/lib/components/Pivot/Pivot.js
var Pivot = styled(PivotBase, getStyles16, void 0, {
  scope: "Pivot"
});

// node_modules/@fluentui/react/lib/components/Pivot/PivotItem.js
// ...

// line 13391
// node_modules/@fluentui/react/lib/components/Pivot/Pivot.base.js
var getClassNames8 = classNamesFunction();
var COMPONENT_NAME6 = "Pivot";
var getTabId = function(props, pivotId, itemKey, index) {
  if (props.getTabId) {
    return props.getTabId(itemKey, index);
  }
  return pivotId + ("-Tab" + index);
};
var getLinkItems = function(props, pivotId) {
  var result = {
    links: [],
    keyToIndexMapping: {},
    keyToTabIdMapping: {}
  };
  React67.Children.forEach(React67.Children.toArray(props.children), function(child, index) {
    if (isPivotItem(child)) {
      var _a5 = child.props, linkText = _a5.linkText, pivotItemProps = __rest(_a5, ["linkText"]);
      var itemKey = child.props.itemKey || index.toString();
      result.links.push(__assign(__assign({ headerText: linkText }, pivotItemProps), { itemKey }));
      result.keyToIndexMapping[itemKey] = index;
      result.keyToTabIdMapping[itemKey] = getTabId(props, pivotId, itemKey, index);
    } else if (child) {
      warn("The children of a Pivot component must be of type PivotItem to be rendered.");
    }
  });
  return result;
};
var isPivotItem = function(item) {
  var _a5, _b;
  return ((_b = (_a5 = item) === null || _a5 === void 0 ? void 0 : _a5.type) === null || _b === void 0 ? void 0 : _b.name) === PivotItem.name;
};
var PivotBase = React67.forwardRef(function(props, ref) {
// ...
```

This seems to be due to some issue in the [`vite:dep-pre-bundle` plugin](https://github.com/vitejs/vite/blob/6d602a0a4d2c1e77ded1344d59733eb93d4009c3/packages/vite/src/node/optimizer/esbuildDepPlugin.ts#L35), as running the following `esbuild` command does not produce the same issue:
```
yarn esbuild ./node_modules/react ./node_modules/react-dom ./node_modules/@fluentui/react/lib/index.js ./node_modules/@fluentui/react/lib/Pivot.js --bundle --splitting --outdir=obj --format=esm --tree-shaking=ignore-annotations --metafile=meta.json --sourcemap
```