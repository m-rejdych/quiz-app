import type { FC } from 'react';

import Leaderboard from '../common/leaderboard';
import type { GetGameQueryData } from '../../types/game/data';

interface Props {
  players: GetGameQueryData['players'];
  currentQuestion: GetGameQueryData['currentQuestion'];
}

const FinishedView: FC<Props> = (props) => (
  <Leaderboard
    {...props}
    heading="Round is up!"
    containerProps={{ height: '100%', justifyContent: 'center' }}
  />
);

export default FinishedView;
