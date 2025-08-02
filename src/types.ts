export type Cell = "red" | "green" | "blue" | "yellow" | null;

export type CurrentPuyo = {
    x: number;
    y: number;
    color: Cell;
    direction: "up" | "right" | "down" | "left";
    subColor: Cell;
};
