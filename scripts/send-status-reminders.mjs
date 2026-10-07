// 1年以上「現状」の更新がないメンバーに、更新のお願いメールを送る。
// 既定はドライラン(何も送らない)。実送信は DRY_RUN=false のときだけ。
// ログはGitHub Actionsに残るため、メールアドレス・ニックネームは出力しない(user_idの先頭8桁のみ)。

export function buildMail({ nickname, siteUrl }) {
  const name = nickname ? `${nickname}さん` : 'メンバーの皆さま';
  return {
    subject: '【GEC Founder Quest】現状のアップデートをお願いします',
    text: [
      `${name}、こんにちは。GEC Founder Questです。`,
      '',
      '最後に現状を更新されてから1年以上が経ちました。',
      '起業のフェーズやスキル、目標など、いまの状況を更新して、GECの仲間と共有してください。',
      '',
      `▼ マイルームを開く（ログイン後、「現状を更新」から変更できます）`,
      siteUrl,
      '',
      '※ このお知らせが不要な場合は、マイルームの「現状を更新」の一番下にあるチェックを外すと停止できます。',
      '',
      'GEC Founder Quest 運営',
    ].join('\n'),
  };
}

export async function run({ env, fetchImpl = fetch, log = console.log }) {
  const url = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    log('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定のためスキップします。');
    return { skipped: true, sent: 0 };
  }

  const dryRun = env.DRY_RUN !== 'false';
  const maxPerRun = parseInt(env.MAX_PER_RUN || '20', 10);
  const staleDays = parseInt(env.STALE_DAYS || '365', 10);
  const siteUrl = env.SITE_URL || 'https://globisentrepreneursclub.github.io/GEC-TsunagariPJT/index.html';

  const rpc = async (name, body) => {
    const res = await fetchImpl(`${url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${name} failed: HTTP ${res.status}`);
    return res.json();
  };

  const stale = await rpc('get_stale_status_users', { p_days: staleDays });
  const targets = stale.slice(0, maxPerRun);
  log(`対象: ${stale.length}人（今回の上限 ${maxPerRun}人 → ${targets.length}人）/ ${dryRun ? 'ドライラン（送信しません）' : '実送信'}`);

  if (dryRun) return { skipped: false, dryRun: true, wouldSend: targets.length, sent: 0 };

  if (!env.RESEND_API_KEY || !env.REMINDER_FROM) {
    throw new Error('実送信には RESEND_API_KEY と REMINDER_FROM が必要です。');
  }

  let sent = 0;
  for (const u of targets) {
    const { subject, text } = buildMail({ nickname: u.nickname, siteUrl });
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.REMINDER_FROM, to: [u.email], subject, text }),
    });
    if (!res.ok) {
      // 送れなかった人は記録しない（次回また対象になる）。他の人の送信は続ける。
      log(`送信失敗 user=${u.user_id.slice(0, 8)} HTTP ${res.status}`);
      continue;
    }
    // 送信済みの記録に失敗したまま続けると、次回同じ人にまた送ってしまうので、ここで止める。
    await rpc('mark_reminder_sent', { p_user_id: u.user_id });
    sent++;
    log(`送信済み user=${u.user_id.slice(0, 8)}`);
  }
  return { skipped: false, dryRun: false, sent };
}

// `node scripts/send-status-reminders.mjs` で直接実行されたときだけ動く
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/send-status-reminders.mjs')) {
  run({ env: process.env }).then(r => console.log('完了:', JSON.stringify(r))).catch(e => { console.error(e.message); process.exit(1); });
}
