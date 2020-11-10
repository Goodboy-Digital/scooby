export function generateTypeMap(gl: WebGLRenderingContext): Record<GLenum, number>
{
    const typeMap: Record<GLenum, number> = {};

    typeMap[gl.UNSIGNED_BYTE] = 1;
    typeMap[gl.UNSIGNED_SHORT_4_4_4_4] = 0.5;
    typeMap[36193] = 2;
    typeMap[gl.FLOAT] = 4;

    return typeMap;
}
