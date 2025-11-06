// scripts/importMovies.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { database } from '../src/config/database.js';
import { Movie } from '../src/models/Movie.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importMovies() {
  try {
    console.log('🎬 Iniciando importação de filmes...');
    console.log('━'.repeat(50));

    // Conectar ao banco
    await database.authenticate();
    console.log('✅ Conectado ao banco de dados SQLite');

    // Sincronizar modelo (criar tabela se não existir)
    await Movie.sync({ force: false });
    console.log('✅ Tabela moviedb pronta');

    // Verificar se já existem filmes
    const existingCount = await Movie.count();
    if (existingCount > 0) {
      console.log(`\n⚠️  Já existem ${existingCount} filmes no banco`);
      console.log('🗑️  Limpando banco de dados em 3 segundos... (Ctrl+C para cancelar)');

      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('🗑️  Limpando...');
      await Movie.destroy({ where: {}, truncate: true });
      console.log('✅ Banco limpo');
    }

    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, '../data/movies.sql');

    if (!fs.existsSync(sqlPath)) {
      console.error(`\n❌ Arquivo não encontrado: ${sqlPath}`);
      console.log('💡 Certifique-se de que o arquivo movies.sql está em data/movies.sql');
      process.exit(1);
    }

    console.log('\n📂 Lendo arquivo SQL...');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ Arquivo carregado');

    // Extrair dados
    console.log('\n🔍 Processando dados...');
    const movies = parseMoviesFromSQL(sqlContent);

    if (movies.length === 0) {
      console.error('❌ Nenhum filme encontrado no arquivo SQL');
      process.exit(1);
    }

    console.log(`📊 Encontrados ${movies.length} filmes para importar`);

    // Importar em lotes
    const batchSize = 500;
    let imported = 0;

    console.log('\n📥 Importando filmes...');
    console.log('━'.repeat(50));

    for (let i = 0; i < movies.length; i += batchSize) {
      const batch = movies.slice(i, i + batchSize);

      try {
        await Movie.bulkCreate(batch, {
          ignoreDuplicates: true,
          validate: false // Acelera importação
        });
        imported += batch.length;

        const progress = Math.round((imported / movies.length) * 100);
        const bar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
        process.stdout.write(`\r[${bar}] ${progress}% (${imported}/${movies.length})`);
      } catch (error) {
        console.error(`\n⚠️  Erro no lote: ${error.message}`);
      }
    }

    console.log('\n' + '━'.repeat(50));
    console.log('\n✅ Importação concluída!');
    console.log(`📊 Total importado: ${imported} filmes`);

    // Verificação final
    const finalCount = await Movie.count();
    console.log(`🎬 Total no banco: ${finalCount} filmes`);

    // Estatísticas
    console.log('\n📈 Estatísticas:');

    const topRated = await Movie.findOne({
      order: [['voteAverage', 'DESC']]
    });
    console.log(`   Melhor avaliado: ${topRated.title} (${topRated.voteAverage}/10)`);

    const avgRating = await Movie.findOne({
      attributes: [[database.fn('AVG', database.col('vote_average')), 'avg']],
      raw: true
    });
    console.log(`   Média geral: ${parseFloat(avgRating.avg).toFixed(2)}/10`);

    const languageCount = await database.query(
      'SELECT COUNT(DISTINCT original_language) as count FROM moviedb',
      { type: database.QueryTypes.SELECT }
    );
    console.log(`   Idiomas disponíveis: ${languageCount[0].count}`);

    const yearRange = await database.query(
      `SELECT 
        MIN(substr(release_date, 1, 4)) as oldest,
        MAX(substr(release_date, 1, 4)) as newest
      FROM moviedb`,
      { type: database.QueryTypes.SELECT }
    );
    console.log(`   Período: ${yearRange[0].oldest} - ${yearRange[0].newest}`);

  } catch (error) {
    console.error('\n❌ Erro durante importação:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await database.close();
    console.log('\n👋 Conexão fechada');
    process.exit(0);
  }
}

function parseMoviesFromSQL(sqlContent) {
  const movies = [];

  // Encontra o bloco INSERT INTO ... VALUES
  const insertMatch = sqlContent.match(/INSERT INTO `moviedb`[^V]+VALUES\s*([\s\S]+);/i);

  if (!insertMatch) {
    console.error('❌ Formato de SQL não reconhecido');
    return movies;
  }

  const valuesBlock = insertMatch[1];

  // Divide por "),\n(" para separar cada filme
  const rows = valuesBlock.split(/\),\s*\n\s*\(/);

  console.log(`🔍 Encontrados ${rows.length} registros no SQL`);

  for (let i = 0; i < rows.length; i++) {
    try {
      let row = rows[i].trim();

      // Remove parênteses inicial e final
      row = row.replace(/^\(/, '').replace(/\);?$/, '');

      const movie = parseMovieRow(row);
      if (movie) {
        movies.push(movie);
      }

      // Progresso do parsing
      if ((i + 1) % 1000 === 0) {
        process.stdout.write(`\r   Processando... ${i + 1}/${rows.length}`);
      }
    } catch (error) {
      console.error(`\n⚠️  Erro na linha ${i + 1}: ${error.message}`);
    }
  }

  console.log(`\r   Processando... ${rows.length}/${rows.length} ✅`);

  return movies;
}

function parseMovieRow(row) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === "'") {
      if (inString) {
        // Verifica se é escape de aspas simples ('')
        if (row[i + 1] === "'") {
          current += "'";
          i++; // Pula próxima aspa
        } else {
          inString = false;
        }
      } else {
        inString = true;
      }
      continue;
    }

    if (char === ',' && !inString) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  // Adiciona último valor
  if (current) {
    values.push(current.trim());
  }

  // Valida quantidade de campos (8 campos esperados)
  if (values.length < 8) {
    return null;
  }

  try {
    return {
      id: parseInt(values[0]) || null,
      releaseDate: values[1] || null,
      title: values[2] || '',
      overview: values[3] || '',
      voteAverage: parseFloat(values[4]) || 0,
      originalLanguage: values[5] || 'en',
      genre: values[6] || '',
      posterUrl: values[7] || ''
    };
  } catch (error) {
    console.error(`⚠️  Erro ao converter valores: ${error.message}`);
    return null;
  }
}

// Executar importação
console.log(`
╔════════════════════════════════════════════════╗
║     🎬 IMPORTADOR DE FILMES - SQLite 🎬       ║
║                                                ║
║  Sistema de Recomendação de Filmes            ║
║  Base: ~10.000 filmes do TMDb                 ║
╚════════════════════════════════════════════════╝
`);

importMovies();
