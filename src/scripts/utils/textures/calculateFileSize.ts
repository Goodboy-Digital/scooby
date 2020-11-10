import { TextureData } from '../../TextureMonitor';

/**
 * Calculates the total memory used by the map provided
 * @param textureMap - map of texture card data
 */
export function calculateSize(textureMap:Map<WebGLTexture, TextureData>): string
{
    let totalSize = 0;
    const activeTextures: TextureData[] = [];

    textureMap.forEach((data) =>
    {
        const realSize = data.size * (data.mipped ? 2 : 1);

        totalSize += realSize;
        activeTextures.push(data);
    });

    return getByteSize(totalSize);
}

/**
 * Calculates the total amount of memory and formats it to the correct unit
 * @param bytes - number of bytes
 * @param decimals - number of decimal places
 */
export function getByteSize(bytes: number, decimals = 2): string
{
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
