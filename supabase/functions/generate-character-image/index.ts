// Founder Quest - キャラクターポートレート画像生成
// Geminiの画像生成APIキーはこの関数内(サーバー側)にのみ保持し、クライアントには一切渡さない。
// 呼び出し側はSupabaseの匿名キー(anon key)をAuthorizationヘッダーに付与する
// （プロジェクトのデフォルトJWT検証で受け付けられる。--no-verify-jwtは使わない）。

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CharacterProfile {
  characterName: string;
  entrepreneurType: string;
  catchcopy: string;
  themeColor: string;
  strengths: string[];
}

function buildPrompt(profile: CharacterProfile) {
  return [
    "ファンタジーRPG風のキャラクターポートレートイラストを1枚生成してください。",
    `キャラクター名: ${profile.characterName}（${profile.entrepreneurType}）`,
    `キャッチコピー: ${profile.catchcopy}`,
    `象徴的な強み: ${(profile.strengths || []).join(" / ")}`,
    `テーマカラー: ${profile.themeColor} を基調にしたカラーパレット`,
    "スタイル: 半身〜バストアップ、幻想的な背景、デジタルアート、高品質なゲームキャラクターアートワーク。",
    "文字やロゴ、透かしは入れないでください。",
  ].join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const profile: CharacterProfile = await req.json();
    if (!profile?.characterName) {
      return Response.json({ error: "characterName is required" }, { status: 400, headers: CORS_HEADERS });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500, headers: CORS_HEADERS });
    }

    const prompt = buildPrompt(profile);

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return Response.json({ error: "image generation failed", detail: errText }, { status: 502, headers: CORS_HEADERS });
    }

    const geminiJson = await geminiRes.json();
    const part = geminiJson?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const inlineData = part?.inlineData;

    if (!inlineData?.data) {
      console.error("No image data in Gemini response:", JSON.stringify(geminiJson).slice(0, 500));
      return Response.json({ error: "no image returned" }, { status: 502, headers: CORS_HEADERS });
    }

    return Response.json(
      { image: inlineData.data, mimeType: inlineData.mimeType || "image/png" },
      { headers: CORS_HEADERS }
    );
  } catch (e) {
    console.error("generate-character-image failed:", e);
    return Response.json({ error: String(e) }, { status: 500, headers: CORS_HEADERS });
  }
});
