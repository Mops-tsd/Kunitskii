/**
 * Выкладывает собранный сайт на GitHub Pages — ветка gh-pages.
 *
 * Нужно, чтобы показать работу по обычной ссылке вида
 * https://<владелец>.github.io/<репозиторий>/ — без служебных доменов
 * и без следов того, чем сайт собирали.
 *
 * Ветка содержит только результат сборки: истории в ней нет и не нужно,
 * каждая выкладка переписывает её целиком.
 *
 * Запуск: node scripts/publish-pages.mjs
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';

const BRANCH = 'gh-pages';
const WORKTREE = '.gh-pages';

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

const remote = git('remote', 'get-url', 'origin');
// Из адреса вида .../Mops-tsd/Kunitskii(.git) берём владельца и имя.
const match = remote.match(/([^/:]+)\/([^/]+?)(?:\.git)?$/);
if (!match) throw new Error(`не разобрать адрес репозитория: ${remote}`);
const [, owner, repo] = match;

console.log(`репозиторий: ${owner}/${repo}`);

// Сборка с префиксом: на Pages сайт лежит в подпапке с именем репозитория.
console.log('сборка…');
execFileSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, BASE_PATH: `/${repo}` },
});

/*
 * GitHub Pages по умолчанию прогоняет содержимое через Jekyll, а тот
 * выбрасывает папки, начинающиеся с подчёркивания. Весь бандл Next лежит
 * ровно в такой папке — _next, — поэтому без этого файла сайт открылся бы
 * без единого скрипта и стиля.
 */
writeFileSync(path.join('out', '.nojekyll'), '');

if (existsSync(WORKTREE)) {
  execFileSync('git', ['worktree', 'remove', '--force', WORKTREE]);
}
rmSync(WORKTREE, { recursive: true, force: true });

// Ветку каждый раз создаём заново от пустого места: хранить историю
// собранных файлов незачем, а репозиторий она раздувает быстро.
const exists = git('branch', '--list', BRANCH) !== '';
if (exists) execFileSync('git', ['branch', '-D', BRANCH]);
execFileSync('git', ['worktree', 'add', '--detach', WORKTREE]);

execFileSync('git', ['-C', WORKTREE, 'checkout', '--orphan', BRANCH]);
execFileSync('git', ['-C', WORKTREE, 'rm', '-rf', '--quiet', '.']);
// Точка в out/. копирует и скрытые файлы — .nojekyll в том числе.
execFileSync('bash', ['-c', `cp -r out/. ${WORKTREE}/`]);

execFileSync('git', ['-C', WORKTREE, 'add', '-A']);
execFileSync('git', [
  '-C',
  WORKTREE,
  'commit',
  '--quiet',
  '-m',
  'Выложить собранный сайт',
]);
execFileSync('git', ['-C', WORKTREE, 'push', '--force', 'origin', BRANCH], {
  stdio: 'inherit',
});

execFileSync('git', ['worktree', 'remove', '--force', WORKTREE]);

console.log(`\nготово. адрес: https://${owner.toLowerCase()}.github.io/${repo}/`);
console.log(
  'если страница не открывается — в настройках репозитория,\n' +
    `раздел Pages, выбрать источник: ветка ${BRANCH}, папка / (root).`
);
