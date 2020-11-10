export enum WebGLRenderingContexts
    {
    WEBGL = 'webgl',
    EXPERIMENTAL_WEBGL = 'experimental-webgl',
    WEBGL2 = 'webgl2',
    EXPERIMENTAL_WEBGL2 = 'experimental-webgl2',
}

/**
 * Returns the correct webgl context based on the name provided
 * @param contextType - the webgl context name
 */
export function getContextType(contextType: string): WebGLRenderingContext|WebGL2RenderingContext
{
    switch (contextType)
    {
        case WebGLRenderingContexts.WEBGL:
        case WebGLRenderingContexts.EXPERIMENTAL_WEBGL:
            return WebGLRenderingContext.prototype;
        case WebGLRenderingContexts.WEBGL2:
        case WebGLRenderingContexts.EXPERIMENTAL_WEBGL2:
            return WebGL2RenderingContext.prototype;
    }

    return null;
}
