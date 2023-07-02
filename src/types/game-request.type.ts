export enum GameSet {
  NO_GAME_SET = 0,
  SMALL,
  STANDART,
}

export const GameSetLabel = {
  [GameSet.NO_GAME_SET]: 'No game set, need one from opponent',
  [GameSet.SMALL]: 'Small portable game set',
  [GameSet.STANDART]: 'Big sandart game set',
};

export type GameRequest = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  rank: string;
  egdId?: string;
  phone?: string;
  age?: number;
  gender?: string;
  gameSet: GameSet;
  description?: string;
  comment?: string;
};
