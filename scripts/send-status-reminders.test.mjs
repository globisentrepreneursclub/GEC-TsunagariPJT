// 実際にはメールを送れない環境でも挙動を確かめるための、fetchをモックしたテスト。
// 実行: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import { run, buildMail } from './send-status-reminders.mjs';

const baseEnv = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'svc', RESEND_API_KEY: 'rk', REMINDER_FROM: 'GEC <noreply@example.com>' };
const users = [
  { user_id: 'aaaaaaaa-1111', email: 'a@example.com', nickname: 'あ' },
  { user_id: 'bbbbbbbb-2222', email: 'b@example.com', nickname: 'い' },
  { user_id: 'cccccccc-3333', email: 'c@example.com', nickname: 'う' },
];

// 呼び出しを記録しつつ、URLごとに応答を返す偽fetch
function fakeFetch({ stale = users, sendStatus = () => 200, markOk = true } = {}) {
  const calls = [];
  const impl = async (url, opts) => {
    calls.push({ url, body: opts?.body ? JSON.parse(opts.body) : null });
    const ok = (code) => ({ ok: code < 400, status: code, json: async () => [] });
    if (url.endsWith('/rpc/get_stale_status_users')) return { ok: true, status: 200, json: async () => stale };
    if (url.endsWith('/rpc/mark_reminder_sent')) return ok(markOk ? 200 : 500);
    if (url === 'https://api.resend.com/emails') return ok(sendStatus(JSON.parse(opts.body).to[0]));
    throw new Error('unexpected url ' + url);
  };
  return { impl, calls };
}
const sends = (calls) => calls.filter(c => c.url === 'https://api.resend.com/emails');
const marks = (calls) => calls.filter(c => c.url.endsWith('/rpc/mark_reminder_sent'));

test('認証情報が無ければ何もせずスキップする', async () => {
  const f = fakeFetch();
  const r = await run({ env: {}, fetchImpl: f.impl, log: () => {} });
  assert.equal(r.skipped, true);
  assert.equal(f.calls.length, 0);
});

test('DRY_RUN未指定なら送信も記録もしない（既定は安全側）', async () => {
  const f = fakeFetch();
  const r = await run({ env: baseEnv, fetchImpl: f.impl, log: () => {} });
  assert.equal(r.dryRun, true);
  assert.equal(r.wouldSend, 3);
  assert.equal(sends(f.calls).length, 0);
  assert.equal(marks(f.calls).length, 0);
});

test('実送信では送った人だけ送信済みに記録する', async () => {
  const f = fakeFetch();
  const r = await run({ env: { ...baseEnv, DRY_RUN: 'false' }, fetchImpl: f.impl, log: () => {} });
  assert.equal(r.sent, 3);
  assert.deepEqual(sends(f.calls).map(c => c.body.to[0]), ['a@example.com', 'b@example.com', 'c@example.com']);
  assert.deepEqual(marks(f.calls).map(c => c.body.p_user_id), users.map(u => u.user_id));
});

test('送信に失敗した人は記録せず、他の人の送信は続ける', async () => {
  const f = fakeFetch({ sendStatus: (to) => (to === 'b@example.com' ? 422 : 200) });
  const r = await run({ env: { ...baseEnv, DRY_RUN: 'false' }, fetchImpl: f.impl, log: () => {} });
  assert.equal(r.sent, 2);
  assert.deepEqual(marks(f.calls).map(c => c.body.p_user_id), ['aaaaaaaa-1111', 'cccccccc-3333']);
});

test('送信済みの記録に失敗したら、重複送信を避けるためそこで止める', async () => {
  const f = fakeFetch({ markOk: false });
  await assert.rejects(() => run({ env: { ...baseEnv, DRY_RUN: 'false' }, fetchImpl: f.impl, log: () => {} }), /mark_reminder_sent failed/);
  assert.equal(sends(f.calls).length, 1); // 1通目の後で止まり、2通目は送らない
});

test('MAX_PER_RUNで1回の送信数を制限する', async () => {
  const f = fakeFetch();
  const r = await run({ env: { ...baseEnv, DRY_RUN: 'false', MAX_PER_RUN: '2' }, fetchImpl: f.impl, log: () => {} });
  assert.equal(r.sent, 2);
});

test('実送信にRESEND_API_KEY/REMINDER_FROMが無ければ送らずエラーにする', async () => {
  const f = fakeFetch();
  await assert.rejects(() => run({ env: { SUPABASE_URL: baseEnv.SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: 'svc', DRY_RUN: 'false' }, fetchImpl: f.impl, log: () => {} }), /RESEND_API_KEY/);
  assert.equal(sends(f.calls).length, 0);
});

test('ログにメールアドレスやニックネームを出さない', async () => {
  const lines = [];
  const f = fakeFetch();
  await run({ env: { ...baseEnv, DRY_RUN: 'false' }, fetchImpl: f.impl, log: (m) => lines.push(m) });
  const out = lines.join('\n');
  assert.doesNotMatch(out, /@example\.com/);
  for (const u of users) assert.ok(!out.includes(u.nickname));
});

test('本文にサイトURLと停止方法が入る', () => {
  const { subject, text } = buildMail({ nickname: 'テスト', siteUrl: 'https://example.com/' });
  assert.match(subject, /現状/);
  assert.match(text, /テストさん/);
  assert.match(text, /https:\/\/example\.com\//);
  assert.match(text, /チェックを外す/);
});
