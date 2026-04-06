export type LangCode = 'en' | 'vi' | 'ja' | 'es' | 'zh';

export const LANGUAGES: { code: LangCode; flag: string; name: string }[] = [
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
];

export type TranslationKeys = {
  // Header
  appName: string;
  appSubtitle: string;

  // Scanner
  scannerPlaceholder: string;
  scanBtn: string;
  scanningMsg: string;
  scanningSubMsg: string;

  // Results headings
  riskScore: string;
  domainIntel: string;
  age: string;
  expiry: string;
  registrar: string;
  redFlags: string;
  noRedFlags: string;
  sandboxScreenshot: string;
  noVisual: string;

  // AI Chat
  askAiTitle: string;
  chatPlaceholder: string;
  chatEmptyMsg: string;
  thinking: string;

  // AI Analysis card
  aiAnalysis: string;
  riskScoreLabel: string;
  threatLevel: string;
  analysisFactors: string;
  verdict: string;
  visualLabel: string;
  technicalLabel: string;
  behaviorLabel: string;

  // AI Advisor
  aiAdvisorTitle: string;
  recommendedActions: string;

  // Report
  downloadReport: string;
  reportTitle: string;
  reportGeneratedOn: string;
  reportUrl: string;
  reportDomainAge: string;
  reportRegistrar: string;
  reportExpiry: string;
  reportRiskScore: string;
  reportStatus: string;
  reportRedFlags: string;
  reportAiSummary: string;
  reportAiAdvice: string;
  reportPrint: string;

  // Settings
  settingsTitle: string;
  settingsLanguage: string;
  settingsAiMode: string;
  settingsAiModeConcise: string;
  settingsAiModeEducational: string;
  settingsTurboMode: string;
  settingsLiveGlow: string;
  settingsHeuristicLevel: string;
  settingsClose: string;

  // Phish-Tank
  phishTankTitle: string;
  phishTankTotal: string;
  phishTankThreats: string;
  phishTankSafety: string;
  phishTankActivity: string;
  phishTankRank: string;
  phishTankInitiate: string;
  phishTankGuardian: string;
  phishTankElite: string;
  phishTankDailyBounty: string;
  phishTankDailyGoal: string;
  phishTankLeaderboard: string;
  phishTankXP: string;

  // Status
  statusSafe: string;
  statusSuspicious: string;
  statusDangerous: string;
};

export const translations: Record<LangCode, TranslationKeys> = {
  en: {
    appName: 'SentinelPhish',
    appSubtitle: 'Real-time AI Phishing & URL Scrutiny Engine',
    scannerPlaceholder: 'Authorize target (e.g. linkedin.com or apple-security.xyz)',
    scanBtn: 'Scan URL',
    scanningMsg: 'Scanning... please wait.',
    scanningSubMsg: 'Deep heuristic checks & visual rendering may take up to 20 seconds.',
    riskScore: 'Risk Score',
    domainIntel: 'Domain Intel',
    age: 'Age',
    expiry: 'Expiry',
    registrar: 'Registrar',
    redFlags: 'Heuristic Red Flags',
    noRedFlags: 'No red flags detected.',
    sandboxScreenshot: 'Sandbox Screenshot',
    noVisual: 'NO VISUAL CAPTURED (UNREACHABLE)',
    askAiTitle: 'Ask AI about this site',
    chatPlaceholder: 'Ask about this domain...',
    chatEmptyMsg: 'Send a message to ask SentinelPhish AI about the scan results.',
    thinking: 'Thinking...',
    aiAnalysis: 'Gemini AI Analysis',
    riskScoreLabel: 'Risk Score',
    threatLevel: 'Threat Level',
    analysisFactors: 'Analysis Factors',
    verdict: 'Verdict',
    visualLabel: 'Visual',
    technicalLabel: 'Technical',
    behaviorLabel: 'Behavior',
    aiAdvisorTitle: 'AI Security Advisor',
    recommendedActions: 'Recommended Actions',
    downloadReport: 'Download Security Report',
    reportTitle: 'SentinelPhish Security Report',
    reportGeneratedOn: 'Generated on',
    reportUrl: 'Analyzed URL',
    reportDomainAge: 'Domain Age',
    reportRegistrar: 'Registrar',
    reportExpiry: 'Expiry Date',
    reportRiskScore: 'Risk Score',
    reportStatus: 'Status',
    reportRedFlags: 'Heuristic Flags',
    reportAiSummary: 'AI Security Summary',
    reportAiAdvice: 'Recommended Actions',
    reportPrint: 'Print / Save as PDF',
    settingsTitle: 'Settings',
    settingsLanguage: 'Language',
    settingsAiMode: 'AI Response Mode',
    settingsAiModeConcise: 'Direct / Concise',
    settingsAiModeEducational: 'Detailed / Educational',
    settingsTurboMode: 'Turbo Mode (Fast Scan)',
    settingsLiveGlow: 'Live Threat Glow',
    settingsHeuristicLevel: 'Heuristic Detail Level',
    settingsClose: 'Save & Close',
    phishTankTitle: 'Phish-Tank Analytics',
    phishTankTotal: 'Total Scans',
    phishTankThreats: 'Threats Blocked',
    phishTankSafety: 'Safety Rating',
    phishTankActivity: 'Threat Activity Over Time',
    phishTankRank: 'Current Rank',
    phishTankInitiate: 'Initiate Scout',
    phishTankGuardian: 'Cyber Guardian',
    phishTankElite: 'Elite Sentinel',
    phishTankDailyBounty: 'Daily Bounty',
    phishTankDailyGoal: 'Scan 5 URLs to maintain your streak',
    phishTankLeaderboard: 'Global Sentinel Rankings',
    phishTankXP: 'XP',
    statusSafe: 'SAFE',
    statusSuspicious: 'SUSPICIOUS',
    statusDangerous: 'DANGEROUS',
  },
  vi: {
    appName: 'SentinelPhish',
    appSubtitle: 'Công cụ Phân tích URL & Phát hiện Lừa đảo bằng AI',
    scannerPlaceholder: 'Xác thực mục tiêu (vd: linkedin.com hoặc apple-security.xyz)',
    scanBtn: 'Quét URL',
    scanningMsg: 'Đang quét... vui lòng chờ.',
    scanningSubMsg: 'Kiểm tra heuristic & kết xuất hình ảnh có thể mất đến 20 giây.',
    riskScore: 'Điểm Rủi ro',
    domainIntel: 'Thông tin Tên miền',
    age: 'Tuổi',
    expiry: 'Hết hạn',
    registrar: 'Nhà đăng ký',
    redFlags: 'Cảnh báo Heuristic',
    noRedFlags: 'Không phát hiện cảnh báo nào.',
    sandboxScreenshot: 'Ảnh chụp Sandbox',
    noVisual: 'KHÔNG THU ĐƯỢC HÌNH ẢNH (KHÔNG THỂ TRUY CẬP)',
    askAiTitle: 'Hỏi AI về trang này',
    chatPlaceholder: 'Hỏi về tên miền này...',
    chatEmptyMsg: 'Gửi tin nhắn để hỏi SentinelPhish AI về kết quả quét.',
    thinking: 'Đang suy nghĩ...',
    aiAnalysis: 'Phân tích AI Gemini',
    riskScoreLabel: 'Điểm Rủi ro',
    threatLevel: 'Mức độ Đe dọa',
    analysisFactors: 'Yếu tố Phân tích',
    verdict: 'Kết luận',
    visualLabel: 'Hình ảnh',
    technicalLabel: 'Kỹ thuật',
    behaviorLabel: 'Hành vi',
    aiAdvisorTitle: 'Cố vấn Bảo mật AI',
    recommendedActions: 'Hành động Khuyến nghị',
    downloadReport: 'Tải Báo cáo Bảo mật',
    reportTitle: 'Báo cáo Bảo mật SentinelPhish',
    reportGeneratedOn: 'Tạo ngày',
    reportUrl: 'URL Đã Phân tích',
    reportDomainAge: 'Tuổi Tên miền',
    reportRegistrar: 'Nhà đăng ký',
    reportExpiry: 'Ngày hết hạn',
    reportRiskScore: 'Điểm Rủi ro',
    reportStatus: 'Trạng thái',
    reportRedFlags: 'Cờ Heuristic',
    reportAiSummary: 'Tóm tắt Bảo mật AI',
    reportAiAdvice: 'Hành động Khuyến nghị',
    reportPrint: 'In / Lưu thành PDF',
    settingsTitle: 'Cài đặt',
    settingsLanguage: 'Ngôn ngữ',
    settingsAiMode: 'Chế độ AI',
    settingsAiModeConcise: 'Trực tiếp / Ngắn gọn',
    settingsAiModeEducational: 'Chi tiết / Giáo dục',
    settingsTurboMode: 'Chế độ Turbo (Quét Nhanh)',
    settingsLiveGlow: 'Hiệu ứng Phân tích',
    settingsHeuristicLevel: 'Độ Trực quan Heuristic',
    settingsClose: 'Lưu & Đóng',
    phishTankTitle: 'Bảng Analytics Phish-Tank',
    phishTankTotal: 'Tổng lần Quét',
    phishTankThreats: 'Mối đe dọa đã Nhận diện',
    phishTankSafety: 'Tỉ Lệ An Toàn',
    phishTankActivity: 'Tần suất Rủi ro theo Thời gian',
    phishTankRank: 'Cấp bậc Hiện tại',
    phishTankInitiate: 'Lính trinh sát',
    phishTankGuardian: 'Người bảo hộ',
    phishTankElite: 'Chiến binh Tinh nhuệ',
    phishTankDailyBounty: 'Nhiệm Vụ Hàng Ngày',
    phishTankDailyGoal: 'Quét 5 URL để giữ chuỗi liên tiếp',
    phishTankLeaderboard: 'Bảng Xếp Hạng Toàn Cầu',
    phishTankXP: 'KN',
    statusSafe: 'AN TOÀN',
    statusSuspicious: 'ĐÁNG NGHI',
    statusDangerous: 'NGUY HIỂM',
  },
  ja: {
    appName: 'SentinelPhish',
    appSubtitle: 'リアルタイムAIフィッシング・URL解析エンジン',
    scannerPlaceholder: 'ターゲットを認証 (例: linkedin.com または apple-security.xyz)',
    scanBtn: 'URLをスキャン',
    scanningMsg: 'スキャン中... お待ちください。',
    scanningSubMsg: '詳細なヒューリスティック検査と視覚的レンダリングに最大20秒かかる場合があります。',
    riskScore: 'リスクスコア',
    domainIntel: 'ドメイン情報',
    age: '年齢',
    expiry: '有効期限',
    registrar: 'レジストラ',
    redFlags: 'ヒューリスティック警告',
    noRedFlags: '警告は検出されませんでした。',
    sandboxScreenshot: 'サンドボックス画面',
    noVisual: 'ビジュアル取得不可（到達不能）',
    askAiTitle: 'このサイトについてAIに質問',
    chatPlaceholder: 'このドメインについて質問...',
    chatEmptyMsg: 'スキャン結果についてSentinelPhish AIにメッセージを送信してください。',
    thinking: '考え中...',
    aiAnalysis: 'Gemini AI 分析',
    riskScoreLabel: 'リスクスコア',
    threatLevel: '脅威レベル',
    analysisFactors: '分析要因',
    verdict: '判定',
    visualLabel: 'ビジュアル',
    technicalLabel: '技術',
    behaviorLabel: '行動',
    aiAdvisorTitle: 'AIセキュリティアドバイザー',
    recommendedActions: '推奨アクション',
    downloadReport: 'セキュリティレポートをダウンロード',
    reportTitle: 'SentinelPhish セキュリティレポート',
    reportGeneratedOn: '生成日',
    reportUrl: '解析済みURL',
    reportDomainAge: 'ドメイン年齢',
    reportRegistrar: 'レジストラ',
    reportExpiry: '有効期限',
    reportRiskScore: 'リスクスコア',
    reportStatus: 'ステータス',
    reportRedFlags: 'ヒューリスティックフラグ',
    reportAiSummary: 'AIセキュリティ概要',
    reportAiAdvice: '推奨アクション',
    reportPrint: '印刷 / PDFとして保存',
    settingsTitle: '設定',
    settingsLanguage: '言語',
    settingsAiMode: 'AIレスポンスモード',
    settingsAiModeConcise: '直接 / 簡潔',
    settingsAiModeEducational: '詳細 / 教育的',
    settingsTurboMode: 'ターボモード (高速スキャン)',
    settingsLiveGlow: 'ライブ脅威グロー',
    settingsHeuristicLevel: 'ヒューリスティック詳細レベル',
    settingsClose: '保存して閉じる',
    phishTankTitle: 'Phish-Tank 分析',
    phishTankTotal: '合計スキャン数',
    phishTankThreats: 'ブロックされた脅威',
    phishTankSafety: '安全率',
    phishTankActivity: '時間経過による脅威活動',
    phishTankRank: '現在のランク',
    phishTankInitiate: '見習いスカウト',
    phishTankGuardian: 'サイバーガーディアン',
    phishTankElite: 'エリートセンチネル',
    phishTankDailyBounty: 'デイリーバウンティ',
    phishTankDailyGoal: '5つのURLをスキャンしてストリークを維持',
    phishTankLeaderboard: 'グローバルセンチネルランキング',
    phishTankXP: 'XP',
    statusSafe: '安全',
    statusSuspicious: '不審',
    statusDangerous: '危険',
  },
  es: {
    appName: 'SentinelPhish',
    appSubtitle: 'Motor de Análisis de URLs y Detección de Phishing con IA',
    scannerPlaceholder: 'Autorizar objetivo (ej: linkedin.com o apple-security.xyz)',
    scanBtn: 'Escanear URL',
    scanningMsg: 'Escaneando... por favor espera.',
    scanningSubMsg: 'Las verificaciones heurísticas y el renderizado visual pueden tardar hasta 20 segundos.',
    riskScore: 'Puntuación de Riesgo',
    domainIntel: 'Inteligencia de Dominio',
    age: 'Antigüedad',
    expiry: 'Vencimiento',
    registrar: 'Registrador',
    redFlags: 'Alertas Heurísticas',
    noRedFlags: 'No se detectaron alertas.',
    sandboxScreenshot: 'Captura del Sandbox',
    noVisual: 'SIN CAPTURA VISUAL (INALCANZABLE)',
    askAiTitle: 'Preguntar a la IA sobre este sitio',
    chatPlaceholder: 'Pregunta sobre este dominio...',
    chatEmptyMsg: 'Envía un mensaje para preguntarle a SentinelPhish AI sobre los resultados.',
    thinking: 'Pensando...',
    aiAnalysis: 'Análisis de Gemini AI',
    riskScoreLabel: 'Puntuación de Riesgo',
    threatLevel: 'Nivel de Amenaza',
    analysisFactors: 'Factores de Análisis',
    verdict: 'Veredicto',
    visualLabel: 'Visual',
    technicalLabel: 'Técnico',
    behaviorLabel: 'Comportamiento',
    aiAdvisorTitle: 'Asesor de Seguridad IA',
    recommendedActions: 'Acciones Recomendadas',
    downloadReport: 'Descargar Informe de Seguridad',
    reportTitle: 'Informe de Seguridad SentinelPhish',
    reportGeneratedOn: 'Generado el',
    reportUrl: 'URL Analizada',
    reportDomainAge: 'Antigüedad del Dominio',
    reportRegistrar: 'Registrador',
    reportExpiry: 'Fecha de Vencimiento',
    reportRiskScore: 'Puntuación de Riesgo',
    reportStatus: 'Estado',
    reportRedFlags: 'Alertas Heurísticas',
    reportAiSummary: 'Resumen de Seguridad IA',
    reportAiAdvice: 'Acciones Recomendadas',
    reportPrint: 'Imprimir / Guardar como PDF',
    settingsTitle: 'Configuración',
    settingsLanguage: 'Idioma',
    settingsAiMode: 'Modo de Respuesta IA',
    settingsAiModeConcise: 'Directo / Conciso',
    settingsAiModeEducational: 'Detallado / Educativo',
    settingsTurboMode: 'Modo Turbo (Escaneo Rápido)',
    settingsLiveGlow: 'Resplandor Reactivo',
    settingsHeuristicLevel: 'Nivel Detalle Heurístico',
    settingsClose: 'Guardar y Cerrar',
    phishTankTitle: 'Bóveda Phish-Tank',
    phishTankTotal: 'Escaneos Totales',
    phishTankThreats: 'Amenazas Bloqueadas',
    phishTankSafety: 'Índice de Seguridad',
    phishTankActivity: 'Actividad de Amenazas (Histórico)',
    phishTankRank: 'Rango Actual',
    phishTankInitiate: 'Explorador Iniciado',
    phishTankGuardian: 'Guardián Cibernético',
    phishTankElite: 'Centinela de Élite',
    phishTankDailyBounty: 'Misión Diaria',
    phishTankDailyGoal: 'Escanea 5 URLs para mantener tu racha',
    phishTankLeaderboard: 'Clasificación Global de Centinelas',
    phishTankXP: 'XP',
    statusSafe: 'SEGURO',
    statusSuspicious: 'SOSPECHOSO',
    statusDangerous: 'PELIGROSO',
  },
  zh: {
    appName: 'SentinelPhish',
    appSubtitle: '实时AI网络钓鱼与URL分析引擎',
    scannerPlaceholder: '授权目标 (例: linkedin.com 或 apple-security.xyz)',
    scanBtn: '扫描URL',
    scanningMsg: '扫描中... 请稍候。',
    scanningSubMsg: '深度启发式检查和视觉渲染可能需要最多20秒。',
    riskScore: '风险评分',
    domainIntel: '域名情报',
    age: '域名年龄',
    expiry: '到期日期',
    registrar: '注册商',
    redFlags: '启发式警报',
    noRedFlags: '未检测到警报。',
    sandboxScreenshot: '沙盒截图',
    noVisual: '无法获取视觉（无法访问）',
    askAiTitle: '向AI询问此网站',
    chatPlaceholder: '询问有关此域名的问题...',
    chatEmptyMsg: '发送消息向SentinelPhish AI询问扫描结果。',
    thinking: '思考中...',
    aiAnalysis: 'Gemini AI 分析',
    riskScoreLabel: '风险评分',
    threatLevel: '威胁级别',
    analysisFactors: '分析因素',
    verdict: '结论',
    visualLabel: '视觉',
    technicalLabel: '技术',
    behaviorLabel: '行为',
    aiAdvisorTitle: 'AI安全顾问',
    recommendedActions: '建议操作',
    downloadReport: '下载安全报告',
    reportTitle: 'SentinelPhish 安全报告',
    reportGeneratedOn: '生成时间',
    reportUrl: '已分析的URL',
    reportDomainAge: '域名年龄',
    reportRegistrar: '注册商',
    reportExpiry: '到期日期',
    reportRiskScore: '风险评分',
    reportStatus: '状态',
    reportRedFlags: '启发式标记',
    reportAiSummary: 'AI安全摘要',
    reportAiAdvice: '建议操作',
    reportPrint: '打印 / 保存为PDF',
    settingsTitle: '设置',
    settingsLanguage: '语言',
    settingsAiMode: 'AI响应模式',
    settingsAiModeConcise: '直接 / 简洁',
    settingsAiModeEducational: '详细 / 教育',
    settingsTurboMode: 'Turbo 模式 (极速扫描)',
    settingsLiveGlow: '实时威胁发光',
    settingsHeuristicLevel: '启发式分析细节',
    settingsClose: '保存并关闭',
    phishTankTitle: 'Phish-Tank 分析与统计',
    phishTankTotal: '总扫描次数',
    phishTankThreats: '已拦截威胁',
    phishTankSafety: '安全防护评分',
    phishTankActivity: '历史安全趋势图',
    phishTankRank: '当前军衔',
    phishTankInitiate: '初级侦察兵',
    phishTankGuardian: '赛博守护者',
    phishTankElite: '精英哨兵',
    phishTankDailyBounty: '每日赏金',
    phishTankDailyGoal: '扫描 5 个 URL 以保持连胜',
    phishTankLeaderboard: '全球哨兵排行榜',
    phishTankXP: '经验值',
    statusSafe: '安全',
    statusSuspicious: '可疑',
    statusDangerous: '危险',
  },
};
