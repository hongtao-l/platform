# 时光相册 — 完整 API 调用示例（百炼 qwen3.6-flash）

> 完整版提示词（含成年人、宠物子分类、Emotion），独立文件，不覆盖原文档。

## 一、提示词

```
识别图片，如果是人物，则识别成老人(60岁以上)、小孩(10岁以下)、成年人(10岁～60岁)以及情绪；如果是宠物，则识别是哪种宠物; 返回格式如下: 1. 以json的方式返回结果, 返回结果中不要带有空格, 不要带有markdown格式等多余的内容。2. 示例json结构：{"list":[{"result":[{"Index":0},{"Index":0},{"Index":0}]},{"result":[{"Index":1},{"Index":1},{"Index":1}]}]}; 最外层使用一个大json，大json下使用list数组来记录每张图片的识别结果，数组长度就是识别图片的总数量。list数组的每一个元素是一个result数组，result用来保存图片的识别结果，一个图可能会同时存在老人、儿童、宠物3种结果，所以result数组元素最少0个,最多会有3个； result结果中必须有一个独立的Index字段，来标识是哪张图片的下标，从0开始依次递增。3. 用X和Y字段int类型来表示所在区域的起始位置；用Height字段int类型来表示所识别区域的高度；用Weight字段int类型来表示所识别区域的宽度；用Type字段int类型来表示识别出来是什么类型(例如: 人、动物; 人用1来表示, 动物用2来表示), 用SubType字段int类型来表示具体是什么东西(例如: 老人、小孩、成年人、猫、狗等; 老人用1001, 小孩用1002, 成年人用1003，狗用2001, 猫用2002),；用AlbumType字段int类型来表示要保存的类型(识别到老人赋值为2, 小孩赋值为3, 动物赋值为4, 其他为0)；用Translation字段string类型来表示SubType内容的中文意思, 如果是识别出来是人则用Emotion字段string来标识该人的情绪；用Confidence字段float64类型来表示识别出来的置信度，结果保留5位小数。4.每张图片的结果都必须返回，识别不出结果，result中字段值用默认值表示。默认值必须是{"list":[{"result":[{"Index":0}]},{"result":[{"Index":1}]}]}这样的格式,有几张图片就要有几个result元素，Index对应第几张图片
```

---

## 二、API 调用示例

```json
{
    "model": "qwen3.6-flash",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/photo1.jpg"
                    }
                },
                {
                    "type": "text",
                    "text": "识别图片，如果是人物，则识别成老人(60岁以上)、小孩(10岁以下)、成年人(10岁～60岁)以及情绪；如果是宠物，则识别是哪种宠物; 返回格式如下: 1. 以json的方式返回结果, 返回结果中不要带有空格, 不要带有markdown格式等多余的内容。2. 示例json结构：{\"list\":[{\"result\":[{\"Index\":0},{\"Index\":0},{\"Index\":0}]},{\"result\":[{\"Index\":1},{\"Index\":1},{\"Index\":1}]}]}; 最外层使用一个大json，大json下使用list数组来记录每张图片的识别结果，数组长度就是识别图片的总数量。list数组的每一个元素是一个result数组，result用来保存图片的识别结果，一个图可能会同时存在老人、儿童、宠物3种结果，所以result数组元素最少0个,最多会有3个； result结果中必须有一个独立的Index字段，来标识是哪张图片的下标，从0开始依次递增。3. 用X和Y字段int类型来表示所在区域的起始位置；用Height字段int类型来表示所识别区域的高度；用Weight字段int类型来表示所识别区域的宽度；用Type字段int类型来表示识别出来是什么类型(例如: 人、动物; 人用1来表示, 动物用2来表示), 用SubType字段int类型来表示具体是什么东西(例如: 老人、小孩、成年人、猫、狗等; 老人用1001, 小孩用1002, 成年人用1003，狗用2001, 猫用2002),；用AlbumType字段int类型来表示要保存的类型(识别到老人赋值为2, 小孩赋值为3, 动物赋值为4, 其他为0)；用Translation字段string类型来表示SubType内容的中文意思, 如果是识别出来是人则用Emotion字段string来标识该人的情绪；用Confidence字段float64类型来表示识别出来的置信度，结果保留5位小数。4.每张图片的结果都必须返回，识别不出结果，result中字段值用默认值表示。默认值必须是{\"list\":[{\"result\":[{\"Index\":0}]},{\"result\":[{\"Index\":1}]}]}这样的格式,有几张图片就要有几个result元素，Index对应第几张图片"
                }
            ]
        }
    ]
}
```

### 期望输出（2张图，第1张有老人+狗，第2张有猫）

```json
{"list":[{"result":[{"Index":0,"X":120,"Y":80,"Height":340,"Weight":200,"Type":1,"SubType":1001,"AlbumType":2,"Translation":"老人","Emotion":"开心","Confidence":0.95210},{"Index":0,"X":400,"Y":200,"Height":150,"Weight":180,"Type":2,"SubType":2001,"AlbumType":4,"Translation":"狗","Emotion":"","Confidence":0.88150}]},{"result":[{"Index":1,"X":50,"Y":30,"Height":200,"Weight":160,"Type":2,"SubType":2002,"AlbumType":4,"Translation":"猫","Emotion":"","Confidence":0.92300}]}]}
```

### 期望输出（2张图，都无识别结果）

```json
{"list":[{"result":[{"Index":0}]},{"result":[{"Index":1}]}]}
```

### 期望输出（2张图，第1张有老人+儿童+狗，第2张无）

```json
{"list":[{"result":[{"Index":0,"X":100,"Y":60,"Height":300,"Weight":180,"Type":1,"SubType":1001,"AlbumType":2,"Translation":"老人","Emotion":"平静","Confidence":0.91200},{"Index":0,"X":250,"Y":120,"Height":200,"Weight":140,"Type":1,"SubType":1002,"AlbumType":3,"Translation":"小孩","Emotion":"开心","Confidence":0.89450},{"Index":0,"X":380,"Y":280,"Height":120,"Weight":160,"Type":2,"SubType":2001,"AlbumType":4,"Translation":"狗","Emotion":"","Confidence":0.86700}]},{"result":[{"Index":1}]}]}
```

---

## 三、代码骨架

```javascript
const SYSTEM_TEXT = `识别图片，如果是人物，则识别成老人(60岁以上)、小孩(10岁以下)、成年人(10岁～60岁)以及情绪；如果是宠物，则识别是哪种宠物; 返回格式如下: 1. 以json的方式返回结果, 返回结果中不要带有空格, 不要带有markdown格式等多余的内容。2. 示例json结构：{"list":[{"result":[{"Index":0},{"Index":0},{"Index":0}]},{"result":[{"Index":1},{"Index":1},{"Index":1}]}]}; 最外层使用一个大json，大json下使用list数组来记录每张图片的识别结果，数组长度就是识别图片的总数量。list数组的每一个元素是一个result数组，result用来保存图片的识别结果，一个图可能会同时存在老人、儿童、宠物3种结果，所以result数组元素最少0个,最多会有3个； result结果中必须有一个独立的Index字段，来标识是哪张图片的下标，从0开始依次递增。3. 用X和Y字段int类型来表示所在区域的起始位置；用Height字段int类型来表示所识别区域的高度；用Weight字段int类型来表示所识别区域的宽度；用Type字段int类型来表示识别出来是什么类型(例如: 人、动物; 人用1来表示, 动物用2来表示), 用SubType字段int类型来表示具体是什么东西(例如: 老人、小孩、成年人、猫、狗等; 老人用1001, 小孩用1002, 成年人用1003，狗用2001, 猫用2002),；用AlbumType字段int类型来表示要保存的类型(识别到老人赋值为2, 小孩赋值为3, 动物赋值为4, 其他为0)；用Translation字段string类型来表示SubType内容的中文意思, 如果是识别出来是人则用Emotion字段string来标识该人的情绪；用Confidence字段float64类型来表示识别出来的置信度，结果保留5位小数。4.每张图片的结果都必须返回，识别不出结果，result中字段值用默认值表示。默认值必须是{"list":[{"result":[{"Index":0}]},{"result":[{"Index":1}]}]}这样的格式,有几张图片就要有几个result元素，Index对应第几张图片`

async function analyzeAlbumImages(imageUrls) {
  const content = [
    ...imageUrls.map(url => ({
      type: 'image_url',
      image_url: { url }
    })),
    { type: 'text', text: SYSTEM_TEXT }
  ];

  const response = await fetch('https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
    },
    body: JSON.stringify({
      model: 'qwen3.6-flash',
      messages: [{ role: 'user', content }],
      temperature: 0,
      max_tokens: 4096
    })
  });

  const data = await response.json();

  let text = data.choices[0].message.content;
  text = text.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response: ' + text);
  return JSON.parse(match[0]);
}
```

---

*生成日期: 2026-06-26 | 模型: qwen3.6-flash | 端点: dashscope-us.aliyuncs.com*
