// scripts/checkMovies.js
import { database } from '../src/config/database.js';
import { Movie } from '../src/models/Movie.js';

async function checkMovies() {
    try {
        console.log('\n🎬 Verificando banco de dados...\n');
        console.log('━'.repeat(50));

        await database.authenticate();

        const total = await Movie.count();
        console.log(`📊 Total de filmes: ${total.toLocaleString()}`);

        if (total === 0) {
            console.log('\n⚠️  Banco vazio! Execute: npm run import');
            process.exit(0);
        }

        // Estatísticas gerais
        console.log('\n📈 Estatísticas Gerais:');

        const stats = await database.query(
            `SELECT 
        AVG(vote_average) as avg_rating,
        MAX(vote_average) as max_rating,
        MIN(vote_average) as min_rating,
        COUNT(DISTINCT original_language) as languages,
        MIN(substr(release_date, 1, 4)) as oldest_year,
        MAX(substr(release_date, 1, 4)) as newest_year
      FROM moviedb`,
            { type: database.QueryTypes.SELECT }
        );

        const s = stats[0];
        console.log(`   Nota média: ${parseFloat(s.avg_rating).toFixed(2)}/10`);
        console.log(`   Melhor nota: ${s.max_rating}/10`);
        console.log(`   Pior nota: ${s.min_rating}/10`);
        console.log(`   Idiomas: ${s.languages}`);
        console.log(`   Período: ${s.oldest_year} - ${s.newest_year}`);

        // Top 10 filmes
        console.log('\n🏆 Top 10 Filmes Mais Bem Avaliados:');
        const topRated = await Movie.findAll({
            limit: 10,
            order: [['voteAverage', 'DESC']],
            attributes: ['title', 'voteAverage', 'releaseDate', 'genre']
        });

        topRated.forEach((m, i) => {
            const year = m.releaseDate.substring(0, 4);
            const genre = m.genre.split(',')[0].trim();
            console.log(`   ${(i + 1).toString().padStart(2)}. ${m.title.substring(0, 40).padEnd(40)} ⭐ ${m.voteAverage} (${year}) [${genre}]`);
        });

        // Lançamentos recentes
        console.log('\n🆕 Lançamentos Mais Recentes:');
        const recent = await Movie.findAll({
            limit: 5,
            order: [['releaseDate', 'DESC']],
            attributes: ['title', 'releaseDate', 'voteAverage']
        });

        recent.forEach((m, i) => {
            console.log(`   ${i + 1}. ${m.title} - ${m.releaseDate} (⭐ ${m.voteAverage})`);
        });

        // Distribuição por década
        console.log('\n📅 Distribuição por Década:');
        const decades = await database.query(
            `SELECT 
        CASE 
          WHEN substr(release_date, 1, 4) >= '2020' THEN '2020s'
          WHEN substr(release_date, 1, 4) >= '2010' THEN '2010s'
          WHEN substr(release_date, 1, 4) >= '2000' THEN '2000s'
          WHEN substr(release_date, 1, 4) >= '1990' THEN '1990s'
          WHEN substr(release_date, 1, 4) >= '1980' THEN '1980s'
          ELSE 'Antes de 1980'
        END as decade,
        COUNT(*) as count
      FROM moviedb
      GROUP BY decade
      ORDER BY decade DESC`,
            { type: database.QueryTypes.SELECT }
        );

        decades.forEach(d => {
            const bar = '█'.repeat(Math.floor(d.count / 100));
            console.log(`   ${d.decade.padEnd(15)} ${bar} ${d.count.toLocaleString()}`);
        });

        // Top gêneros
        console.log('\n🎭 Top 10 Gêneros:');
        const genres = await database.query(
            `SELECT genre, COUNT(*) as count 
       FROM moviedb 
       WHERE genre != ''
       GROUP BY genre 
       ORDER BY count DESC 
       LIMIT 10`,
            { type: database.QueryTypes.SELECT }
        );

        genres.forEach((g, i) => {
            const bar = '█'.repeat(Math.floor(g.count / 50));
            const genreShort = g.genre.substring(0, 30).padEnd(30);
            console.log(`   ${(i + 1).toString().padStart(2)}. ${genreShort} ${bar} ${g.count}`);
        });

        // Idiomas
        console.log('\n🌍 Top 10 Idiomas:');
        const languages = await database.query(
            `SELECT original_language, COUNT(*) as count 
       FROM moviedb 
       GROUP BY original_language 
       ORDER BY count DESC 
       LIMIT 10`,
            { type: database.QueryTypes.SELECT }
        );

        const langNames = {
            'en': '🇺🇸 Inglês',
            'ja': '🇯🇵 Japonês',
            'es': '🇪🇸 Espanhol',
            'fr': '🇫🇷 Francês',
            'ko': '🇰🇷 Coreano',
            'pt': '🇧🇷 Português',
            'hi': '🇮🇳 Hindi',
            'ru': '🇷🇺 Russo',
            'de': '🇩🇪 Alemão',
            'it': '🇮🇹 Italiano',
            'zh': '🇨🇳 Chinês'
        };

        languages.forEach((l, i) => {
            const langName = (langNames[l.original_language] || l.original_language).padEnd(20);
            const bar = '█'.repeat(Math.floor(l.count / 100));
            console.log(`   ${(i + 1).toString().padStart(2)}. ${langName} ${bar} ${l.count.toLocaleString()}`);
        });

        console.log('\n' + '━'.repeat(50));
        console.log('✅ Verificação concluída!\n');

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await database.close();
        process.exit(0);
    }
}

checkMovies();
