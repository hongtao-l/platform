const fs = require('fs');
const docPath = '物模型定义_v4.0.1.md';
let doc = fs.readFileSync(docPath, 'utf8');
const v4 = fs.readFileSync('物模型定义_v4.0.md', 'utf8');

/* ---------- 1. 解析 v4.0：顶层字段 → 原始文本块 ---------- */
function depthDelta(line) {
  const clean = line.replace(/\/\/.*$/, '');
  let d = 0;
  for (const ch of clean) { if (ch === '{' || ch === '[') d++; if (ch === '}' || ch === ']') d--; }
  return d;
}
const v4Blocks = new Map();
{
  const lines = v4.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s{0,12}"([A-Za-z_][A-Za-z0-9_]*)"\s*:/);
    if (!m) continue;
    const key = m[1];
    let depth = depthDelta(lines[i]);
    const block = [lines[i]];
    let j = i;
    while (depth > 0 && j + 1 < lines.length) { j++; block.push(lines[j]); depth += depthDelta(lines[j]); }
    if (!v4Blocks.has(key)) v4Blocks.set(key, block);
    i = j;
  }
}

/* v4.0 里没有、由 v4.0.1 新增的字段 */
const extra = {
  video_encode_capability: ['7', '支持的编码格式掩码，1 mJpg / 2 H264 / 4 H265 / 8 SVAC / 16 SVAC3'],
  video_resolution_capability: ['[]', '支持的分辨率清单'],
  scan_frequency: ['50', '扫描频率，单位 Hz，50 / 60'],
  capture_stream_count: ['1', '采集码流数量'],
  osd_count: ['2', 'OSD数量'],
  position_x: ['0', 'X 坐标，单位 px'],
  position_y: ['0', 'Y 坐标，单位 px'],
  file_type: ['1', '文件类型：1 录像；2 抓图；3 事件'],
  start_time: ['0', '起始时间，UTC 毫秒戳'],
  end_time: ['0', '结束时间，UTC 毫秒戳'],
  page: ['1', '页码'],
  page_size: ['20', '每页条数'],
  record_file_size: ['0', '占用空间，单位 KB'],
  oldest_record_time: ['0', '最旧文件时间，UTC 毫秒戳'],
  newest_record_time: ['0', '最新文件时间，UTC 毫秒戳'],
  snapshot_file_size: ['0', '占用空间，单位 KB'],
  oldest_event_time: ['0', '最旧事件时间，UTC 毫秒戳'],
  schedule_date: ['""', '单次计划的日期，格式 YYYY-MM-DD'],
  color_capability: ['[]', '支持的色彩类型'],
  color_temp: ['2700', '色温，单位 K，2700~6500'],
  light_mode_ability: ['[]', '支持的灯光模式'],
  analysis_interval: ['1000', '分析间隔，单位毫秒'],
  template: ['0', '模板']
};

/* ---------- 2. 提取当前文档里每个能力项的 id / 元信息 / 顶层字段 ---------- */
const items = [];
{
  const re = /\*\*`([A-Za-z]+)`（([^）]*)）\*\*\n\n```json\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(doc))) {
    const [, id, meta, body] = m;
    const keys = [];
    body.split('\n').forEach((line) => {
      const km = line.match(/^ {4}"([A-Za-z_][A-Za-z0-9_]*)":/);
      if (km) keys.push(km[1]);
    });
    items.push({ id, meta, keys, start: m.index, end: re.lastIndex });
  }
}

/* ---------- 3. 生成新的正文 ---------- */
function reindent(block) {
  const firstIndent = block[0].match(/^\s*/)[0].length;
  return block.map((l) => l.replace(/^\s{0,40}(\S)/, (mm, ch) => mm.slice(0, Math.max(0, mm.length - firstIndent)) + ch));
}

function emit(keys) {
  const out = [];
  keys.forEach((k, i) => {
    const isLast = i === keys.length - 1;
    let block;
    if (v4Blocks.has(k)) {
      block = reindent(v4Blocks.get(k)).map((l) => l.replace(/^ {4}/, '    '));
    } else if (extra[k]) {
      block = ['    "' + k + '": ' + extra[k][0] + ', // ' + extra[k][1]];
    } else {
      block = ['    "' + k + '": 0, // ' + k];
    }
    // 去掉块尾的逗号，再按需补
    const lastIdx = block.length - 1;
    block[lastIdx] = block[lastIdx].replace(/,\s*(?=\/\/|$)/, '');
    if (!isLast) block[lastIdx] = block[lastIdx].replace(/(\/\/.*)$/, ', $1');
    out.push(block.join('\n'));
  });
  return '{\n' + out.join('\n') + '\n}\n';
}

/* 从后往前替换，避免偏移 */
for (let i = items.length - 1; i >= 0; i--) {
  const it = items[i];
  const newText = '**`' + it.id + '`（' + it.meta + '）**\n\n```json\n' + emit(it.keys) + '```';
  doc = doc.slice(0, it.start) + newText + doc.slice(it.end);
}

fs.writeFileSync(docPath, doc);
console.log('items:', items.length, '| lines:', doc.split('\n').length);
