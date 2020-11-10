export function generateTextureMap(gl: WebGLRenderingContext): Record<GLenum, number>
{
    const textureMap: Record<GLenum, number> = {};

    textureMap[gl.TEXTURE_2D] = gl.TEXTURE_BINDING_2D;
    textureMap[gl.TEXTURE_CUBE_MAP] = gl.TEXTURE_BINDING_CUBE_MAP;
    textureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_X] = gl.TEXTURE_BINDING_CUBE_MAP;
    textureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_Y] = gl.TEXTURE_BINDING_CUBE_MAP;
    textureMap[gl.TEXTURE_CUBE_MAP_NEGATIVE_Z] = gl.TEXTURE_BINDING_CUBE_MAP;
    textureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_X] = gl.TEXTURE_BINDING_CUBE_MAP;
    textureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_Y] = gl.TEXTURE_BINDING_CUBE_MAP;
    textureMap[gl.TEXTURE_CUBE_MAP_POSITIVE_Z] = gl.TEXTURE_BINDING_CUBE_MAP;

    return textureMap;
}
