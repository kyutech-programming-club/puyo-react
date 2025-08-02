import type { Cell } from "./types";

export const getRandomColor = (): Cell => {
    const colors: Cell[] = ["red", "green", "blue", "yellow"];
    return colors[Math.floor(Math.random() * colors.length)];
};

export const getAdjacentPuyoOffset = (direction: string): [number, number] => {
    switch (direction) {
        case "up": return [0, -1];
        case "right": return [1, 0];
        case "down": return [0, 1];
        case "left": return [-1, 0];
        default: return [0, -1];
    }
};
