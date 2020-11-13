# Scooby WebGL

A GUI tool to monitor life-cycles of WebGL textures and resulted GPU load in real-time.

## Getting Started

### Chrome Extension

`TODO: Link here`
Add this as a chrome extension, then navigate to any page you want to inspect. Click the extension icon and the page should reload and start monitoring for you.

### NPM

`npm i -D @goodboydigital/scooby`
`import '@goodboydigital/scooby`

## Using Texture Monitor

The texture monitor tab is minimised at the bottom left corner of the page by default. The tab can be toggled to inspect the individual textures behind the scene.

### Tabs

#### Texture / Other
You can toggle these to filter the list displayed to you.

#### Active / Deleted
You can toggle these to filter the list displayed to you.

`Active` textures are textures currently loaded onto the GPU.

`Deleted` textures are any texture that was on the GPU but have since been removed.

#### Kill `createImageBitmap`
Currently we cant create a texture when `createImageBitmap` is used. In order to get around this you can toggle this button and `createImageBitmap` will be set to `null`

We assume that you have alternative ways of creating an image if this function is not available.

This option is saved into `SessionStorage` so that when you reload it will be `null` if previously set to that. This allows images created on load to be captured

#### Logs
The logging tab contains a simple logger that will show any message sent to it.

Npm users will have access to the global `SCOOBY` object with `window.SCOOBY`.
Using this you can log to the console with

`window.SCOOBY.log('hello', '#FF0000)`

The "clear" button will remove all logs.

## Building Locally
There are 4 build commands. `build` will generate both the chrome extension and the `npm` package.
```
"build"
"build:npm"
"build:chrome"
"watch:npm"
```
There is currently only 1 `watch` option and that is for building the `npm` version of this package
