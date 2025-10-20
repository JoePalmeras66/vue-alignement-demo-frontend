# LivePick PickCenter

| Production-Build | [![Build Status](https://dev.azure.com/AT-TSI-PD-UNITED-UIUX/PCOTS/_apis/build/status/Build%20PCOTS%20Container%20Production%20Image?branchName=master)](https://dev.azure.com/AT-TSI-PD-UNITED-UIUX/PCOTS/_build/latest?definitionId=40&branchName=master)    |
|-----|-----|
| Staging-Build | [![Build Status](https://dev.azure.com/AT-TSI-PD-UNITED-UIUX/PCOTS/_apis/build/status/Build%20PCOTS%20Container%20Dev%20Image?branchName=master)](https://dev.azure.com/AT-TSI-PD-UNITED-UIUX/PCOTS/_build/latest?definitionId=49&branchName=master)    |
| Dev-Build  | [![Build Status](https://dev.azure.com/AT-TSI-PD-UNITED-UIUX/PCOTS/_apis/build/status/Build%20PCOTS%20Container%20Dev%20Image?branchName=master)](https://dev.azure.com/AT-TSI-PD-UNITED-UIUX/PCOTS/_build/latest?definitionId=49&branchName=master)    |

This project contains the standard implementation of the web application for the Pick Center One. It is based on Vue 3 and TypeScript.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

## SignalR Connection

> **Warning**
> SignalR is not supported by Java based backend services. Please use Websockets instead.

The project contains a composable which supports connections to a SignalR Hub.
The implementation can be found in `src/composables/useSignalR.ts`.

The composable exposes the following functions:

* createSignalRConnection: Creates a new SignalR connection on a specific URL and method. Multiple arguments can be passed to the method as well.

```ts
const { createSignalRConnection } = useSignalR()

signalRConnection = createSignalRConnection('SERVERURL', 'METHOD', 'ARGUMENTS')
```

* closeConnection (optional): Closes the connection to the SignalR Hub. This is optional, as the connection will be closed automatically when the component is destroyed.

```ts
const { closeConnection } = useSignalR()

closeConnection(signalRConnection)
```

A demo implementation can be found in `src/views/PickCenterOneTsView`.

## Websocket Connection

The project contains a composable which supports connections to a websocket. 

The implementation can be found in `src/composables/useWebsocket.ts`.

The composable exposes the following functions:

* createWebsocketConnection: Creates a new websocket connection on a specific URL. Multiple arguments can be passed to the method as well.

```ts
const { createWebsocketConnection } = useWebsocket()
```

* closeConnection: Closes the connection to the websocket. This is not optional and should be called if a component is unmounted.

```ts
const { closeConnection } = useWebsocket()
```

### Websocket Messages

Websockets are currently used to receive Pcots message events from the server. There is also a websocket to receive global messages from the server.

## Configure the application

The application can be deployed in a container runtime like Docker or Kubernetes. The configuration is done via environment variables. The following variables are available:

* VITE_APP_I18N_LOCALE: The default locale of the application. The default value is `en`.
* VITE_APP_I18N_FALLBACK_LOCALE: The fallback locale of the application. The default value is `de`.
* VITE_APP_LOGGER_SERVICE: The URL of the logger service. The default value is `http://localhost:5000`.
* BASE_URL: The base URL of the application. The default value is `/ui/pcots/`.
* VITE_APP_PORTAL_URL: The URL of the portal. The default value is `http://localhost:5000`.
* VITE_APP_CILOG_ADAPTER: The URL of the CILOG adapter. The default value is `http://localhost:5000`.
* VITE_APP_BFG_URL: The URL of the BFG. The default value is `http://localhost:5000`.
