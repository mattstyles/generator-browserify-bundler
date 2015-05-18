
Bundles are page specific script bundles, most of which will build out from a common core that each page requires.

Bundles names are referenced from the folder names, i.e.

```
src/bundles
 - events/main.js
 - mixes/main.js
```

This folder structure will create two bundles:

```
events.js
mixes.js
```

Folders without a `main.js*` (notably .js or .jsx) will be ignored as bundles, although any code they contain will be bundled in. The `bundles/main.js*` convention stipulates browserify entry-points.

Common code should go into the `common` folder, which sits separate from `bundles`.
