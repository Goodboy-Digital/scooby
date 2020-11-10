export function generateFormatMap(gl: WebGLRenderingContext): Record<GLenum, number>
{
    const formatMap: Record<GLenum, number> = {};

    formatMap[gl.RGBA] = 4;
    formatMap[gl.RGB] = 3;

    return formatMap;
}
