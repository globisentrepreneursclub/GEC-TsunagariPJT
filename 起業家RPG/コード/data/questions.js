// 設問データ - Founder Quest
const QUESTIONS = [
  // === 5段階評価 24問 ===
  { id: "Q1", type: "scale", question: "自分が実現したい未来像を、人に語るのが好きだ", parameter: "VISION", section: "vision" },
  { id: "Q2", type: "scale", question: "目の前の課題だけでなく、3年後・5年後の姿を考えることが多い", parameter: "VISION", section: "vision" },
  { id: "Q3", type: "scale", question: "事業を考えるとき、社会にどんな変化を起こせるかを重視する", parameter: "VISION", section: "vision" },
  { id: "Q4", type: "scale", question: "完璧でなくても、まず試してみることが多い", parameter: "ACTION", section: "action" },
  { id: "Q5", type: "scale", question: "アイデアを思いついたら、すぐに誰かに話したり行動したりする", parameter: "ACTION", section: "action" },
  { id: "Q6", type: "scale", question: "考えすぎるより、動きながら改善する方が得意だ", parameter: "ACTION", section: "action" },
  { id: "Q7", type: "scale", question: "相手の困りごとや本音を聞き出すのが得意だ", parameter: "EMPATHY", section: "empathy" },
  { id: "Q8", type: "scale", question: "顧客の気持ちを想像しながらサービスを考えることが多い", parameter: "EMPATHY", section: "empathy" },
  { id: "Q9", type: "scale", question: "チームの雰囲気や人間関係に気を配る方だ", parameter: "EMPATHY", section: "empathy" },
  { id: "Q10", type: "scale", question: "物事を数字やデータで確認するのが好きだ", parameter: "ANALYSIS", section: "analysis" },
  { id: "Q11", type: "scale", question: "競合や市場環境を調べてから判断したい", parameter: "ANALYSIS", section: "analysis" },
  { id: "Q12", type: "scale", question: "感覚だけでなく、根拠を持って意思決定したい", parameter: "ANALYSIS", section: "analysis" },
  { id: "Q13", type: "scale", question: "人と違う切り口のアイデアを考えるのが得意だ", parameter: "CREATIVE", section: "creative" },
  { id: "Q14", type: "scale", question: "既存の仕組みを別の形に組み替えるのが好きだ", parameter: "CREATIVE", section: "creative" },
  { id: "Q15", type: "scale", question: "新しいサービスや技術に触れると、活用方法を考えてしまう", parameter: "CREATIVE", section: "creative" },
  { id: "Q16", type: "scale", question: "不確実な状況でも、ある程度決めて前に進める", parameter: "RISK", section: "risk" },
  { id: "Q17", type: "scale", question: "失敗する可能性があっても、挑戦する価値があれば動ける", parameter: "RISK", section: "risk" },
  { id: "Q18", type: "scale", question: "正解がない状況でも意思決定することに抵抗が少ない", parameter: "RISK", section: "risk" },
  { id: "Q19", type: "scale", question: "人を誘ったり、協力をお願いしたりするのが得意だ", parameter: "TEAM", section: "team" },
  { id: "Q20", type: "scale", question: "自分の考えを周囲に伝えて、協力者を増やすことができる", parameter: "TEAM", section: "team" },
  { id: "Q21", type: "scale", question: "ひとりで進めるより、仲間と一緒に進める方が力を発揮する", parameter: "TEAM", section: "team" },
  { id: "Q22", type: "scale", question: "すぐに成果が出なくても、改善を続けることができる", parameter: "PERSIST", section: "persist" },
  { id: "Q23", type: "scale", question: "途中でうまくいかなくても、やり方を変えて再挑戦できる", parameter: "PERSIST", section: "persist" },
  { id: "Q24", type: "scale", question: "地味な作業や検証も、必要なら続けられる", parameter: "PERSIST", section: "persist" },

  // === シナリオ選択 8問 ===
  {
    id: "Q25", type: "scenario",
    question: "新しい事業アイデアを思いつきました。最初に何をしますか？",
    options: [
      { label: "試作品を作る", parameter: "ACTION" },
      { label: "顧客に聞く", parameter: "EMPATHY" },
      { label: "市場を調べる", parameter: "ANALYSIS" },
      { label: "仲間に話す", parameter: "TEAM" }
    ]
  },
  {
    id: "Q26", type: "scenario",
    question: "チーム内で意見が割れました。どうしますか？",
    options: [
      { label: "目的に立ち返る", parameter: "VISION" },
      { label: "全員の気持ちを聞く", parameter: "EMPATHY" },
      { label: "データで比較する", parameter: "ANALYSIS" },
      { label: "試して判断する", parameter: "ACTION" }
    ]
  },
  {
    id: "Q27", type: "scenario",
    question: "資金が少ない状態で挑戦するなら？",
    options: [
      { label: "小さく検証する", parameter: "PERSIST" },
      { label: "仲間を集める", parameter: "TEAM" },
      { label: "勝てる市場を探す", parameter: "ANALYSIS" },
      { label: "思い切って勝負する", parameter: "RISK" }
    ]
  },
  {
    id: "Q28", type: "scenario",
    question: "顧客から厳しい意見をもらいました。どうしますか？",
    options: [
      { label: "深く理由を聞く", parameter: "EMPATHY" },
      { label: "すぐ改善する", parameter: "ACTION" },
      { label: "他の顧客にも確認する", parameter: "ANALYSIS" },
      { label: "新しい案を考える", parameter: "CREATIVE" }
    ]
  },
  {
    id: "Q29", type: "scenario",
    question: "起業で一番ワクワクする瞬間は？",
    options: [
      { label: "世界を変える構想を描く", parameter: "VISION" },
      { label: "アイデアが形になる", parameter: "CREATIVE" },
      { label: "仲間が増える", parameter: "TEAM" },
      { label: "売上が立つ", parameter: "ANALYSIS" }
    ]
  },
  {
    id: "Q30", type: "scenario",
    question: "大きな競合がいる市場に入るなら？",
    options: [
      { label: "ニッチを探す", parameter: "RISK" },
      { label: "独自アイデアで差別化する", parameter: "CREATIVE" },
      { label: "仲間を集めて突破する", parameter: "TEAM" },
      { label: "まず小さく実験する", parameter: "ACTION" }
    ]
  },
  {
    id: "Q31", type: "scenario",
    question: "事業が停滞したとき、最初に見直すのは？",
    options: [
      { label: "顧客課題", parameter: "EMPATHY" },
      { label: "数字", parameter: "ANALYSIS" },
      { label: "チーム体制", parameter: "TEAM" },
      { label: "自分たちの理想", parameter: "VISION" }
    ]
  },
  {
    id: "Q32", type: "scenario",
    question: "限られた時間で成果を出すなら？",
    options: [
      { label: "優先順位を決める", parameter: "ANALYSIS" },
      { label: "まず動く", parameter: "ACTION" },
      { label: "協力者を探す", parameter: "TEAM" },
      { label: "新しいやり方を試す", parameter: "CREATIVE" }
    ]
  },

  // === 価値観選択 4問 ===
  {
    id: "Q33", type: "value",
    question: "起業で最も大切にしたいことは？",
    options: [
      { label: "社会へのインパクト", parameter: "VISION" },
      { label: "顧客への貢献", parameter: "EMPATHY" },
      { label: "収益性", parameter: "ANALYSIS" },
      { label: "新しさ", parameter: "CREATIVE" }
    ]
  },
  {
    id: "Q34", type: "value",
    question: "あなたがチームに一番貢献できることは？",
    options: [
      { label: "方向性を示す", parameter: "VISION" },
      { label: "実行する", parameter: "ACTION" },
      { label: "支える", parameter: "EMPATHY" },
      { label: "勝ち筋を考える", parameter: "ANALYSIS" }
    ]
  },
  {
    id: "Q35", type: "value",
    question: "起業家として伸ばしたい力は？",
    options: [
      { label: "人を巻き込む力", parameter: "TEAM" },
      { label: "やり抜く力", parameter: "PERSIST" },
      { label: "発想力", parameter: "CREATIVE" },
      { label: "決断力", parameter: "RISK" }
    ]
  },
  {
    id: "Q36", type: "value",
    question: "理想の起業スタイルは？",
    options: [
      { label: "大きな未来を掲げる", parameter: "VISION" },
      { label: "現場で課題を拾う", parameter: "EMPATHY" },
      { label: "データで勝ち筋を作る", parameter: "ANALYSIS" },
      { label: "仲間と冒険する", parameter: "TEAM" }
    ]
  },

  // === 自由記述 4問 ===
  { id: "Q37", type: "free_text", question: "あなたが起業や新規事業を通じて実現したいことは何ですか？", parameter: null },
  { id: "Q38", type: "free_text", question: "起業や新規事業に対して、今一番不安に感じていることは何ですか？", parameter: null },
  { id: "Q39", type: "free_text", question: "一緒に挑戦するなら、どんな仲間がほしいですか？", parameter: null },
  { id: "Q40", type: "free_text", question: "直近1か月で挑戦してみたいことは何ですか？", parameter: null }
];
