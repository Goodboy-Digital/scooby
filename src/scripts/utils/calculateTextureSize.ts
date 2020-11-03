export function calculateTextureSize(
    args: IArguments,
    formatMap:Record<GLenum, number>,
    typeMap:Record<GLenum, number>,
): {width: number, height: number, gpuMemory: number}
{
    let width: number;
    let height: number;
    let gpuMemory: number;

    if (args.length === 9)
    {
        width = args[3];
        height = args[4];
        gpuMemory = width * height;
        gpuMemory *= formatMap[args[2]] * typeMap[args[7]] || 0;
    }
    else if (args.length === 6)
    {
        width = args[5].width;
        height = args[5].height;
        gpuMemory = width * height;
        gpuMemory *= formatMap[args[2]] * typeMap[args[4]] || 0;
    }

    return { width, height, gpuMemory };
}
