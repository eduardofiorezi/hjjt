export const site = {
  nome: 'Horse Jiu-Jitsu Team',
  sigla: 'HJJT',
  url: 'https://equipehjjt.com.br',
  descricao: 'Equipe de jiu-jitsu com sedes em Londrina e região. Encontre a mais perto de você e veja os horários de treino.',
  // TODO: confirmar. É o e-mail do site antigo (2018).
  email: 'horsejj@hotmail.com',
  // TODO: preencher com o Instagram oficial da equipe, se houver.
  instagram: '',
  facebook: 'https://www.facebook.com/HJJT.Horse.Jiu.Jitsu.Team',
  mapaGoogle: 'https://www.google.com/maps/d/viewer?mid=1VZTX50S0NFCiiVWT01II3ij3s5STmvQ',
};

/** Vídeos do canal "HJJT Dando a Letra" no YouTube. */
export const videos = [
  { id: '24V6j0bUGRU', titulo: 'Dando a Letra com Wanderlei Silva' },
  { id: 'CCwRkD2R-ZY', titulo: 'Dando a Letra com Shogun e Ninja', ano: 2014 },
  { id: 'tkU251lYLDQ', titulo: 'Dando a Letra', ano: 2014 },
  { id: 'kHD9k1O18Cs', titulo: 'Copa Ellite de Jiu-Jitsu', ano: 2013 },
  { id: 'coaho6Vplz0', titulo: 'Graduação de dezembro', ano: 2012 },
  { id: 'Zn8-2hHxGlY', titulo: 'Dando a Letra com Rogério Olegário, parte 1' },
  { id: 'bpAcXd0SORk', titulo: 'Dando a Letra com Rogério Olegário, parte 2' },
];

/** Cada pasta em src/assets/fotos/ é um álbum. A ordem aqui é a ordem na galeria. */
export const albuns: Record<string, string> = {
  'seminario-wanderlei-silva': 'Seminário com Wanderlei Silva',
  'seminario-shogun-ninja': 'Seminário com Shogun e Ninja',
  'seminario-rodolfo-vieira': 'Seminário com Rodolfo Vieira',
  'seminario-royler-gracie': 'Seminário com Royler Gracie',
  treinos: 'Treinos',
};
