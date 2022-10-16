import type { FC } from 'react';

import Leaderboard from '../common/leaderboard';
import type { GetGameQueryData } from '../../types/game/data';

interface Props {
  players: GetGameQueryData['players'];
}

const FinishedView: FC<Props> = (props) => {
  const getHeading = (): string => {
    const playersValues = Object.values(props.players);

    const highscore = playersValues.reduce(
      (currentHighscore, { score }) =>
        score > currentHighscore ? score : currentHighscore,
      0,
    );
    const winners = playersValues.filter(({ score }) => score === highscore);

    let heading = 'Game is over! ';

    if (winners.length === 1) {
      heading += `The winner is ${winners[0].user.username}`;
    } else {
      heading += `The winners are ${winners
        .map(({ user: { username } }) => username)
        .join(', ')}`;
    }

    return heading;
  };

  return (
    <Leaderboard
      {...props}
      heading={getHeading()}
      containerProps={{ height: '100%', justifyContent: 'center' }}
    />
  );
};

export default FinishedView;
