export type Cell = "red" | "green" | "blue" | "yellow" | null;

export type CurrentPuyo = {
    x: number;
    y: number;
    color: Cell;
    direction: "up" | "right" | "down" | "left";
    subColor: Cell;
};

export type CheckResult = {
    newBoard: Cell[][];
    popped: boolean;
    poppedNum: number;
};

export const FIELD_WIDTH = 6;
export const FIELD_HEIGHT = 12;
