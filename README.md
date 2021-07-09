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

The issue is in the resulting pre-bundled chunk for Pivot, where `PivotBase` is defined before it is used.

If you modify `src/Pivot.ts` to remove the `PivotBase` export, or move it above the `Pivot` export, the bundle will be correctly ordered.

Unfortunately, most code we've seen relies on `import` order to always dictate bundle order, rather than `export` order, so this issue will come up in many places.
