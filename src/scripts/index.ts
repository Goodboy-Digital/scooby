/* eslint-disable func-names */
/* eslint-disable prefer-rest-params */
/* eslint-disable camelcase */
import './styles/index.scss';

import { TextureMonitor } from './TextureMonitor';

TextureMonitor.overrideCreateImageBitmap();
const textureMonitor = new TextureMonitor();

const __Origin_EXTENSION_GetContext = HTMLCanvasElement.prototype.getContext;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
HTMLCanvasElement.prototype.__Origin_EXTENSION_GetContext = __Origin_EXTENSION_GetContext;

// const isDown = false;
// let startY: number;
// let initialScroll: number;

HTMLCanvasElement.prototype.getContext = function ()
{
    let context = null;

    if (!arguments.length)
    {
        return context;
    }

    if (arguments.length === 1)
    {
        context = this.__Origin_EXTENSION_GetContext(arguments[0]);
        if (context === null)
        {
            return context;
        }
    }
    else if (arguments.length === 2)
    {
        context = this.__Origin_EXTENSION_GetContext(arguments[0], arguments[1]);
        if (context === null)
        {
            return context;
        }
    }

    const contextNames = ['webgl', 'experimental-webgl', 'webgl2', 'experimental-webgl2'];

    if (contextNames.indexOf(arguments[0]) !== -1)
    {
        const gl = context as WebGLRenderingContext;
        const RenderingContext = TextureMonitor.getContextType(contextNames[contextNames.indexOf(arguments[0])]);
        const typeMap: Record<GLenum, number> = TextureMonitor.generateTypeMap(gl);
        const formatMap: Record<GLenum, number> = TextureMonitor.generateFormatMap(gl);
        const getTextureMap:Record<GLenum, GLenum> = TextureMonitor.generateTextureMap(gl);

        // TODO - There will be an issue with cube textures for sure!
        gl.createTexture = function ()
        {
            const glTexture: WebGLTexture = RenderingContext.createTexture.apply(this, arguments);

            textureMonitor.createTextureCard(glTexture);

            return glTexture;
        };

        gl.generateMipmap = function ()
        {
            const glTexture = arguments[0];
            const webGLTexture = gl.getParameter(getTextureMap[glTexture]);

            textureMonitor.generateMipmap(webGLTexture);

            return RenderingContext.generateMipmap.apply(this, arguments);
        };

        gl.deleteTexture = function ()
        {
            // Feature to be added - accumulating consumption saved + replace duplicate te textures
            const glTexture = arguments[0];

            textureMonitor.deleteTexture(glTexture);

            return RenderingContext.deleteTexture.apply(this, arguments);
        };

        gl.texImage2D = function ()
        {
            const glTexture = gl.getParameter(getTextureMap[arguments[0]]);

            textureMonitor.texImage2d(arguments, formatMap, typeMap, glTexture);
            RenderingContext.texImage2D.apply(this, arguments);
        };
    }

    return context;
};

document.addEventListener('DOMContentLoaded', () =>
{
    textureMonitor.init();
});
