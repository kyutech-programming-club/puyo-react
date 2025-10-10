import type { CurrentPuyo } from "../components/types";

type Props = {
  nextPuyos: CurrentPuyo[];
};

export const NextPuyoDisplay: React.FC<Props> = ({ nextPuyos }) => {
  const next = nextPuyos[0]; // 次に出る1組だけ
  return (
    <div className="next-puyo-display">
      <div className="next-puyo-title">Next Puyo</div>
      <div className="next-puyo-list">
        <div className="next-puyo-row">
          <div className={`next-puyo ${next.color}`}></div>
          <div className={`next-puyo ${next.subColor}`}></div>
        </div>
      </div>
    </div>
  );
};
