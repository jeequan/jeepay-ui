# Merchant payment-config regression tests

Use Node.js 20.19+ or 22.12+ and npm 10. The patched Vitest 4 runner uses a
separate, modern Vite dependency; the application's production build remains
on its existing Vite 2 configuration. Node.js 18 cannot run these tests.

```sh
cd jeepay-ui-merchant
npm ci
npm run test:merchant-config
npm run build
```

In restricted environments, add `--cache /tmp/jeepay-npm-cache` to `npm ci`.

The tests compile and mount the actual `MchPayConfigAddOrEdit.vue` component
in jsdom. The API module is mocked, so no backend, credentials, live merchant
settings, file uploads or payment operations are used. Ant Design's UI and
validation shell is stubbed, including its default keep-mounted drawer
behavior. The component's loading, schema selection/parsing, binding and
submission logic all run unchanged.

Covered behavior:

- Both ordinary (`mchType: 1`) and sub-merchants (`mchType: 2`) use the unified
  `record.mchParams`, even when both legacy definitions contain different fields
- Both types work when legacy `normalMchParams`/`isvsubMchParams` are absent
- Saved values load into the rendered form, edits reach the mocked save API,
  and saving/reopening preserves the unified schema and saved values
- An unchanged masked secret stays a placeholder and is omitted from the save
  payload, along with placeholder-only keys
- Cancel does not save; reopening reloads saved values and switching merchant
  types replaces stale form fields

This is a focused runtime regression, not real-browser Ant Design validation,
backend integration or payment testing. To verify that it detects the original
regression, temporarily replace `const mchParams = record.mchParams` with the
old type-dependent selection from `record.normalMchParams` or
`record.isvsubMchParams`: all five tests fail. Restore the unified selection
before building or committing.
