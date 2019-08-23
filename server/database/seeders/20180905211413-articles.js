import articles from '../seed-data/articles';

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Articles', [
    articles[0],
    articles[1],
    articles[2],
    articles[3],
    articles[4],
    articles[5],
    articles[6],
    articles[7],
    articles[8],
    articles[9],
    articles[10],
    articles[11],
    articles[12],
  ]),
  down: queryInterface => queryInterface.bulkDelete('Articles', null, {})
};
