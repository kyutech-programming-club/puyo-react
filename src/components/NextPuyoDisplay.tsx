import type { CurrentPuyo } from "../components/types";

type Props = {
    nextPuyos: CurrentPuyo[];
    position?: "left" | "right"; // ← 追加
};

export const NextPuyoDisplay: React.FC<Props> = ({ nextPuyos, position = "right" }) => {
    return (
        <div
            style={{
                position: "absolute",
                top: 20,
                [position]: 20, // left か right に切り替え
            }}
        >
            {nextPuyos.map((puyo, index) => (
                <div key={index} style={{ marginBottom: 10 }}>
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            backgroundColor: puyo.color ?? "transparent",
                            display: "inline-block",
                            marginRight: 2,
                            borderRadius: 4,
                        }}
                    />
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            backgroundColor: puyo.subColor ?? "transparent",
                            display: "inline-block",
                            borderRadius: 4,
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
