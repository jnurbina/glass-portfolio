export const TILE_SIZE = 2;

export type WallConfigType = {
    [key: string]: {
        size: [number, number];
        position: [number, number, number];
        rotation: [number, number, number];
    };
};

export const wallConfig: WallConfigType = {
    back: { size: [80, 40], position: [0, 0, -15], rotation: [0, 0, 0] },
    top: { size: [80, 30], position: [0, 20, 0], rotation: [Math.PI / 2, 0, 0] },
    bottom: { size: [80, 30], position: [0, -20, 0], rotation: [-Math.PI / 2, 0, 0] },
    left: { size: [30, 40], position: [-40, 0, 0], rotation: [0, Math.PI / 2, 0] },
    right: { size: [30, 40], position: [40, 0, 0], rotation: [0, -Math.PI / 2, 0] },
};
