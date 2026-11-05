import { reactive } from 'vue'

let _id = 100
const nextId = () => ++_id

// ===== 类目（树形，parentId=null 即顶级类目）=====
const _catAroma = nextId()
const _catIpc = nextId()
const _catBell = nextId()
const _catSensor = nextId()
const _catLowCam = nextId()
const _catPtz = nextId()
const _catMeter = nextId()

// 香薰机放最前（演示主设备）
const initialCategories = [
  { id: _catAroma, parentId: null, name: '香薰机', identifier: 'AromaDiffuser', descr: '香薰机设备类目，包含喷雾控制、定时、档位相关能力' },
  { id: _catIpc, parentId: null, name: 'IPC摄像机', identifier: 'IpcCamera', descr: 'IPC摄像机设备类目，包含视频监控、事件侦测相关能力' },
  { id: _catBell, parentId: null, name: '智能门铃', identifier: 'SmartDoorbell', descr: '智能门铃设备类目，包含门铃呼叫、门锁联动相关能力' },
  { id: _catSensor, parentId: null, name: '传感安防', identifier: 'SensorSecurity', descr: '传感器和安防设备类目，包含环境监测和安防告警能力' },
  { id: _catMeter, parentId: null, name: '智能电表', identifier: 'SmartMeter', descr: '电能计量类目，包含实时电气量、分时电量、预付费与拉合闸能力' },
  { id: _catLowCam, parentId: _catIpc, name: '低功耗摄像机', identifier: 'LowPowerCamera', descr: '电池供电的低功耗摄像机' },
  { id: _catPtz, parentId: _catIpc, name: '长电球机', identifier: 'LongPowerPtzCamera', descr: '长电供电的云台球机' }
]

// ===== 能力模块 + 能力项 + 参数（由 v4.1 物模型生成）=====
const MOD_DEV = { id: nextId(), name: '设备模块', identifier: 'DeviceModule' }
const MOD_IMAGE = { id: nextId(), name: '图像模块', identifier: 'ImageModule' }
const MOD_AUDIO = { id: nextId(), name: '声音模块', identifier: 'AudioModule' }
const MOD_DISPLAY = { id: nextId(), name: '屏幕模块', identifier: 'DisplayModule' }
const MOD_IOT = { id: nextId(), name: 'IoT子设备模块', identifier: 'IotModule' }
const MOD_TIME = { id: nextId(), name: '时间模块', identifier: 'TimeModule' }
const MOD_STORAGE = { id: nextId(), name: '存储模块', identifier: 'StorageModule' }
const MOD_OTA = { id: nextId(), name: 'OTA模块', identifier: 'OtaModule' }
const MOD_POWER = { id: nextId(), name: '电源模块', identifier: 'PowerModule' }
const MOD_NETWORK = { id: nextId(), name: '网络模块', identifier: 'NetworkModule' }
const MOD_RECORD = { id: nextId(), name: '录像模块', identifier: 'RecordModule' }
const MOD_WORKMODE = { id: nextId(), name: '工作模式模块', identifier: 'WorkModeModule' }
const MOD_LIGHT = { id: nextId(), name: '灯光模块', identifier: 'LightModule' }
const MOD_ALGO = { id: nextId(), name: '算法模块', identifier: 'AlgoModule' }
const MOD_GPS = { id: nextId(), name: '定位模块', identifier: 'GpsModule' }
const MOD_SENSOR = { id: nextId(), name: '传感模块', identifier: 'SensorModule' }
const MOD_CALL = { id: nextId(), name: '呼叫模块', identifier: 'CallModule' }
const MOD_AROMA = { id: nextId(), name: '香薰模块', identifier: 'AromaModule' }
const MOD_METER = { id: nextId(), name: '电能计量模块', identifier: 'MeterModule' }

const initialModules = [
  MOD_DEV, MOD_IMAGE, MOD_AUDIO, MOD_DISPLAY, MOD_IOT, MOD_TIME, MOD_STORAGE, MOD_OTA, MOD_POWER, MOD_NETWORK, MOD_RECORD, MOD_WORKMODE, MOD_LIGHT, MOD_ALGO, MOD_GPS, MOD_SENSOR, MOD_CALL, MOD_AROMA, MOD_METER
]

// 参数构造：dataDef.accessMode 仅供平台兼容读取（'r' 只读 / 'rw' 读写 / '-' 服务与事件）
const C = (dataType, identifier, name, descr, extra = {}) => ({ dataType, identifier, name, descr, extra })
const mk = (moduleId, capType, am, c) => ({
  id: nextId(), moduleId, capType, name: c.name, identifier: c.identifier, descr: c.descr,
  dataDef: am === '-' ? { dataType: c.dataType, ...c.extra } : { dataType: c.dataType, accessMode: am, ...c.extra }
})

const initialCapabilities = [
  // DeviceInfoProperty · 设备信息
  mk(MOD_DEV.id, 'prop', 'r', C('string', 'company_id', '企业ID', '企业唯一标识', { maxLength: 32 })),
  mk(MOD_DEV.id, 'prop', 'r', C('string', 'product_id', '产品ID', '产品唯一标识', { maxLength: 32 })),
  mk(MOD_DEV.id, 'prop', 'r', C('string', 'ctei', '设备授权ID', '设备授权标识', { maxLength: 64 })),
  mk(MOD_DEV.id, 'prop', 'r', C('string', 'did', '设备DID', '设备唯一ID', { maxLength: 64 })),
  mk(MOD_DEV.id, 'prop', 'r', C('string', 'gid', '绑定组ID', '设备绑定组', { maxLength: 64 })),
  // DeviceProperty · 设备设置
  mk(MOD_DEV.id, 'prop', 'rw', C('string', 'device_name', '设备名称', '仅此项可修改', { maxLength: 32 })),
  // CaptureInfoProperty · 图像信息
  mk(MOD_IMAGE.id, 'prop', 'r', C('int', 'capture_stream_id', '采集码流ID', '主键，从0开始', { min: 0, max: 3, unit: '', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('enum', 'conbine_stream_type', '合成流类型', '镜头合并方式', { enumValues: [{ name: '非合并', val: 0 }, { name: '双镜头左右', val: 1 }, { name: '双镜头上下', val: 2 }, { name: '三镜头上下', val: 3 }, { name: '三镜头上2下1', val: 4 }, { name: '三镜头上1下2', val: 5 }, { name: '三镜头左右', val: 6 }, { name: '四镜头上下', val: 7 }, { name: '四镜头2×2', val: 8 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('array', 'conbine_lens_ids', '合并镜头ID', '类型为0时为空', { elementType: 'struct', maxLength: 8, fields: [{ name: '镜头ID', identifier: 'lens_id', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('enum', 'focal_type', '焦距类型', '变焦实现方式', { enumValues: [{ name: '固定焦距', val: 0 }, { name: '机械变焦', val: 1 }, { name: '电子变焦(设备)', val: 2 }, { name: '电子变焦(APP)', val: 3 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('int', 'focal_length_min', '最小焦距', '支持的最小焦距', { min: 1, max: 100, unit: '', defaultVal: '1' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('int', 'focal_length_max', '最大焦距', '支持的最大焦距', { min: 1, max: 100, unit: '', defaultVal: '28' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('int', 'encode_stream_count', '编码流数量', '每路采集流的编码流数', { min: 1, max: 8, unit: '个', defaultVal: '1' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('int', 'lens_count', '镜头数量', '设备镜头数', { min: 1, max: 8, unit: '个', defaultVal: '2' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('int', 'show_stream_count', '显示流数量', '客户端显示流数', { min: 1, max: 8, unit: '个', defaultVal: '1' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'snap_ability', '支持抓图', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'wdr_ability', '支持WDR', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'hdr_ability', '支持HDR', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'anti_flicker_ability', '支持防闪', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'privacy_mask_ability', '支持隐私遮挡', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'region_sign_ability', '支持区域标记', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'custom_osd_ability', '支持自定义OSD', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('enum', 'osd_show_ability', 'OSD显示位置', '显示位置', { enumValues: [{ name: 'APP端显示', val: 0 }, { name: '设备端显示', val: 1 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('enum', 'lens_corrent_type', '镜头矫正类型', '是否需要矫正', { enumValues: [{ name: '不需要矫正', val: 0 }, { name: '需要矫正', val: 1 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('struct', 'lens_correct_algorithm', '镜头矫正算法', '需要矫正时下发', { fields: [{ name: '算法ID', identifier: 'correct_algorithm_id', dataType: 'string' }, { name: '算法参数', identifier: 'correct_algorithm_param', dataType: 'string' }] })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('enum', 'pt_control_type', 'PT控制类型', '云台控制方式', { enumValues: [{ name: '不支持', val: 0 }, { name: '设备控制', val: 1 }, { name: '分镜头控制', val: 2 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('array', 'pt_ability', '镜头PT能力', '每镜头能力值', { elementType: 'struct', maxLength: 8, fields: [{ name: '能力值', identifier: 'ability', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'ptz_3d_position_ability', '支持PTZ3D居中', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'ptz_preset_ability', '支持预置位', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'ptz_cruise_ability', '支持巡航', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'r', C('boolean', 'ptz_speed_ability', '支持速度调节', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // CaptureProperty · 图像设置
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'capture_stream_id', '采集码流ID', '主键', { min: 0, max: 3, unit: '', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('enum', 'flip_type', '翻转类型', '画面方向', { enumValues: [{ name: '不翻转', val: 0 }, { name: '水平', val: 1 }, { name: '垂直', val: 2 }, { name: '水平+垂直', val: 3 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'focal_length', '当前焦距', '当前变焦值', { min: 1, max: 100, unit: '', defaultVal: '10' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'encode_stream_id', '编码码流ID', '主键', { min: 0, max: 7, unit: '', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'width', '宽度', '分辨率宽', { min: 160, max: 8192, unit: 'px', defaultVal: '1920' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'height', '高度', '分辨率高', { min: 120, max: 4320, unit: 'px', defaultVal: '1080' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('enum', 'video_encode_type', '编码类型', '视频编码格式', { enumValues: [{ name: 'mJpg', val: 1 }, { name: 'H264', val: 2 }, { name: 'H265', val: 4 }, { name: 'SVAC', val: 8 }, { name: 'SVAC3', val: 16 }], defaultVal: '2' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'frame_rate', '帧率', '每秒帧数', { min: 1, max: 60, unit: 'fps', defaultVal: '25' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('enum', 'video_encode_mode', '编码模式', '码率控制', { enumValues: [{ name: 'CBR', val: 0 }, { name: 'VBR', val: 1 }, { name: 'AVBR', val: 2 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('boolean', 'wdr_mode', 'WDR开关', '宽动态', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('boolean', 'hdr_mode', 'HDR开关', '高动态', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('boolean', 'anti_flicker_mode', '防闪开关', '抗频闪', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('enum', 'scan_frequency', '扫描频率', '工频', { enumValues: [{ name: '50Hz', val: 50 }, { name: '60Hz', val: 60 }], defaultVal: '50' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('boolean', 'osd_enable', 'OSD总开关', '水印开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('array', 'osd_list', 'OSD列表', '上限 8', { elementType: 'struct', maxLength: 8, fields: [{ name: 'OSD ID', identifier: 'osd_id', dataType: 'int' }, { name: '内容', identifier: 'osd_content', dataType: 'string' }, { name: '位置', identifier: 'osd_position', dataType: 'int' }, { name: '字号', identifier: 'osd_size', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('array', 'privacy_mask_list', '隐私遮挡', '上限 8', { elementType: 'struct', maxLength: 8, fields: [{ name: '区域ID', identifier: 'privacy_mask_id', dataType: 'int' }, { name: '名称', identifier: 'privacy_mask_name', dataType: 'string' }, { name: '启用', identifier: 'privacy_mask_enable', dataType: 'boolean' }, { name: 'X', identifier: 'privacy_mask_x', dataType: 'int' }, { name: 'Y', identifier: 'privacy_mask_y', dataType: 'int' }, { name: '宽', identifier: 'privacy_mask_width', dataType: 'int' }, { name: '高', identifier: 'privacy_mask_height', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'ptz_speed', 'PTZ速度', '转动速度 1~5', { min: 1, max: 5, unit: '', defaultVal: '2' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('array', 'pt_position_list', '预置位', '上限 10', { elementType: 'struct', maxLength: 8, fields: [{ name: '预置位ID', identifier: 'pt_position_id', dataType: 'int' }, { name: '名称', identifier: 'pt_position_name', dataType: 'string' }, { name: '图片ID', identifier: 'pt_position_pic_id', dataType: 'string' }, { name: 'X', identifier: 'pt_position_x', dataType: 'int' }, { name: 'Y', identifier: 'pt_position_y', dataType: 'int' }, { name: '倍率', identifier: 'pt_position_z', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'guard_pt_position_id', '看守位', '看守预置位ID', { min: 0, max: 10, unit: '', defaultVal: '1' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'guard_return_interval', '看守返回间隔', '秒', { min: 0, max: 3600, unit: '秒', defaultVal: '300' })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('array', 'cruise_list', '巡航路线', '上限 8', { elementType: 'struct', maxLength: 8, fields: [{ name: '巡航ID', identifier: 'cruise_id', dataType: 'int' }, { name: '途经点', identifier: 'cruise_points', dataType: 'array' }] })),
  // PTZControlService · 云台转动控制
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'lens_id', '镜头索引', '设备控制取 -1', { min: -1, max: 7, unit: '', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('enum', 'ptz_control_type', 'PTZ控制类型', '手动或预置位', { enumValues: [{ name: '手动', val: 0 }, { name: '预置位', val: 1 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'pt_position_id', '预置位ID', '预置位控制时使用', { min: 0, max: 10, unit: '', defaultVal: '1' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('enum', 'ptz_control', '控制方向', 'PTZ 方向', { enumValues: [{ name: '停止', val: 0 }, { name: '上', val: 1 }, { name: '下', val: 2 }, { name: '左', val: 3 }, { name: '右', val: 4 }, { name: '放大', val: 5 }, { name: '缩小', val: 6 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'ptz_step', '步长', '单次位移量', { min: 1, max: 100, unit: '', defaultVal: '5' })),
  // PTZResetService · 云台位置重置
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'lens_id', '镜头索引', '设备控制取 -1', { min: -1, max: 7, unit: '', defaultVal: '0' })),
  // SnapPictureService · 抓图
  mk(MOD_IMAGE.id, 'svc', '-', C('enum', 'snap_type', '抓图原因', '触发方式', { enumValues: [{ name: '手动', val: 1 }, { name: '定时', val: 2 }, { name: '事件', val: 3 }, { name: '巡检', val: 4 }], defaultVal: '1' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('enum', 'snap_picture_type', '抓图范围', '全图或单镜头', { enumValues: [{ name: '全图', val: 0 }, { name: '单镜头', val: 1 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('enum', 'picture_size_type', '图片规格', '清晰度', { enumValues: [{ name: '高清', val: 0 }, { name: '普通', val: 1 }, { name: '小图', val: 2 }, { name: '局部', val: 3 }], defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'capture_stream_id', '采集码流ID', '抓图或开关适用', { min: 0, max: 3, unit: '', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'snap_picture_interval', '抓图间隔', '抓多张时的间隔', { min: 0, max: 60000, unit: 'ms', defaultVal: '300' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'snap_picture_count', '抓图张数', '张数', { min: 1, max: 50, unit: '张', defaultVal: '1' })),
  // CaptureStreamSwitchService · 采集码流开关
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'capture_stream_id', '采集码流ID', '抓图或开关适用', { min: 0, max: 3, unit: '', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('boolean', 'capture_stream_enable', '采集流开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // CruiseService · 执行巡航
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'cruise_id', '巡航ID', '巡航编号', { min: 0, max: 7, unit: '', defaultVal: '0' })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'cruise_interval', '巡航间隔', '0 表示只执行一次', { min: 0, max: 86400, unit: '秒', defaultVal: '0' })),
  // MicrophoneInfoProperty · 麦克风信息
  mk(MOD_AUDIO.id, 'prop', 'r', C('boolean', 'volumn_ability', '支持音量调节', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_AUDIO.id, 'prop', 'r', C('int', 'audio_encode_ability', '支持编码格式', '位掩码', { min: 0, max: 63, unit: '', defaultVal: '7' })),
  mk(MOD_AUDIO.id, 'prop', 'r', C('int', 'channel', '声道数', '声道', { min: 1, max: 2, unit: '声道', defaultVal: '1' })),
  mk(MOD_AUDIO.id, 'prop', 'r', C('int', 'sample_rate', '采样率', '采样频率', { min: 8000, max: 48000, unit: 'Hz', defaultVal: '8000' })),
  mk(MOD_AUDIO.id, 'prop', 'r', C('boolean', 'nr_ability', '支持降噪', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_AUDIO.id, 'prop', 'r', C('boolean', 'aec_ability', '支持回声消除', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // MicrophoneProperty · 麦克风设置
  mk(MOD_AUDIO.id, 'prop', 'rw', C('boolean', 'microphone_enable', '拾音开关', '关闭停止拾音', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'volumn', '音量', '1~100', { min: 1, max: 100, unit: '', defaultVal: '30' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'audio_encode_type', '编码类型', '当前编码', { min: 0, max: 63, unit: '', defaultVal: '4' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('enum', 'nr_level', '降噪等级', '噪声抑制强度', { enumValues: [{ name: '低', val: 1 }, { name: '中', val: 2 }, { name: '高', val: 3 }], defaultVal: '1' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('boolean', 'aec_enable', '回声消除', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // MicrophoneVolumnService · 麦克风音量调节
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'volumn', '音量', '1~100', { min: 1, max: 100, unit: '', defaultVal: '30' })),
  // MicrophoneCloseService · 麦克风拾音开关
  mk(MOD_AUDIO.id, 'svc', '-', C('boolean', 'microphone_enable', '拾音开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // SpeakerInfoProperty · 扬声器信息
  mk(MOD_AUDIO.id, 'prop', 'r', C('boolean', 'volumn_ability', '支持音量调节', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_AUDIO.id, 'prop', 'r', C('int', 'audio_encode_ability', '支持解码格式', '位掩码', { min: 0, max: 63, unit: '', defaultVal: '7' })),
  // SpeakerProperty · 扬声器设置
  mk(MOD_AUDIO.id, 'prop', 'rw', C('boolean', 'speaker_enable', '播放开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'volumn', '音量', '1~100', { min: 1, max: 100, unit: '', defaultVal: '30' })),
  // SoundFileProperty · 自定义语音
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'support_sound_file_format', '支持语音格式', '位掩码', { min: 0, max: 63, unit: '', defaultVal: '3' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('boolean', 'audio_upload_ability', '支持自定义上传', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('boolean', 'tts_ability', '支持TTS', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'max_audio_size', '单文件大小上限', '字节', { min: 0, max: 99999999, unit: '字节', defaultVal: '1024000' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'max_sound_size', '语音文件数量上限', '个', { min: 0, max: 100, unit: '个', defaultVal: '10' })),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('array', 'sound_file_list', '语音文件清单', '上限 10', { elementType: 'struct', maxLength: 10, fields: [{ name: '文件ID', identifier: 'sound_file_id', dataType: 'string' }, { name: '文件名称', identifier: 'sound_file_name', dataType: 'string' }, { name: '文件类型', identifier: 'sound_file_type', dataType: 'int' }, { name: '文件URL', identifier: 'sound_file_url', dataType: 'string' }, { name: '文件大小', identifier: 'sound_file_size', dataType: 'int' }, { name: 'TTS文本', identifier: 'tts_text', dataType: 'string' }] })),
  // SpeakerVolumnService · 扬声器音量调节
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'volumn', '音量', '1~100', { min: 1, max: 100, unit: '', defaultVal: '30' })),
  // SpeakerEnableService · 扬声器播放开关
  mk(MOD_AUDIO.id, 'svc', '-', C('boolean', 'speaker_enable', '播放开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // SoundFilePlayService · 语音播报
  mk(MOD_AUDIO.id, 'svc', '-', C('enum', 'sound_play_mode', '播放模式', '', { enumValues: [{ name: '单次', val: 0 }, { name: '循环', val: 1 }], defaultVal: '0' })),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'sound_play_priority', '优先级', '1~10', { min: 1, max: 10, unit: '', defaultVal: '1' })),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'sound_play_interval', '循环间隔', '毫秒', { min: 0, max: 60000, unit: 'ms', defaultVal: '3000' })),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'sound_play_count', '循环次数', '', { min: 1, max: 100, unit: '次', defaultVal: '1' })),
  mk(MOD_AUDIO.id, 'svc', '-', C('array', 'sound_file_list', '待播文件', '', { elementType: 'struct', maxLength: 8, fields: [{ name: '文件ID', identifier: 'sound_file_id', dataType: 'string' }] })),
  // DisplayInfoProperty · 屏幕信息
  mk(MOD_DISPLAY.id, 'prop', 'r', C('boolean', 'display_text_ability', '支持文字', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('boolean', 'display_richtext_ability', '支持富文本', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('boolean', 'display_picture_ability', '支持图片', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('boolean', 'display_video_ability', '支持视频', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('boolean', 'url_download_ability', '支持URL下载', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('boolean', 'display_screen_split_ability', '支持分屏', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('int', 'screen_width', '屏幕宽度', '像素', { min: 1, max: 8192, unit: 'px', defaultVal: '1920' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('int', 'screen_height', '屏幕高度', '像素', { min: 1, max: 8192, unit: 'px', defaultVal: '1080' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('int', 'support_picture_format', '支持图片格式', '位掩码', { min: 0, max: 31, unit: '', defaultVal: '7' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('int', 'support_video_encode_format', '支持视频格式', '位掩码', { min: 0, max: 15, unit: '', defaultVal: '7' })),
  mk(MOD_DISPLAY.id, 'prop', 'r', C('int', 'support_text_encode_format', '支持文字编码', '位掩码', { min: 0, max: 7, unit: '', defaultVal: '7' })),
  // DisplayProperty · 屏幕设置
  mk(MOD_DISPLAY.id, 'prop', 'rw', C('int', 'screen_saver_timeout', '屏保时长', '0 表示不休眠', { min: 0, max: 3600, unit: '秒', defaultVal: '60' })),
  mk(MOD_DISPLAY.id, 'prop', 'rw', C('boolean', 'auto_play_mode', '自动播放', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // DisPlayContentService · 屏显内容下发
  mk(MOD_DISPLAY.id, 'svc', '-', C('enum', 'display_content_type', '内容类型', '', { enumValues: [{ name: '文字', val: 0 }, { name: '图片', val: 1 }, { name: '视频', val: 2 }, { name: '富文本', val: 3 }, { name: 'URL', val: 4 }], defaultVal: '0' })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('enum', 'display_mode', '展示模式', '', { enumValues: [{ name: '单次', val: 0 }, { name: '循环', val: 1 }], defaultVal: '0' })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('string', 'text_content', '文字内容', '[type=0]', { maxLength: 1024 })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'text_encode_format', '文字编码格式', '[type=0] 位掩码', { min: 0, max: 7, unit: '', defaultVal: '1' })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('string', 'text_color', '文字颜色', '[type=0]', { maxLength: 9 })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'text_size', '文字大小', '[type=0]', { min: 8, max: 128, unit: '', defaultVal: '16' })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('struct', 'text_position', '文字位置', '[type=0] x/y 坐标', { fields: [{ name: 'X', identifier: 'x', dataType: 'int' }, { name: 'Y', identifier: 'y', dataType: 'int' }] })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'picture_count', '图片数量', '[type=1]', { min: 1, max: 8, unit: '张', defaultVal: '1' })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('array', 'picture_list', '图片列表', '[type=1]', { elementType: 'struct', maxLength: 8, fields: [{ name: '图片URL', identifier: 'picture_url', dataType: 'string' }, { name: '格式', identifier: 'picture_format', dataType: 'int' }] })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('string', 'video_url', '视频URL', '[type=2]', { maxLength: 512 })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'video_format', '视频格式', '[type=2]', { min: 0, max: 15, unit: '', defaultVal: '1' })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('string', 'richtext_content', '富文本内容', '[type=3]', { maxLength: 4096 })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'richtext_encode_format', '富文本编码格式', '[type=3] 位掩码', { min: 0, max: 7, unit: '', defaultVal: '1' })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('string', 'richtext_color', '富文本颜色', '[type=3]', { maxLength: 9 })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'richtext_size', '富文本大小', '[type=3]', { min: 8, max: 128, unit: '', defaultVal: '16' })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('struct', 'richtext_position', '富文本位置', '[type=3] x/y 坐标', { fields: [{ name: 'X', identifier: 'x', dataType: 'int' }, { name: 'Y', identifier: 'y', dataType: 'int' }] })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('string', 'url_content', 'URL内容', '[type=4]', { maxLength: 512 })),
  // DisPlayBackgroundService · 屏显背景图设置
  mk(MOD_DISPLAY.id, 'svc', '-', C('string', 'background_picture_url', '背景图URL', '', { maxLength: 512 })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'background_picture_format', '背景图格式', '', { min: 0, max: 31, unit: '', defaultVal: '1' })),
  // IoTGatewayInfoProperty · 子设备信息
  mk(MOD_IOT.id, 'prop', 'r', C('int', 'max_sub_device_count', '最大子设备数', '上限', { min: 0, max: 128, unit: '个', defaultVal: '10' })),
  mk(MOD_IOT.id, 'prop', 'r', C('array', 'sub_device_list', '子设备列表', '上限 32', { elementType: 'struct', maxLength: 8, fields: [{ name: '子设备ID', identifier: 'sub_device_id', dataType: 'string' }, { name: '名称', identifier: 'sub_device_name', dataType: 'string' }, { name: '类型', identifier: 'sub_device_type', dataType: 'string' }, { name: '状态', identifier: 'sub_device_status', dataType: 'int' }] })),
  // IoTGatewayManageService · 子设备管理（增删改）
  mk(MOD_IOT.id, 'svc', '-', C('enum', 'sub_device_edit_type', '编辑类型', '0 删除；1 编辑；2 添加', { enumValues: [{ name: '删除', val: 0 }, { name: '编辑', val: 1 }, { name: '添加', val: 2 }], defaultVal: '2' })),
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_id', '子设备ID', '目标子设备', { maxLength: 64 })),
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_name', '子设备名称', '添加/编辑时必填', { maxLength: 32 })),
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_type', '子设备类型', '添加/编辑时必填', { maxLength: 32 })),
  // IoTGatewayEditSubDeviceService · 编辑子设备属性
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_id', '子设备ID', '目标子设备', { maxLength: 64 })),
  mk(MOD_IOT.id, 'svc', '-', C('struct', 'sub_device_property', '子设备属性', '透传', { fields: [] })),
  // IoTGatewayExecuteSubDeviceService · 执行子设备操作
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_id', '子设备ID', '目标子设备', { maxLength: 64 })),
  mk(MOD_IOT.id, 'svc', '-', C('array', 'sub_device_services', '子设备服务', '', { elementType: 'struct', maxLength: 8, fields: [{ name: '服务ID', identifier: 'service_key', dataType: 'string' }, { name: '参数', identifier: 'service_param', dataType: 'struct' }] })),
  // TimeInfoProperty · 时间信息
  mk(MOD_TIME.id, 'prop', 'r', C('int', 'timestamp', '当前时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '1645678900' })),
  mk(MOD_TIME.id, 'prop', 'r', C('int', 'utc_offset', 'UTC偏移', '分钟，由时区推导', { min: -720, max: 840, unit: '分钟', defaultVal: '480' })),
  mk(MOD_TIME.id, 'prop', 'r', C('boolean', 'current_dst_status', '夏令时状态', '是否处于夏令时', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // TimeProperty · 时间设置
  mk(MOD_TIME.id, 'prop', 'rw', C('string', 'time_zone', '时区', 'IANA 时区名', { maxLength: 64 })),
  mk(MOD_TIME.id, 'prop', 'rw', C('boolean', 'dst_enable', '夏令时开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_TIME.id, 'prop', 'rw', C('int', 'dst_offset', '夏令时偏移', '分钟', { min: -120, max: 120, unit: '分钟', defaultVal: '60' })),
  mk(MOD_TIME.id, 'prop', 'rw', C('string', 'dst_start', '夏令时开始', 'M<月>.<周>.<星期>/<时间>', { maxLength: 32 })),
  mk(MOD_TIME.id, 'prop', 'rw', C('string', 'dst_end', '夏令时结束', 'M<月>.<周>.<星期>/<时间>', { maxLength: 32 })),
  // TimeService · 时间同步
  mk(MOD_TIME.id, 'svc', '-', C('int', 'timestamp', '同步时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '1645678900' })),
  // StorageInfoProperty · 存储信息
  mk(MOD_STORAGE.id, 'prop', 'r', C('boolean', 'storage_mount_status', '挂载状态', '是否可用', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_STORAGE.id, 'prop', 'r', C('enum', 'storage_type', '介质类型', '存储介质', { enumValues: [{ name: 'SDcard', val: 1 }, { name: 'EMMC', val: 2 }, { name: 'NAS', val: 3 }, { name: 'RAID', val: 4 }, { name: 'other', val: 5 }], defaultVal: '1' })),
  mk(MOD_STORAGE.id, 'prop', 'r', C('int', 'storage_total', '总容量', 'KB', { min: 0, max: 999999999, unit: 'KB', defaultVal: '12800000' })),
  mk(MOD_STORAGE.id, 'prop', 'r', C('int', 'storage_used', '已用容量', 'KB', { min: 0, max: 999999999, unit: 'KB', defaultVal: '12800' })),
  mk(MOD_STORAGE.id, 'prop', 'r', C('int', 'storage_free', '剩余容量', 'KB', { min: 0, max: 999999999, unit: 'KB', defaultVal: '12672000' })),
  mk(MOD_STORAGE.id, 'prop', 'r', C('string', 'storage_file_system', '文件系统', 'ext4 / fat32 / ntfs', { maxLength: 16 })),
  mk(MOD_STORAGE.id, 'prop', 'r', C('int', 'storage_support_max_capacity', '支持最大容量', 'KB', { min: 0, max: 999999999, unit: 'KB', defaultVal: '102400000' })),
  // StorageProperty · 存储设置
  mk(MOD_STORAGE.id, 'prop', 'rw', C('boolean', 'storage_erase_flag', '自动覆盖', '满后覆盖最旧文件', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_STORAGE.id, 'prop', 'rw', C('boolean', 'storage_protect_flag', '写保护', '限制格式化与写入', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // StorageService · 存储服务
  mk(MOD_STORAGE.id, 'svc', '-', C('string', 'storage_file_system', '文件系统', '缺省用设备默认', { maxLength: 16 })),
  mk(MOD_STORAGE.id, 'svc', '-', C('boolean', 'quick_format_flag', '快速格式化', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // OTAInfoProperty · OTA信息
  mk(MOD_OTA.id, 'prop', 'r', C('boolean', 'ota_ability', '支持OTA', '能力声明', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_OTA.id, 'prop', 'r', C('int', 'ota_support_mode', '支持升级方式', '位掩码', { min: 0, max: 15, unit: '', defaultVal: '7' })),
  mk(MOD_OTA.id, 'prop', 'r', C('string', 'firmware_version', '固件版本', '版本号', { maxLength: 32 })),
  mk(MOD_OTA.id, 'prop', 'r', C('string', 'sdk_version', 'SDK版本', '版本号', { maxLength: 32 })),
  mk(MOD_OTA.id, 'prop', 'r', C('string', 'api_version', 'API版本', '版本号', { maxLength: 32 })),
  mk(MOD_OTA.id, 'prop', 'r', C('array', 'module_versions', '分区版本', '分模块版本', { elementType: 'struct', maxLength: 8, fields: [{ name: '模块', identifier: 'module', dataType: 'string' }, { name: '版本', identifier: 'version', dataType: 'string' }] })),
  // OTAService · 固件升级
  mk(MOD_OTA.id, 'svc', '-', C('enum', 'ota_upgrade_type', '升级类型', '0 暂停；1 全量；2 增量；3 分区；4 断点续传', { enumValues: [{ name: '暂停', val: 0 }, { name: '全量', val: 1 }, { name: '增量', val: 2 }, { name: '分区', val: 3 }, { name: '断点续传', val: 4 }], defaultVal: '1' })),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'firmware_new_version', '目标版本', '升级后版本', { maxLength: 32 })),
  mk(MOD_OTA.id, 'svc', '-', C('struct', 'module_new_version', '分区目标版本', '分区升级用', { fields: [] })),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'file_url', '升级包URL', '下载地址', { maxLength: 512 })),
  mk(MOD_OTA.id, 'svc', '-', C('int', 'file_size', '升级包大小', '字节', { min: 0, max: 999999999, unit: '字节', defaultVal: '0' })),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'file_md5', '文件MD5', '校验值', { maxLength: 32 })),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'public_key', '下载公钥', '解密升级包', { maxLength: 2048 })),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'signature', '签名', '固件签名', { maxLength: 2048 })),
  // PowerInfoProperty · 电源信息
  mk(MOD_POWER.id, 'prop', 'r', C('enum', 'power_source', '供电来源', '当前供电方式', { enumValues: [{ name: 'AC/DC', val: 0 }, { name: 'POE', val: 1 }, { name: 'UPS', val: 2 }, { name: 'battery', val: 3 }, { name: 'SOLAR', val: 4 }], defaultVal: '0' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'input_voltage', '输入电压', 'V', { min: 0, max: 240, unit: 'V', defaultVal: '5' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'input_current', '输入电流', 'A', { min: 0, max: 50, unit: 'A', defaultVal: '1.5' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'output_voltage', '输出电压', 'V', { min: 0, max: 240, unit: 'V', defaultVal: '12' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'output_current', '输出电流', 'A', { min: 0, max: 50, unit: 'A', defaultVal: '2' })),
  mk(MOD_POWER.id, 'prop', 'r', C('int', 'power_on_time', '开机时间', 'UTC时间戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_POWER.id, 'prop', 'r', C('boolean', 'battery_present', '电池存在', '是否带电池', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_POWER.id, 'prop', 'r', C('enum', 'battery_type', '电池类型', '是否可充电', { enumValues: [{ name: '不可充电', val: 0 }, { name: '可充电', val: 1 }], defaultVal: '0' })),
  mk(MOD_POWER.id, 'prop', 'r', C('int', 'battery_capacity', '设计电量', 'mAh', { min: 0, max: 100000, unit: 'mAh', defaultVal: '8000' })),
  mk(MOD_POWER.id, 'prop', 'r', C('int', 'battery_full_capacity', '满充电量', 'mAh', { min: 0, max: 100000, unit: 'mAh', defaultVal: '7800' })),
  mk(MOD_POWER.id, 'prop', 'r', C('int', 'battery_remain_capacity', '剩余电量', 'mAh', { min: 0, max: 100000, unit: 'mAh', defaultVal: '5000' })),
  mk(MOD_POWER.id, 'prop', 'r', C('enum', 'charge_status', '充电状态', '充电进度', { enumValues: [{ name: '未充电', val: 0 }, { name: '充电中', val: 1 }, { name: '充满', val: 2 }, { name: '涓流', val: 3 }, { name: '未知', val: 4 }], defaultVal: '0' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'charge_voltage', '充电电压', 'V', { min: 0, max: 240, unit: 'V', defaultVal: '12' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'charge_current', '充电电流', 'A', { min: 0, max: 50, unit: 'A', defaultVal: '2' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'charge_power', '充电功率', 'W', { min: 0, max: 500, unit: 'W', defaultVal: '60' })),
  mk(MOD_POWER.id, 'prop', 'r', C('boolean', 'solar_present', '太阳能存在', '是否带太阳能板', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'solar_voltage', '太阳能电压', 'V', { min: 0, max: 240, unit: 'V', defaultVal: '12' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'solar_current', '太阳能电流', 'A', { min: 0, max: 50, unit: 'A', defaultVal: '2' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'solar_power', '太阳能功率', 'W', { min: 0, max: 500, unit: 'W', defaultVal: '24' })),
  mk(MOD_POWER.id, 'prop', 'r', C('double', 'solar_radiance', '光照强度', 'W/㎡', { min: 0, max: 2000, unit: 'W/㎡', defaultVal: '36' })),
  // PowerProperty · 电源设置
  mk(MOD_POWER.id, 'prop', 'rw', C('int', 'battery_lower_threshold', '低电量告警', '剩余百分比', { min: 1, max: 100, unit: '%', defaultVal: '20' })),
  mk(MOD_POWER.id, 'prop', 'rw', C('int', 'battery_critical_threshold', '严重低电量', '剩余百分比', { min: 1, max: 100, unit: '%', defaultVal: '10' })),
  mk(MOD_POWER.id, 'prop', 'rw', C('int', 'battery_shutdown_threshold', '关机阈值', '剩余百分比', { min: 0, max: 100, unit: '%', defaultVal: '5' })),
  // NetworkInfoProperty · 网络信息
  mk(MOD_NETWORK.id, 'prop', 'r', C('array', 'network_ability', '支持网络能力', '网络类型列表', { elementType: 'struct', maxLength: 8, fields: [{ name: '网络类型', identifier: 'network_type', dataType: 'int' }] })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('enum', 'network_type', '当前网络', '当前使用的网络', { enumValues: [{ name: '无网络', val: 0 }, { name: '有线', val: 1 }, { name: 'WIFI', val: 2 }, { name: '蜂窝', val: 3 }, { name: '蓝牙', val: 4 }, { name: 'zigbee', val: 5 }, { name: 'zwave', val: 6 }, { name: 'other', val: 7 }], defaultVal: '2' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('boolean', 'eth_status', '网口状态', '是否连接', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'eth_mac', '以太网MAC', '地址', { maxLength: 17 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'eth_ip', '以太网IP', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'eth_netmask', '子网掩码', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'eth_gateway', '网关', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'eth_dns', 'DNS', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'eth_dns2', 'DNS2', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('boolean', 'wifi_status', 'WIFI状态', '是否连接', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'wifi_mac', 'WIFI MAC', '地址', { maxLength: 17 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'wifi_ip', 'WIFI IP', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'wifi_netmask', 'WIFI掩码', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'wifi_gateway', 'WIFI网关', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'wifi_dns', 'WIFI DNS', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'wifi_dns2', 'WIFI DNS2', '地址', { maxLength: 15 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('int', 'wifi_single_strength', 'WIFI信号', 'dBm', { min: -100, max: 0, unit: 'dBm', defaultVal: '-65' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('enum', 'wifi_band', 'WIFI频段', '当前频段', { enumValues: [{ name: '2.4G', val: 0 }, { name: '5.8G', val: 1 }, { name: '6G', val: 2 }, { name: '60G', val: 3 }, { name: '60G+', val: 4 }, { name: 'other', val: 5 }], defaultVal: '0' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('boolean', 'bluetooth_status', '蓝牙状态', '是否连接', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'bluetooth_name', '蓝牙名称', '设备蓝牙名', { maxLength: 32 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'bluetooth_mac', '蓝牙MAC', '地址', { maxLength: 17 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('enum', 'bluetooth_version', '蓝牙版本', '协议版本', { enumValues: [{ name: '4.0', val: 1 }, { name: '4.2', val: 2 }, { name: '5.0', val: 3 }, { name: '5.1', val: 4 }], defaultVal: '1' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('enum', 'bluetooth_mode', '蓝牙模式', '工作模式', { enumValues: [{ name: 'ble', val: 1 }, { name: 'classic', val: 2 }, { name: 'dual', val: 3 }], defaultVal: '1' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('boolean', 'cellular_status', '蜂窝状态', '是否连接', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('enum', 'cellular_type', '蜂窝类型', '制式', { enumValues: [{ name: 'unknown', val: 0 }, { name: '2G', val: 1 }, { name: '3G', val: 2 }, { name: '4G Cat1', val: 3 }, { name: '4G Cat4', val: 4 }, { name: '5G', val: 5 }, { name: 'NBIot', val: 6 }], defaultVal: '0' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('int', 'cellular_single_strength', '蜂窝信号', 'dBm', { min: -140, max: 0, unit: 'dBm', defaultVal: '50' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'cellular_module', '模组型号', '4G模块', { maxLength: 32 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('string', 'cellular_imei', 'IMEI', '模组IMEI', { maxLength: 32 })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('array', 'cellular_band', '支持频段', '如 B1/B3/B8', { elementType: 'struct', maxLength: 8, fields: [{ name: '频段', identifier: 'band', dataType: 'string' }] })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('int', 'cellular_slot_count', '卡槽数量', 'SIM卡槽数', { min: 0, max: 4, unit: '个', defaultVal: '2' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('int', 'cellular_active_slot_id', '当前卡槽', '正在使用的卡槽', { min: 0, max: 4, unit: '', defaultVal: '0' })),
  mk(MOD_NETWORK.id, 'prop', 'r', C('array', 'cellular_slot_infos', '卡槽信息', '每槽详情', { elementType: 'struct', maxLength: 8, fields: [{ name: '卡槽ID', identifier: 'slot_id', dataType: 'int' }, { name: '状态', identifier: 'slot_status', dataType: 'int' }, { name: '类型', identifier: 'slot_type', dataType: 'int' }, { name: '优先级', identifier: 'slot_priority', dataType: 'int' }, { name: 'eSIM种子卡', identifier: 'esim_boot_profile_info', dataType: 'string' }, { name: 'ICCID', identifier: 'sim_iccid', dataType: 'string' }, { name: 'IMSI', identifier: 'sim_imsi', dataType: 'string' }, { name: '运营商', identifier: 'sim_operator_name', dataType: 'string' }, { name: 'APN', identifier: 'sim_apn_info', dataType: 'string' }] })),
  // NetworkProperty · 网络设置
  mk(MOD_NETWORK.id, 'prop', 'rw', C('boolean', 'eth_dhcp_enable', '以太网DHCP', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('enum', 'wifi_mode', 'WIFI模式', '工作模式', { enumValues: [{ name: 'station', val: 1 }, { name: 'ap', val: 2 }, { name: 'station+ap', val: 3 }], defaultVal: '1' })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'wifi_security_type', '安全类型', '加密方式', { min: 0, max: 8, unit: '', defaultVal: '3' })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_ssid', 'WiFi名称', 'SSID', { maxLength: 32 })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_password', 'WiFi密码', '读接口脱敏', { maxLength: 64 })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_ap_ssid', '热点名称', 'AP模式SSID', { maxLength: 32 })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_ap_password', '热点密码', '读接口脱敏', { maxLength: 64 })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'wifi_channel', '信道', '1~13', { min: 1, max: 13, unit: '', defaultVal: '1' })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('boolean', 'wifi_dhcp_enable', 'WIFI DHCP', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('array', 'cellular_slot_priority', '卡槽优先级', '数值越低越优先', { elementType: 'struct', maxLength: 8, fields: [{ name: '优先级', identifier: 'priority', dataType: 'int' }] })),
  // WiFiSettingService · WiFi配网
  mk(MOD_NETWORK.id, 'svc', '-', C('enum', 'wifi_mode', 'WIFI模式', '', { enumValues: [{ name: 'station', val: 1 }, { name: 'ap', val: 2 }, { name: 'station+ap', val: 3 }], defaultVal: '1' })),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'wifi_security_type', '安全类型', '', { min: 0, max: 8, unit: '', defaultVal: '3' })),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'wifi_ssid', 'SSID', '', { maxLength: 32 })),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'wifi_password', '密码', '', { maxLength: 64 })),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'wifi_ap_ssid', '热点SSID', '', { maxLength: 32 })),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'wifi_ap_password', '热点密码', '', { maxLength: 64 })),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'wifi_channel', '信道', '', { min: 1, max: 13, unit: '', defaultVal: '1' })),
  // CellularSlotSwitchService · 蜂窝卡槽切换
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'slot_id', '卡槽序号', '', { min: 0, max: 3, unit: '', defaultVal: '0' })),
  // CellularSlotAPNService · 卡槽APN配置
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'slot_id', '卡槽序号', '', { min: 0, max: 3, unit: '', defaultVal: '0' })),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'apn_info', 'APN信息', '', { maxLength: 64 })),
  // CellularSlotESIMService · eSIM Profile设置
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'slot_id', '卡槽序号', '', { min: 0, max: 3, unit: '', defaultVal: '0' })),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'esim_profile_info', 'eSIM Profile', '', { maxLength: 1024 })),
  // NetworkSwitchService · 工作网络切换
  mk(MOD_NETWORK.id, 'svc', '-', C('enum', 'network_type', '目标网络', '', { enumValues: [{ name: '有线', val: 1 }, { name: 'WIFI', val: 2 }, { name: '蜂窝', val: 3 }], defaultVal: '2' })),
  // RecordInfoProperty · 录像信息
  mk(MOD_RECORD.id, 'prop', 'r', C('int', 'cloud_record_mode_ability', '云录像支持类型', '位掩码', { min: 0, max: 7, unit: '', defaultVal: '7' })),
  mk(MOD_RECORD.id, 'prop', 'r', C('enum', 'local_record_status', '本地录像状态', '运行状态', { enumValues: [{ name: '未录像', val: 0 }, { name: '录像中', val: 1 }, { name: '录像错误', val: 2 }], defaultVal: '0' })),
  mk(MOD_RECORD.id, 'prop', 'r', C('enum', 'cloud_record_status', '云录像状态', '运行状态', { enumValues: [{ name: '未录像', val: 0 }, { name: '录像中', val: 1 }, { name: '录像错误', val: 2 }], defaultVal: '0' })),
  mk(MOD_RECORD.id, 'prop', 'r', C('int', 'record_file_count', '文件数量', '本地录像数', { min: 0, max: 999999, unit: '个', defaultVal: '520' })),
  // RecordProperty · 录像设置
  mk(MOD_RECORD.id, 'prop', 'rw', C('boolean', 'record_enable', '录像总开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_RECORD.id, 'prop', 'rw', C('boolean', 'local_record_enable', '本地录像', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_RECORD.id, 'prop', 'rw', C('boolean', 'cloud_record_enable', '云录像', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  // RecordService · 录像
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_mode', '录像模式', '位掩码', { min: 0, max: 7, unit: '', defaultVal: '1' })),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_streamid', '录制码流', '', { min: 0, max: 2, unit: '', defaultVal: '0' })),
  mk(MOD_RECORD.id, 'svc', '-', C('enum', 'record_data_format', '数据格式', '', { enumValues: [{ name: 'Stream', val: 1 }, { name: 'IFrame', val: 2 }, { name: 'JPEG', val: 3 }], defaultVal: '1' })),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_data_interval', '数据间隔', '毫秒', { min: 0, max: 10000, unit: 'ms', defaultVal: '1000' })),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'pre_record_time', '预录时长', '秒', { min: 0, max: 30, unit: '秒', defaultVal: '2' })),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_duration', '录像时长', '秒', { min: 1, max: 3600, unit: '秒', defaultVal: '15' })),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_interval', '录像间隔', '秒', { min: 0, max: 3600, unit: '秒', defaultVal: '10' })),
  // RecordQueryService · 查询本地文件
  mk(MOD_RECORD.id, 'svc', '-', C('enum', 'file_type', '文件类型', '', { enumValues: [{ name: '录像', val: 1 }, { name: '抓图', val: 2 }, { name: '事件', val: 3 }], defaultVal: '1' })),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'start_time', '起始时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'end_time', '结束时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  // WorkModeInfoProperty · 工作模式信息
  mk(MOD_WORKMODE.id, 'prop', 'r', C('int', 'work_mode_count', '模式数量', '支持的模式数', { min: 0, max: 8, unit: '个', defaultVal: '5' })),
  mk(MOD_WORKMODE.id, 'prop', 'r', C('array', 'work_mode_list', '模式清单', 'ID 与名称', { elementType: 'struct', maxLength: 8, fields: [{ name: '模式ID', identifier: 'work_mode_id', dataType: 'int' }, { name: '模式名称', identifier: 'work_mode_name', dataType: 'string' }] })),
  // WorkModeProperty · 工作模式设置
  mk(MOD_WORKMODE.id, 'prop', 'rw', C('int', 'current_work_mode_id', '当前模式', '模式ID', { min: 1, max: 8, unit: '', defaultVal: '1' })),
  mk(MOD_WORKMODE.id, 'prop', 'rw', C('struct', 'work_mode_param', '模式参数', '设备自定义，透传', { fields: [] })),
  // WorkModeService · 工作模式服务
  mk(MOD_WORKMODE.id, 'svc', '-', C('int', 'work_mode_id', '目标模式', '切换后的模式ID', { min: 1, max: 8, unit: '', defaultVal: '1' })),
  // LightInfoProperty · 灯光信息
  mk(MOD_LIGHT.id, 'prop', 'r', C('int', 'light_count', '灯数量', '设备灯数', { min: 0, max: 8, unit: '个', defaultVal: '1' })),
  mk(MOD_LIGHT.id, 'prop', 'r', C('array', 'light_list', '灯清单', '类型与能力', { elementType: 'struct', maxLength: 8, fields: [{ name: '灯ID', identifier: 'light_id', dataType: 'int' }, { name: '名称', identifier: 'light_name', dataType: 'string' }, { name: '类型', identifier: 'light_type', dataType: 'int' }, { name: '支持模式', identifier: 'light_mode_ability', dataType: 'array' }] })),
  // LightProperty · 灯光设置
  mk(MOD_LIGHT.id, 'prop', 'rw', C('array', 'light_list', '灯参数', '每灯状态与参数', { elementType: 'struct', maxLength: 8, fields: [{ name: '灯ID', identifier: 'light_id', dataType: 'int' }, { name: '启用', identifier: 'light_enable', dataType: 'boolean' }, { name: '模式', identifier: 'light_mode', dataType: 'int' }, { name: '亮度', identifier: 'brightness', dataType: 'int' }, { name: '色温', identifier: 'colortemp', dataType: 'int' }, { name: 'RGB', identifier: 'color_rgb', dataType: 'string' }] })),
  mk(MOD_LIGHT.id, 'prop', 'rw', C('array', 'light_mode_list', '灯光模式', '多灯联合定义', { elementType: 'struct', maxLength: 8, fields: [{ name: '模式ID', identifier: 'light_mode_id', dataType: 'int' }, { name: '模式名称', identifier: 'light_mode_name', dataType: 'string' }, { name: '联合动作', identifier: 'light_switch_services', dataType: 'array' }] })),
  // LightSwitchService · 切换单灯
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'light_id', '灯ID', '', { min: 1, max: 8, unit: '', defaultVal: '1' })),
  mk(MOD_LIGHT.id, 'svc', '-', C('boolean', 'light_enable', '启用', '', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_LIGHT.id, 'svc', '-', C('enum', 'light_mode', '灯光模式', '', { enumValues: [{ name: 'off', val: 0 }, { name: 'on', val: 1 }, { name: 'auto', val: 2 }, { name: 'breath', val: 3 }, { name: 'flash', val: 4 }], defaultVal: '0' })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'light_duration', '持续时长', '秒，0 为持续', { min: 0, max: 3600, unit: '秒', defaultVal: '0' })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'brightness', '亮度', '0~100', { min: 0, max: 100, unit: '%', defaultVal: '0' })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'colortemp', '色温', '2700~6500', { min: 2700, max: 6500, unit: 'K', defaultVal: '4000' })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'color_mode', '色彩模式', '0 无；1 RGB；2 HSV；3 CCT；4 Preset', { min: 0, max: 4, unit: '', defaultVal: '1' })),
  mk(MOD_LIGHT.id, 'svc', '-', C('string', 'color_rgb', 'RGB颜色', '', { maxLength: 7 })),
  mk(MOD_LIGHT.id, 'svc', '-', C('string', 'color_hsv', 'HSV颜色', '', { maxLength: 7 })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'flash_count', '闪烁次数', '0 为无限', { min: 0, max: 255, unit: '次', defaultVal: '0' })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'flash_interval', '闪烁间隔', '秒', { min: 0, max: 60, unit: '秒', defaultVal: '0' })),
  // LightModeSwitchService · 切换灯光模式
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'light_mode_id', '灯光模式ID', '', { min: 1, max: 8, unit: '', defaultVal: '1' })),
  // AlgorithmInfoProperty · 算法信息
  mk(MOD_ALGO.id, 'prop', 'r', C('int', 'algorithm_count', '算法数量', '支持算法数', { min: 0, max: 32, unit: '个', defaultVal: '9' })),
  mk(MOD_ALGO.id, 'prop', 'r', C('int', 'algorithm_running_count', '并发上限', '同时工作算法数', { min: 0, max: 32, unit: '个', defaultVal: '4' })),
  mk(MOD_ALGO.id, 'prop', 'r', C('int', 'algorithm_enabled_count', '已启用数量', '当前启用数', { min: 0, max: 32, unit: '个', defaultVal: '2' })),
  mk(MOD_ALGO.id, 'prop', 'r', C('array', 'algorithm_list', '算法清单', 'ID/名称/类型', { elementType: 'struct', maxLength: 8, fields: [{ name: '算法ID', identifier: 'algorithm_id', dataType: 'string' }, { name: '算法名称', identifier: 'algorithm_name', dataType: 'string' }, { name: '类型', identifier: 'algorithm_type', dataType: 'int' }, { name: '运行中', identifier: 'algorithm_running', dataType: 'boolean' }] })),
  // AlgorithmProperty · 算法设置
  mk(MOD_ALGO.id, 'prop', 'rw', C('array', 'algorithm_list', '算法参数', '启用/灵敏度/间隔', { elementType: 'struct', maxLength: 8, fields: [{ name: '算法ID', identifier: 'algorithm_id', dataType: 'string' }, { name: '启用', identifier: 'algorithm_enable', dataType: 'boolean' }, { name: '灵敏度', identifier: 'algorithm_sensitive', dataType: 'int' }, { name: '分析间隔', identifier: 'analysis_interval', dataType: 'int' }] })),
  // AlgorithmEnableService · 启用/禁用算法
  mk(MOD_ALGO.id, 'svc', '-', C('string', 'algorithm_id', '算法ID', '目标算法', { maxLength: 64 })),
  mk(MOD_ALGO.id, 'svc', '-', C('boolean', 'algorithm_enable', '启用', '', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // AlgorithmRunningService · 启动/停止算法
  mk(MOD_ALGO.id, 'svc', '-', C('string', 'algorithm_id', '算法ID', '目标算法', { maxLength: 64 })),
  mk(MOD_ALGO.id, 'svc', '-', C('boolean', 'algorithm_running', '运行', '', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  // GPSInfoProperty · GPS信息
  mk(MOD_GPS.id, 'prop', 'r', C('enum', 'gps_status', '定位状态', '当前定位情况', { enumValues: [{ name: '关闭', val: 0 }, { name: '已定位', val: 1 }, { name: '定位中', val: 2 }, { name: '信号丢失', val: 3 }], defaultVal: '0' })),
  mk(MOD_GPS.id, 'prop', 'r', C('double', 'gps_latitude', '纬度', '度', { min: -90, max: 90, unit: '度', defaultVal: '0' })),
  mk(MOD_GPS.id, 'prop', 'r', C('double', 'gps_longitude', '经度', '度', { min: -180, max: 180, unit: '度', defaultVal: '0' })),
  mk(MOD_GPS.id, 'prop', 'r', C('double', 'gps_altitude', '海拔', '米', { min: -500, max: 10000, unit: '米', defaultVal: '0' })),
  mk(MOD_GPS.id, 'prop', 'r', C('double', 'gps_speed', '速度', 'km/h', { min: 0, max: 500, unit: 'km/h', defaultVal: '0' })),
  mk(MOD_GPS.id, 'prop', 'r', C('double', 'gps_direction', '方向', '正北为0度', { min: 0, max: 359.9, unit: '度', defaultVal: '0' })),
  mk(MOD_GPS.id, 'prop', 'r', C('int', 'gps_time', '定位时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_GPS.id, 'prop', 'r', C('double', 'gps_distance', '累计距离', '上报后清零', { min: 0, max: 99999, unit: '米', defaultVal: '50' })),
  // GPSProperty · GPS设置
  mk(MOD_GPS.id, 'prop', 'rw', C('boolean', 'gps_enable', 'GPS开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_GPS.id, 'prop', 'rw', C('enum', 'report_mode', '上报模式', '上报触发方式', { enumValues: [{ name: '定时', val: 1 }, { name: '距离', val: 2 }, { name: '混合', val: 3 }], defaultVal: '1' })),
  mk(MOD_GPS.id, 'prop', 'rw', C('int', 'report_interval', '上报间隔', '秒', { min: 1, max: 3600, unit: '秒', defaultVal: '10' })),
  mk(MOD_GPS.id, 'prop', 'rw', C('double', 'report_distance', '上报距离', '米', { min: 1, max: 10000, unit: '米', defaultVal: '100' })),
  mk(MOD_GPS.id, 'prop', 'rw', C('array', 'fence_list', '电子围栏', '上限 8', { elementType: 'struct', maxLength: 8, fields: [{ name: '围栏ID', identifier: 'fence_id', dataType: 'int' }, { name: '名称', identifier: 'fence_name', dataType: 'string' }, { name: '启用', identifier: 'fence_enable', dataType: 'boolean' }, { name: '类型', identifier: 'fence_type', dataType: 'int' }, { name: '半径', identifier: 'fence_radius', dataType: 'double' }, { name: '圆心', identifier: 'fence_center', dataType: 'struct' }, { name: '顶点', identifier: 'fence_points', dataType: 'array' }] })),
  // GPSReportService · GPS上报策略调整
  mk(MOD_GPS.id, 'svc', '-', C('boolean', 'gps_enable', 'GPS开关', '', { trueLabel: '开', falseLabel: '关', defaultVal: '0' })),
  mk(MOD_GPS.id, 'svc', '-', C('enum', 'report_mode', '上报模式', '', { enumValues: [{ name: '定时', val: 1 }, { name: '距离', val: 2 }, { name: '混合', val: 3 }], defaultVal: '1' })),
  mk(MOD_GPS.id, 'svc', '-', C('int', 'report_interval', '上报间隔', '秒', { min: 1, max: 3600, unit: '秒', defaultVal: '10' })),
  mk(MOD_GPS.id, 'svc', '-', C('double', 'report_distance', '上报距离', '米', { min: 1, max: 10000, unit: '米', defaultVal: '100' })),
  // GPSFenceService · GPS电子围栏设置
  mk(MOD_GPS.id, 'svc', '-', C('enum', 'fence_control', '围栏操作', '0 删除；1 新增', { enumValues: [{ name: '删除', val: 0 }, { name: '新增', val: 1 }], defaultVal: '1' })),
  mk(MOD_GPS.id, 'svc', '-', C('array', 'fence_id', '围栏ID', '待删除列表', { elementType: 'struct', maxLength: 8, fields: [{ name: '围栏ID', identifier: 'fence_id', dataType: 'int' }] })),
  mk(MOD_GPS.id, 'svc', '-', C('string', 'fence_name', '围栏名称', '', { maxLength: 32 })),
  mk(MOD_GPS.id, 'svc', '-', C('int', 'fence_type', '围栏类型', '', { min: 0, max: 1, unit: '', defaultVal: '0' })),
  mk(MOD_GPS.id, 'svc', '-', C('double', 'fence_radius', '半径', '米', { min: 0, max: 10000, unit: '米', defaultVal: '0' })),
  mk(MOD_GPS.id, 'svc', '-', C('struct', 'fence_center', '圆心', '圆形围栏', { fields: [] })),
  mk(MOD_GPS.id, 'svc', '-', C('array', 'fence_points', '顶点', '多边形围栏', { elementType: 'struct', maxLength: 8, fields: [{ name: '纬度', identifier: 'latitude', dataType: 'double' }, { name: '经度', identifier: 'longitude', dataType: 'double' }] })),
  // GSensorInfoProperty · GSensor信息
  mk(MOD_SENSOR.id, 'prop', 'r', C('enum', 'gsensor_status', '工作状态', '传感器状态', { enumValues: [{ name: '关闭', val: 0 }, { name: '工作中', val: 1 }, { name: '校准中', val: 2 }, { name: '错误', val: 3 }], defaultVal: '1' })),
  mk(MOD_SENSOR.id, 'prop', 'r', C('double', 'g_x', 'X轴加速度', 'g', { min: -16, max: 16, unit: 'g', defaultVal: '0' })),
  mk(MOD_SENSOR.id, 'prop', 'r', C('double', 'g_y', 'Y轴加速度', 'g', { min: -16, max: 16, unit: 'g', defaultVal: '0' })),
  mk(MOD_SENSOR.id, 'prop', 'r', C('double', 'g_z', 'Z轴加速度', 'g', { min: -16, max: 16, unit: 'g', defaultVal: '0' })),
  mk(MOD_SENSOR.id, 'prop', 'r', C('double', 'pitch', '俯仰角', '度', { min: -180, max: 180, unit: '度', defaultVal: '0' })),
  mk(MOD_SENSOR.id, 'prop', 'r', C('double', 'roll', '翻滚角', '度', { min: -180, max: 180, unit: '度', defaultVal: '0' })),
  mk(MOD_SENSOR.id, 'prop', 'r', C('double', 'vibration_level', '震动强度', 'RMS值', { min: 0, max: 16, unit: 'g', defaultVal: '0' })),
  mk(MOD_SENSOR.id, 'prop', 'r', C('double', 'range', '量程', '±2/±4/±8/±16', { min: 0, max: 16, unit: 'g', defaultVal: '2' })),
  // GSensorProperty · GSensor设置
  mk(MOD_SENSOR.id, 'prop', 'rw', C('boolean', 'gsensor_enable', '开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_SENSOR.id, 'prop', 'rw', C('enum', 'gsensor_sensitivity', '灵敏度', '灵敏度等级', { enumValues: [{ name: '低', val: 1 }, { name: '中', val: 2 }, { name: '高', val: 3 }], defaultVal: '1' })),
  // GSensorService · GSensor服务
  mk(MOD_SENSOR.id, 'svc', '-', C('boolean', 'gsensor_enable', '开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_SENSOR.id, 'svc', '-', C('enum', 'gsensor_sensitivity', '灵敏度', '灵敏度等级', { enumValues: [{ name: '低', val: 1 }, { name: '中', val: 2 }, { name: '高', val: 3 }], defaultVal: '1' })),
  // AromaInfoProperty · 香薰信息
  mk(MOD_AROMA.id, 'prop', 'r', C('int', 'nozzle_count', '喷口数量', '左右喷口数', { min: 1, max: 4, unit: '个', defaultVal: '2' })),
  mk(MOD_AROMA.id, 'prop', 'r', C('int', 'gear_count', '档位数量', '支持档位数', { min: 1, max: 8, unit: '档', defaultVal: '4' })),
  mk(MOD_AROMA.id, 'prop', 'r', C('int', 'gear_spray_duration', '档位喷香时长', '设备按内置映射上报', { min: 1, max: 60, unit: '秒', defaultVal: '20' })),
  mk(MOD_AROMA.id, 'prop', 'r', C('int', 'gear_spray_interval', '档位喷香间隔', '设备按内置映射上报', { min: 1, max: 120, unit: '分钟', defaultVal: '50' })),
  mk(MOD_AROMA.id, 'prop', 'r', C('enum', 'liquid_status', '余液状态', '是否缺液', { enumValues: [{ name: '正常', val: 0 }, { name: '缺液', val: 1 }], defaultVal: '0' })),
  mk(MOD_AROMA.id, 'prop', 'r', C('int', 'liquid_percent', '余液百分比', '%', { min: 0, max: 100, unit: '%', defaultVal: '82' })),
  // AromaProperty · 香薰设置
  mk(MOD_AROMA.id, 'prop', 'rw', C('boolean', 'wake_switch', '唤醒开关', '0 休眠；1 唤醒', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_AROMA.id, 'prop', 'rw', C('enum', 'nozzle_select', '喷口选择', '喷雾喷口', { enumValues: [{ name: '混合', val: 0 }, { name: '左喷雾口', val: 1 }, { name: '右喷雾口', val: 2 }], defaultVal: '0' })),
  mk(MOD_AROMA.id, 'prop', 'rw', C('boolean', 'screen_switch', '屏显开关', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_AROMA.id, 'prop', 'rw', C('enum', 'spray_mode', '喷雾模式', '标准或自定义', { enumValues: [{ name: '标准', val: 0 }, { name: '自定义', val: 1 }], defaultVal: '1' })),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'gear_level', '喷雾档位', '仅标准模式生效', { min: 1, max: 4, unit: '档', defaultVal: '2' })),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'left_duration', '左喷香时长', '秒', { min: 3, max: 20, unit: '秒', defaultVal: '20' })),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'left_interval', '左喷香间隔', '分钟', { min: 3, max: 50, unit: '分钟', defaultVal: '50' })),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'right_duration', '右喷香时长', '秒', { min: 3, max: 20, unit: '秒', defaultVal: '20' })),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'right_interval', '右喷香间隔', '分钟', { min: 3, max: 50, unit: '分钟', defaultVal: '50' })),
  // AromaScheduleProperty · 香薰时段
  mk(MOD_AROMA.id, 'prop', 'rw', C('struct', 'left_schedule', '左喷口时段', 'start_time / end_time，当天秒数', { fields: [] })),
  mk(MOD_AROMA.id, 'prop', 'rw', C('struct', 'right_schedule', '右喷口时段', 'start_time / end_time，全天=不限', { fields: [] })),
  // AromaResetService · 恢复出厂设置
  // （无入参，直接下发执行）
  // AromaSprayService · 立即喷雾
  mk(MOD_AROMA.id, 'svc', '-', C('int', 'spray_seconds', '喷雾时长', '秒', { min: 3, max: 60, unit: '秒', defaultVal: '5' })),
  // MeterInfoProperty · 电表信息
  mk(MOD_METER.id, 'prop', 'r', C('enum', 'meter_status', '表状态', '运行状态', { enumValues: [{ name: '运行', val: 0 }, { name: '停机', val: 1 }, { name: '故障', val: 2 }], defaultVal: '0' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'voltage', '电压', 'V', { min: 0, max: 500, unit: 'V', defaultVal: '220' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'current', '电流', 'A', { min: 0, max: 100, unit: 'A', defaultVal: '3.2' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'active_power', '有功功率', 'W', { min: 0, max: 50000, unit: 'W', defaultVal: '704' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'reactive_power', '无功功率', 'var', { min: 0, max: 50000, unit: 'var', defaultVal: '120' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'power_factor', '功率因数', '0.00~1.00', { min: 0, max: 1, unit: '', defaultVal: '0.96' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'frequency', '频率', 'Hz', { min: 45, max: 65, unit: 'Hz', defaultVal: '50' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'energy_total', '累计电量', 'kWh', { min: 0, max: 99999999, unit: 'kWh', defaultVal: '12580.66' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'energy_forward', '正向电量', 'kWh', { min: 0, max: 99999999, unit: 'kWh', defaultVal: '12580.66' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'energy_reverse', '反向电量', 'kWh', { min: 0, max: 99999999, unit: 'kWh', defaultVal: '0' })),
  mk(MOD_METER.id, 'prop', 'r', C('array', 'energy_tariff_list', '分时电量', '尖峰平谷', { elementType: 'struct', maxLength: 8, fields: [{ name: '费率ID', identifier: 'tariff_id', dataType: 'int' }, { name: '电量', identifier: 'energy', dataType: 'double' }] })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'demand_current', '当前需量', 'kW', { min: 0, max: 1000, unit: 'kW', defaultVal: '1.85' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'demand_max', '最大需量', 'kW', { min: 0, max: 1000, unit: 'kW', defaultVal: '2.6' })),
  mk(MOD_METER.id, 'prop', 'r', C('double', 'balance', '预付费余额', '元', { min: 0, max: 999999, unit: '元', defaultVal: '128.5' })),
  mk(MOD_METER.id, 'prop', 'r', C('boolean', 'relay_status', '继电器状态', '0 断开；1 闭合', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  // MeterProperty · 电表设置
  mk(MOD_METER.id, 'prop', 'rw', C('int', 'report_interval', '上报周期', '秒', { min: 1, max: 3600, unit: '秒', defaultVal: '60' })),
  mk(MOD_METER.id, 'prop', 'rw', C('int', 'settlement_day', '结算日', '每月结算日', { min: 1, max: 28, unit: '日', defaultVal: '1' })),
  mk(MOD_METER.id, 'prop', 'rw', C('int', 'demand_period', '需量周期', '分钟', { min: 1, max: 60, unit: '分钟', defaultVal: '15' })),
  mk(MOD_METER.id, 'prop', 'rw', C('double', 'balance_alert_threshold', '余额告警阈值', '元', { min: 0, max: 99999, unit: '元', defaultVal: '20' })),
  mk(MOD_METER.id, 'prop', 'rw', C('boolean', 'auto_trip_enable', '欠费自动跳闸', '开关', { trueLabel: '开', falseLabel: '关', defaultVal: '1' })),
  mk(MOD_METER.id, 'prop', 'rw', C('array', 'tariff_list', '费率时段', '分时电价', { elementType: 'struct', maxLength: 8, fields: [{ name: '费率ID', identifier: 'tariff_id', dataType: 'int' }, { name: '电价', identifier: 'tariff_price', dataType: 'double' }, { name: '开始', identifier: 'start_time', dataType: 'int' }, { name: '结束', identifier: 'end_time', dataType: 'int' }] })),
  // MeterSwitchService · 拉合闸控制
  mk(MOD_METER.id, 'svc', '-', C('boolean', 'relay_enable', '合闸', '1 合闸；0 拉闸', { trueLabel: '合闸', falseLabel: '拉闸', defaultVal: '1' })),
  // MeterClearService · 电量清零
  // （无入参，直接下发执行）
  // MeterRechargeService · 充值
  mk(MOD_METER.id, 'svc', '-', C('double', 'recharge_amount', '充值金额', '元', { min: 0, max: 99999, unit: '元', defaultVal: '100' })),
  mk(MOD_METER.id, 'svc', '-', C('string', 'recharge_order', '充值流水号', '防重复', { maxLength: 64 })),
  // DeviceEventItem · 设备状态事件
  mk(MOD_DEV.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '设备离线', val: 109300 }, { name: '设备在线', val: 109301 }, { name: '设备休眠', val: 109302 }], defaultVal: '109300' })),
  mk(MOD_DEV.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_DEV.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_DEV.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // TargetDetectEventItem · 目标检测事件
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '运动侦测', val: 100000 }, { name: '人形侦测', val: 100001 }, { name: '人脸侦测', val: 100015 }, { name: '入侵检测', val: 100017 }, { name: '车牌侦测', val: 100020 }, { name: '逗留侦测', val: 100021 }, { name: '声音侦测', val: 100400 }, { name: '低电量侦测', val: 101201 }, { name: '跌倒侦测', val: 102400 }, { name: '火焰侦测', val: 102500 }, { name: '哭声侦测', val: 102800 }, { name: '宠物侦测', val: 102900 }, { name: '区域闯入事件', val: 107900 }, { name: '区域离开事件', val: 108000 }, { name: '烟火侦测', val: 108200 }, { name: '车辆侦测', val: 108300 }, { name: '包裹检测', val: 110900 }, { name: '鸟类侦测', val: 200002 }, { name: '松鼠侦测', val: 200003 }, { name: '包裹侦测', val: 200006 }], defaultVal: '100001' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // VehicleEventItem · 车辆车位事件
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '非机动车', val: 108600 }, { name: '电动车', val: 108601 }, { name: '自行车', val: 108602 }, { name: '车位占用', val: 108901 }], defaultVal: '108600' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // PetBehaviorEventItem · 宠物行为事件
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '宠物逗留', val: 102901 }, { name: '宠物拆家', val: 102902 }, { name: '宠物喝水', val: 102903 }, { name: '宠物进食', val: 102904 }, { name: '宠物睡觉', val: 102905 }, { name: '宠物屋内排便', val: 102906 }], defaultVal: '102901' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // ChildCareEventItem · 儿童看护事件
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '儿童检测', val: 109600 }, { name: '儿童哭闹', val: 109601 }, { name: '儿童外出', val: 109602 }, { name: '儿童回家', val: 109603 }, { name: '儿童摔倒', val: 109604 }, { name: '做作业', val: 109605 }, { name: '玩手机', val: 109606 }], defaultVal: '109600' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // ElderCareEventItem · 老人看护事件
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '老人检测', val: 109700 }, { name: '老人外出', val: 109701 }, { name: '老人回家', val: 109702 }, { name: '老人摔倒', val: 109703 }], defaultVal: '109700' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // KitchenSafetyEventItem · 厨房安全事件
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '火焰侦测', val: 102500 }, { name: '烟雾检测', val: 102600 }], defaultVal: '102500' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // StaffEventItem · 岗位管理事件
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '人员离岗', val: 107000 }, { name: '双人在岗', val: 107001 }], defaultVal: '107000' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // AccessEventItem · 出入事件
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '进入', val: 109000 }, { name: '出去', val: 109001 }], defaultVal: '109000' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // CallEventItem · 呼叫事件
  mk(MOD_CALL.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '语音呼叫', val: 103700 }, { name: '语音加视频呼叫', val: 103701 }, { name: '挂断呼叫', val: 103702 }], defaultVal: '103700' })),
  mk(MOD_CALL.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_CALL.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_CALL.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // FishEventItem · 鱼类事件
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '鱼类检测', val: 111100 }, { name: '鱼类精彩瞬间', val: 111101 }], defaultVal: '111100' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_ALGO.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // AromaEventItem · 香薰事件
  mk(MOD_AROMA.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '缺液报警', val: 120001 }, { name: '喷头堵塞', val: 120002 }], defaultVal: '120001' })),
  mk(MOD_AROMA.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_AROMA.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_AROMA.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
  // MeterEventItem · 电表事件
  mk(MOD_METER.id, 'evt', '-', C('enum', 'event_id', '事件ID', '枚举，取值为该域事件', { enumValues: [{ name: '欠压', val: 130001 }, { name: '过压', val: 130002 }, { name: '过流', val: 130003 }, { name: '漏电', val: 130004 }, { name: '停电', val: 130005 }, { name: '上电', val: 130006 }, { name: '开盖', val: 130007 }, { name: '余额不足', val: 130008 }, { name: '继电器跳闸', val: 130009 }], defaultVal: '130001' })),
  mk(MOD_METER.id, 'evt', '-', C('string', 'event_name', '事件名称', '运行时回填', { maxLength: 32 })),
  mk(MOD_METER.id, 'evt', '-', C('int', 'event_time', '发生时间', 'UTC毫秒戳', { min: 0, max: 9999999999999, unit: 'ms', defaultVal: '0' })),
  mk(MOD_METER.id, 'evt', '-', C('string', 'description', '描述', '事件描述', { maxLength: 256 })),
]

const initialCapItems = [
  { id: nextId(), moduleId: MOD_DEV.id, name: '设备信息', identifier: 'DeviceInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['company_id', 'product_id', 'ctei', 'did', 'gid'] },
  { id: nextId(), moduleId: MOD_DEV.id, name: '设备设置', identifier: 'DeviceProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['device_name'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '图像信息', identifier: 'CaptureInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['capture_stream_id', 'conbine_stream_type', 'conbine_lens_ids', 'focal_type', 'focal_length_min', 'focal_length_max', 'encode_stream_count', 'lens_count', 'show_stream_count', 'snap_ability', 'wdr_ability', 'hdr_ability', 'anti_flicker_ability', 'privacy_mask_ability', 'region_sign_ability', 'custom_osd_ability', 'osd_show_ability', 'lens_corrent_type', 'lens_correct_algorithm', 'pt_control_type', 'pt_ability', 'ptz_3d_position_ability', 'ptz_preset_ability', 'ptz_cruise_ability', 'ptz_speed_ability'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '图像设置', identifier: 'CaptureProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['capture_stream_id', 'flip_type', 'focal_length', 'encode_stream_id', 'width', 'height', 'video_encode_type', 'frame_rate', 'video_encode_mode', 'wdr_mode', 'hdr_mode', 'anti_flicker_mode', 'scan_frequency', 'osd_enable', 'osd_list', 'privacy_mask_list', 'ptz_speed', 'pt_position_list', 'guard_pt_position_id', 'guard_return_interval', 'cruise_list'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '云台转动控制', identifier: 'PTZControlService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['lens_id', 'ptz_control_type', 'pt_position_id', 'ptz_control', 'ptz_step'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '云台位置重置', identifier: 'PTZResetService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['lens_id'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '抓图', identifier: 'SnapPictureService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['snap_type', 'snap_picture_type', 'picture_size_type', 'capture_stream_id', 'snap_picture_interval', 'snap_picture_count'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '采集码流开关', identifier: 'CaptureStreamSwitchService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['capture_stream_id', 'capture_stream_enable'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '执行巡航', identifier: 'CruiseService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['cruise_id', 'cruise_interval'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '麦克风信息', identifier: 'MicrophoneInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['volumn_ability', 'audio_encode_ability', 'channel', 'sample_rate', 'nr_ability', 'aec_ability'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '麦克风设置', identifier: 'MicrophoneProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['microphone_enable', 'volumn', 'audio_encode_type', 'nr_level', 'aec_enable'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '麦克风音量调节', identifier: 'MicrophoneVolumnService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['volumn'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '麦克风拾音开关', identifier: 'MicrophoneCloseService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['microphone_enable'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '扬声器信息', identifier: 'SpeakerInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['volumn_ability', 'audio_encode_ability'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '扬声器设置', identifier: 'SpeakerProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['speaker_enable', 'volumn'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '自定义语音', identifier: 'SoundFileProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['support_sound_file_format', 'audio_upload_ability', 'tts_ability', 'max_audio_size', 'max_sound_size', 'sound_file_list'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '扬声器音量调节', identifier: 'SpeakerVolumnService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['volumn'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '扬声器播放开关', identifier: 'SpeakerEnableService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['speaker_enable'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '语音播报', identifier: 'SoundFilePlayService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['sound_play_mode', 'sound_play_priority', 'sound_play_interval', 'sound_play_count', 'sound_file_list'] },
  { id: nextId(), moduleId: MOD_DISPLAY.id, name: '屏幕信息', identifier: 'DisplayInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['display_text_ability', 'display_richtext_ability', 'display_picture_ability', 'display_video_ability', 'url_download_ability', 'display_screen_split_ability', 'screen_width', 'screen_height', 'support_picture_format', 'support_video_encode_format', 'support_text_encode_format'] },
  { id: nextId(), moduleId: MOD_DISPLAY.id, name: '屏幕设置', identifier: 'DisplayProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['screen_saver_timeout', 'auto_play_mode'] },
  { id: nextId(), moduleId: MOD_DISPLAY.id, name: '屏显内容下发', identifier: 'DisPlayContentService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['display_content_type', 'display_mode', 'text_content', 'text_encode_format', 'text_color', 'text_size', 'text_position', 'picture_count', 'picture_list', 'video_url', 'video_format', 'richtext_content', 'richtext_encode_format', 'richtext_color', 'richtext_size', 'richtext_position', 'url_content'] },
  { id: nextId(), moduleId: MOD_DISPLAY.id, name: '屏显背景图设置', identifier: 'DisPlayBackgroundService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['background_picture_url', 'background_picture_format'] },
  { id: nextId(), moduleId: MOD_IOT.id, name: '子设备信息', identifier: 'IoTGatewayInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['max_sub_device_count', 'sub_device_list'] },
  { id: nextId(), moduleId: MOD_IOT.id, name: '子设备管理', identifier: 'IoTGatewayManageService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['sub_device_edit_type', 'sub_device_id', 'sub_device_name', 'sub_device_type'] },
  { id: nextId(), moduleId: MOD_IOT.id, name: '编辑子设备属性', identifier: 'IoTGatewayEditSubDeviceService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['sub_device_id', 'sub_device_property'] },
  { id: nextId(), moduleId: MOD_IOT.id, name: '执行子设备操作', identifier: 'IoTGatewayExecuteSubDeviceService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['sub_device_id', 'sub_device_services'] },
  { id: nextId(), moduleId: MOD_TIME.id, name: '时间信息', identifier: 'TimeInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['timestamp', 'utc_offset', 'current_dst_status'] },
  { id: nextId(), moduleId: MOD_TIME.id, name: '时间设置', identifier: 'TimeProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['time_zone', 'dst_enable', 'dst_offset', 'dst_start', 'dst_end'] },
  { id: nextId(), moduleId: MOD_TIME.id, name: '时间同步', identifier: 'TimeService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['timestamp'] },
  { id: nextId(), moduleId: MOD_STORAGE.id, name: '存储信息', identifier: 'StorageInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['storage_mount_status', 'storage_type', 'storage_total', 'storage_used', 'storage_free', 'storage_file_system', 'storage_support_max_capacity'] },
  { id: nextId(), moduleId: MOD_STORAGE.id, name: '存储设置', identifier: 'StorageProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['storage_erase_flag', 'storage_protect_flag'] },
  { id: nextId(), moduleId: MOD_STORAGE.id, name: '存储服务', identifier: 'StorageService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['storage_file_system', 'quick_format_flag'] },
  { id: nextId(), moduleId: MOD_OTA.id, name: 'OTA信息', identifier: 'OTAInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['ota_ability', 'ota_support_mode', 'firmware_version', 'sdk_version', 'api_version', 'module_versions'] },
  { id: nextId(), moduleId: MOD_OTA.id, name: '固件升级', identifier: 'OTAService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['ota_upgrade_type', 'firmware_new_version', 'module_new_version', 'file_url', 'file_size', 'file_md5', 'public_key', 'signature'] },
  { id: nextId(), moduleId: MOD_POWER.id, name: '电源信息', identifier: 'PowerInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['power_source', 'input_voltage', 'input_current', 'output_voltage', 'output_current', 'power_on_time', 'battery_present', 'battery_type', 'battery_capacity', 'battery_full_capacity', 'battery_remain_capacity', 'charge_status', 'charge_voltage', 'charge_current', 'charge_power', 'solar_present', 'solar_voltage', 'solar_current', 'solar_power', 'solar_radiance'] },
  { id: nextId(), moduleId: MOD_POWER.id, name: '电源设置', identifier: 'PowerProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['battery_lower_threshold', 'battery_critical_threshold', 'battery_shutdown_threshold'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '网络信息', identifier: 'NetworkInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['network_ability', 'network_type', 'eth_status', 'eth_mac', 'eth_ip', 'eth_netmask', 'eth_gateway', 'eth_dns', 'eth_dns2', 'wifi_status', 'wifi_mac', 'wifi_ip', 'wifi_netmask', 'wifi_gateway', 'wifi_dns', 'wifi_dns2', 'wifi_single_strength', 'wifi_band', 'bluetooth_status', 'bluetooth_name', 'bluetooth_mac', 'bluetooth_version', 'bluetooth_mode', 'cellular_status', 'cellular_type', 'cellular_single_strength', 'cellular_module', 'cellular_imei', 'cellular_band', 'cellular_slot_count', 'cellular_active_slot_id', 'cellular_slot_infos'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '网络设置', identifier: 'NetworkProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['eth_dhcp_enable', 'wifi_mode', 'wifi_security_type', 'wifi_ssid', 'wifi_password', 'wifi_ap_ssid', 'wifi_ap_password', 'wifi_channel', 'wifi_dhcp_enable', 'cellular_slot_priority'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: 'WiFi配网', identifier: 'WiFiSettingService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['wifi_mode', 'wifi_security_type', 'wifi_ssid', 'wifi_password', 'wifi_ap_ssid', 'wifi_ap_password', 'wifi_channel'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '蜂窝卡槽切换', identifier: 'CellularSlotSwitchService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['slot_id'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '卡槽APN配置', identifier: 'CellularSlotAPNService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['slot_id', 'apn_info'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: 'eSIM配置', identifier: 'CellularSlotESIMService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['slot_id', 'esim_profile_info'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '工作网络切换', identifier: 'NetworkSwitchService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['network_type'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '录像信息', identifier: 'RecordInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['cloud_record_mode_ability', 'local_record_status', 'cloud_record_status', 'record_file_count'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '录像设置', identifier: 'RecordProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['record_enable', 'local_record_enable', 'cloud_record_enable'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '录像', identifier: 'RecordService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['record_mode', 'record_streamid', 'record_data_format', 'record_data_interval', 'pre_record_time', 'record_duration', 'record_interval'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '查询本地文件', identifier: 'RecordQueryService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['file_type', 'start_time', 'end_time'] },
  { id: nextId(), moduleId: MOD_WORKMODE.id, name: '工作模式信息', identifier: 'WorkModeInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['work_mode_count', 'work_mode_list'] },
  { id: nextId(), moduleId: MOD_WORKMODE.id, name: '工作模式设置', identifier: 'WorkModeProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['current_work_mode_id', 'work_mode_param'] },
  { id: nextId(), moduleId: MOD_WORKMODE.id, name: '工作模式服务', identifier: 'WorkModeService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['work_mode_id'] },
  { id: nextId(), moduleId: MOD_LIGHT.id, name: '灯光信息', identifier: 'LightInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['light_count', 'light_list'] },
  { id: nextId(), moduleId: MOD_LIGHT.id, name: '灯光设置', identifier: 'LightProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['light_list', 'light_mode_list'] },
  { id: nextId(), moduleId: MOD_LIGHT.id, name: '切换单灯', identifier: 'LightSwitchService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['light_id', 'light_enable', 'light_mode', 'light_duration', 'brightness', 'colortemp', 'color_mode', 'color_rgb', 'color_hsv', 'flash_count', 'flash_interval'] },
  { id: nextId(), moduleId: MOD_LIGHT.id, name: '切换灯光模式', identifier: 'LightModeSwitchService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['light_mode_id'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '算法信息', identifier: 'AlgorithmInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['algorithm_count', 'algorithm_running_count', 'algorithm_enabled_count', 'algorithm_list'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '算法设置', identifier: 'AlgorithmProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['algorithm_list'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '启用禁用算法', identifier: 'AlgorithmEnableService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['algorithm_id', 'algorithm_enable'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '启动停止算法', identifier: 'AlgorithmRunningService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['algorithm_id', 'algorithm_running'] },
  { id: nextId(), moduleId: MOD_GPS.id, name: 'GPS信息', identifier: 'GPSInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['gps_status', 'gps_latitude', 'gps_longitude', 'gps_altitude', 'gps_speed', 'gps_direction', 'gps_time', 'gps_distance'] },
  { id: nextId(), moduleId: MOD_GPS.id, name: 'GPS设置', identifier: 'GPSProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['gps_enable', 'report_mode', 'report_interval', 'report_distance', 'fence_list'] },
  { id: nextId(), moduleId: MOD_GPS.id, name: 'GPS上报策略调整', identifier: 'GPSReportService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['gps_enable', 'report_mode', 'report_interval', 'report_distance'] },
  { id: nextId(), moduleId: MOD_GPS.id, name: 'GPS电子围栏设置', identifier: 'GPSFenceService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['fence_control', 'fence_id', 'fence_name', 'fence_type', 'fence_radius', 'fence_center', 'fence_points'] },
  { id: nextId(), moduleId: MOD_SENSOR.id, name: 'GSensor信息', identifier: 'GSensorInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['gsensor_status', 'g_x', 'g_y', 'g_z', 'pitch', 'roll', 'vibration_level', 'range'] },
  { id: nextId(), moduleId: MOD_SENSOR.id, name: 'GSensor设置', identifier: 'GSensorProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['gsensor_enable', 'gsensor_sensitivity'] },
  { id: nextId(), moduleId: MOD_SENSOR.id, name: 'GSensor服务', identifier: 'GSensorService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['gsensor_enable', 'gsensor_sensitivity'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '香薰信息', identifier: 'AromaInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['nozzle_count', 'gear_count', 'gear_spray_duration', 'gear_spray_interval', 'liquid_status', 'liquid_percent'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '香薰设置', identifier: 'AromaProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['wake_switch', 'nozzle_select', 'screen_switch', 'spray_mode', 'gear_level', 'left_duration', 'left_interval', 'right_duration', 'right_interval'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '香薰时段', identifier: 'AromaScheduleProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['left_schedule', 'right_schedule'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '恢复出厂设置', identifier: 'AromaResetService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: [] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '立即喷雾', identifier: 'AromaSprayService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['spray_seconds'] },
  { id: nextId(), moduleId: MOD_METER.id, name: '电表信息', identifier: 'MeterInfoProperty', capType: 'prop', accessMode: 'ro', updateTime: '2026-11-04 10:00:00',
    params: ['meter_status', 'voltage', 'current', 'active_power', 'reactive_power', 'power_factor', 'frequency', 'energy_total', 'energy_forward', 'energy_reverse', 'energy_tariff_list', 'demand_current', 'demand_max', 'balance', 'relay_status'] },
  { id: nextId(), moduleId: MOD_METER.id, name: '电表设置', identifier: 'MeterProperty', capType: 'prop', accessMode: 'rw', updateTime: '2026-11-04 10:00:00',
    params: ['report_interval', 'settlement_day', 'demand_period', 'balance_alert_threshold', 'auto_trip_enable', 'tariff_list'] },
  { id: nextId(), moduleId: MOD_METER.id, name: '拉合闸控制', identifier: 'MeterSwitchService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['relay_enable'] },
  { id: nextId(), moduleId: MOD_METER.id, name: '电量清零', identifier: 'MeterClearService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: [] },
  { id: nextId(), moduleId: MOD_METER.id, name: '充值', identifier: 'MeterRechargeService', capType: 'svc', updateTime: '2026-11-04 10:00:00',
    params: ['recharge_amount', 'recharge_order'] },
  { id: nextId(), moduleId: MOD_DEV.id, name: '设备状态事件', identifier: 'DeviceEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '目标检测事件', identifier: 'TargetDetectEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '车辆车位事件', identifier: 'VehicleEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '宠物行为事件', identifier: 'PetBehaviorEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '儿童看护事件', identifier: 'ChildCareEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '老人看护事件', identifier: 'ElderCareEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '厨房安全事件', identifier: 'KitchenSafetyEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '岗位管理事件', identifier: 'StaffEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '出入事件', identifier: 'AccessEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_CALL.id, name: '呼叫事件', identifier: 'CallEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '鱼类事件', identifier: 'FishEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '香薰事件', identifier: 'AromaEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
  { id: nextId(), moduleId: MOD_METER.id, name: '电表事件', identifier: 'MeterEventItem', capType: 'evt', updateTime: '2026-11-04 10:00:00',
    params: ['event_id', 'event_name', 'event_time', 'description'] },
]


// 回填参数归属（按生成顺序一一对应）
let _capCursor = 0
initialCapItems.forEach(item => {
  item.params.forEach(() => {
    if (initialCapabilities[_capCursor]) initialCapabilities[_capCursor].capItemId = item.id
    _capCursor++
  })
})

// ===== 类目-能力关联（按模块整组关联）=====
const initialCategoryCaps = []
const linkModules = (categoryId, moduleIds) => {
  initialCapabilities
    .filter(c => moduleIds.includes(c.moduleId))
    .forEach(c => initialCategoryCaps.push({ categoryId, capabilityId: c.id }))
}

const CAMERA_MODULES = [
  MOD_DEV.id, MOD_IMAGE.id, MOD_AUDIO.id, MOD_DISPLAY.id, MOD_IOT.id, MOD_TIME.id,
  MOD_STORAGE.id, MOD_OTA.id, MOD_POWER.id, MOD_NETWORK.id, MOD_RECORD.id,
  MOD_WORKMODE.id, MOD_LIGHT.id, MOD_ALGO.id, MOD_GPS.id, MOD_SENSOR.id, MOD_CALL.id
]
linkModules(_catIpc, CAMERA_MODULES)
linkModules(_catLowCam, CAMERA_MODULES)
linkModules(_catPtz, CAMERA_MODULES)
linkModules(_catBell, CAMERA_MODULES)
linkModules(_catSensor, CAMERA_MODULES)
linkModules(_catAroma, [MOD_AROMA.id])
linkModules(_catMeter, [MOD_METER.id])

// ===== 老能力模块（能力池（老）用） =====
const initialLegacyModules = [
  { id: nextId(), name: '联网方式', identifier: 'NetworkModule' },
  { id: nextId(), name: '对讲设置', identifier: 'IntercomModule' },
  { id: nextId(), name: '存储设置', identifier: 'StorageModule' },
  { id: nextId(), name: '电池设置', identifier: 'BatteryModule' },
  { id: nextId(), name: '工作模式', identifier: 'WorkModeModule' },
  { id: nextId(), name: '唤醒能力', identifier: 'WakeupModule' },
  { id: nextId(), name: 'OTA能力', identifier: 'OtaModule' },
  { id: nextId(), name: '指示灯', identifier: 'IndicatorModule' },
  { id: nextId(), name: '报警录制', identifier: 'AlarmRecordModule' },
  { id: nextId(), name: '红外灯', identifier: 'IrLightModule' },
  { id: nextId(), name: '声音侦测', identifier: 'SoundDetectModule' },
  { id: nextId(), name: '算法能力', identifier: 'AlgorithmModule' },
  { id: nextId(), name: '屏显配置', identifier: 'DisplayModule' },
  { id: nextId(), name: '喇叭配置', identifier: 'SpeakerModule' }
]

// ===== 老能力（能力池（老）用，JSON格式） =====
const initialLegacyCapabilities = [
  // 联网方式
  { id: nextId(), moduleId: initialLegacyModules[0].id, identifier: 'NetType', name: '联网方式', descr: '设备支持的联网方式配置',
    jsonContent: '{"type":"prop","dataType":"bitmap","accessMode":"rw","labels":["有线","WIFI","移动网络"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[0].id, identifier: 'WifiBand', name: 'WIFI频段', descr: 'WIFI频段支持',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"ro","labels":["2.4G","5G","双频"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[0].id, identifier: 'SignalStrength', name: '信号强度', descr: '当前网络信号强度',
    jsonContent: '{"type":"prop","dataType":"int","accessMode":"ro","min":0,"max":100,"unit":"%" }', createTime: '2025-01-15 10:00:00' },

  // 对讲设置
  { id: nextId(), moduleId: initialLegacyModules[1].id, identifier: 'VoiceCallType', name: '语音通话类型', descr: '设备支持的语音通话类型',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"ro","labels":["不支持","半双工","全双工"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[1].id, identifier: 'VoiceCallSwitch', name: '语音对讲开关', descr: '语音对讲状态',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["空闲","呼叫中","通话中"]}', createTime: '2025-01-15 10:00:00' },

  // 存储设置
  { id: nextId(), moduleId: initialLegacyModules[2].id, identifier: 'StorageType', name: '存储类型', descr: '设备存储类型',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"ro","labels":["TF卡","磁盘"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[2].id, identifier: 'TotalCapacity', name: '总容量', descr: '存储总容量',
    jsonContent: '{"type":"prop","dataType":"int","accessMode":"ro","min":0,"max":1048576,"unit":"MB"}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[2].id, identifier: 'RemainingCapacity', name: '剩余容量', descr: '存储剩余容量',
    jsonContent: '{"type":"prop","dataType":"int","accessMode":"ro","min":0,"max":1048576,"unit":"MB"}', createTime: '2025-01-15 10:00:00' },

  // 电池设置
  { id: nextId(), moduleId: initialLegacyModules[3].id, identifier: 'BatteryLevel', name: '电池电量', descr: '当前电池电量百分比',
    jsonContent: '{"type":"prop","dataType":"int","accessMode":"ro","min":0,"max":100,"unit":"%"}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[3].id, identifier: 'ChargeStatus', name: '充电状态', descr: '设备充电状态',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"ro","labels":["未充电","充电中"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[3].id, identifier: 'WakeMode', name: '唤醒方式', descr: '设备支持的唤醒方式',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"ro","labels":["不支持","本地唤醒","远程唤醒","本地+远程"]}', createTime: '2025-01-15 10:00:00' },

  // 工作模式
  { id: nextId(), moduleId: initialLegacyModules[4].id, identifier: 'WorkMode', name: '工作模式', descr: '设备当前工作模式',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["超低功耗","低功耗","AOV","长电","自定义"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[4].id, identifier: 'AovCaptureFrameRate', name: 'AOV拍照帧率', descr: 'AOV模式下拍照帧率间隔',
    jsonContent: '{"type":"prop","dataType":"int","accessMode":"rw","min":0,"max":10,"unit":"秒/帧"}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[4].id, identifier: 'CustomModeConfig', name: '自定义模式配置', descr: '自定义工作模式时段配置',
    jsonContent: '{"type":"prop","dataType":"struct","accessMode":"rw","fields":[{"name":"默认模式","identifier":"DefaultExecMode","dataType":"int"},{"name":"定时计划","identifier":"Plan","dataType":"array"}]}', createTime: '2025-01-15 10:00:00' },

  // 唤醒能力
  { id: nextId(), moduleId: initialLegacyModules[5].id, identifier: 'WakeOnMotion', name: '运动唤醒', descr: '检测到运动时唤醒设备',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"关闭","val":0},{"name":"开启","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[5].id, identifier: 'WakeOnPir', name: 'PIR唤醒', descr: 'PIR传感器触发唤醒',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"关闭","val":0},{"name":"开启","val":1}]}', createTime: '2025-01-15 10:00:00' },

  // OTA能力
  { id: nextId(), moduleId: initialLegacyModules[6].id, identifier: 'OtaSwitch', name: 'OTA升级开关', descr: '是否允许OTA远程升级',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"禁止","val":0},{"name":"允许","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[6].id, identifier: 'OtaProgress', name: '升级进度', descr: '当前OTA升级进度',
    jsonContent: '{"type":"prop","dataType":"int","accessMode":"ro","min":0,"max":100,"unit":"%"}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[6].id, identifier: 'OtaVersion', name: '固件版本', descr: '当前固件版本号',
    jsonContent: '{"type":"prop","dataType":"string","accessMode":"ro","maxLength":32}', createTime: '2025-01-15 10:00:00' },

  // 指示灯
  { id: nextId(), moduleId: initialLegacyModules[7].id, identifier: 'StatusLightSwitch', name: '状态指示灯', descr: '状态指示灯开关',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"关闭","val":0},{"name":"开启","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[7].id, identifier: 'IndicatorBrightness', name: '指示灯亮度', descr: '指示灯亮度级别',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["低","中","高"]}', createTime: '2025-01-15 10:00:00' },

  // 报警录制
  { id: nextId(), moduleId: initialLegacyModules[8].id, identifier: 'AlarmRecordSwitch', name: '报警录制开关', descr: '报警触发时是否自动录制',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"关闭","val":0},{"name":"开启","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[8].id, identifier: 'AlarmRecordDuration', name: '录制时长', descr: '报警录制持续时间',
    jsonContent: '{"type":"prop","dataType":"int","accessMode":"rw","min":5,"max":60,"unit":"秒"}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[8].id, identifier: 'AlarmRecordResolution', name: '录制清晰度', descr: '报警录制视频清晰度',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["超清","高清","标清"]}', createTime: '2025-01-15 10:00:00' },

  // 红外灯
  { id: nextId(), moduleId: initialLegacyModules[9].id, identifier: 'IrLightSwitch', name: '红外灯开关', descr: '红外补光灯开关',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"关闭","val":0},{"name":"开启","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[9].id, identifier: 'IrLightMode', name: '红外灯模式', descr: '红外灯工作模式',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["自动","手动","关闭"]}', createTime: '2025-01-15 10:00:00' },

  // 声音侦测
  { id: nextId(), moduleId: initialLegacyModules[10].id, identifier: 'SoundDetectSwitch', name: '声音侦测开关', descr: '声音侦测功能开关',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"关闭","val":0},{"name":"开启","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[10].id, identifier: 'SoundDetectSensitive', name: '侦测灵敏度', descr: '声音侦测灵敏度',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["1档","2档","3档","4档"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[10].id, identifier: 'SoundEvent', name: '声音事件上报', descr: '检测到异常声音时上报告警',
    jsonContent: '{"type":"evt","eventType":"alarm"}', createTime: '2025-01-15 10:00:00' },

  // 算法能力
  { id: nextId(), moduleId: initialLegacyModules[11].id, identifier: 'AlgorithmSwitch', name: '算法开关', descr: '算法功能总开关',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"关闭","val":0},{"name":"开启","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[11].id, identifier: 'AlgorithmSensitivity', name: '算法灵敏度', descr: '算法整体灵敏度',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["低","中","高"]}', createTime: '2025-01-15 10:00:00' },

  // 屏显配置
  { id: nextId(), moduleId: initialLegacyModules[12].id, identifier: 'HasDisplay', name: '是否有屏显', descr: '设备是否具备屏显模块',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"否","val":0},{"name":"是","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[12].id, identifier: 'SupportedResolutions', name: '支持的分辨率', descr: '屏显支持的输出分辨率',
    jsonContent: '{"type":"prop","dataType":"bitmap","accessMode":"rw","labels":["1920*1080","1280*720","640*480","640*360","320*240"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[12].id, identifier: 'ScreenOffTime', name: '屏息时间', descr: '无操作后自动息屏的时间',
    jsonContent: '{"type":"prop","dataType":"int","accessMode":"rw","min":0,"max":3600,"unit":"秒"}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[12].id, identifier: 'DecodeFormats', name: '支持的解码方式', descr: '屏显支持的解码格式',
    jsonContent: '{"type":"prop","dataType":"bitmap","accessMode":"rw","labels":["H264","H265","MJPG"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[12].id, identifier: 'DisplayTypes', name: '支持的屏显类型', descr: '屏显支持的内容类型',
    jsonContent: '{"type":"prop","dataType":"bitmap","accessMode":"rw","labels":["文字","背景图","图片","视频"]}', createTime: '2025-01-15 10:00:00' },

  // 喇叭配置
  { id: nextId(), moduleId: initialLegacyModules[13].id, identifier: 'HasSpeaker', name: '是否有喇叭', descr: '设备是否具备喇叭模块',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"否","val":0},{"name":"是","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[13].id, identifier: 'EncodeFormats', name: '支持的编码方式', descr: '喇叭支持的音频编码格式',
    jsonContent: '{"type":"prop","dataType":"bitmap","accessMode":"rw","labels":["PCM","G711A","g711u","ACC"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[13].id, identifier: 'VolumeAdjustable', name: '音量调节', descr: '是否支持音量调节',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"不支持","val":0},{"name":"支持","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[13].id, identifier: 'Volume', name: '音量', descr: '喇叭音量大小',
    jsonContent: '{"type":"prop","dataType":"int","accessMode":"rw","min":0,"max":100,"unit":"%"}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[13].id, identifier: 'CustomRingtone', name: '自定义铃声', descr: '是否支持自定义铃声',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","enumValues":[{"name":"不支持","val":0},{"name":"支持","val":1}]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[13].id, identifier: 'BitDepth', name: '采样位深', descr: '音频采样位深度',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["16bit","24bit"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[13].id, identifier: 'SampleRate', name: '采样率', descr: '音频采样率',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["8000","16000","44100","48000"]}', createTime: '2025-01-15 10:00:00' },
  { id: nextId(), moduleId: initialLegacyModules[13].id, identifier: 'Channels', name: '声道数', descr: '音频声道数',
    jsonContent: '{"type":"prop","dataType":"enum","accessMode":"rw","labels":["单声道","双声道"]}', createTime: '2025-01-15 10:00:00' }
]

// ===== Reactive 存储 =====
export const store = reactive({
  categories: JSON.parse(JSON.stringify(initialCategories)),
  modules: JSON.parse(JSON.stringify(initialModules)),
  capItems: JSON.parse(JSON.stringify(initialCapItems)),
  capabilities: JSON.parse(JSON.stringify(initialCapabilities)),
  categoryCaps: JSON.parse(JSON.stringify(initialCategoryCaps)),
  categoryLegacyCaps: [],  // 类目↔老能力关联
  customModules: [],       // 企业自定义模块
  customCapabilities: [],  // 企业自定义能力
  legacyModules: JSON.parse(JSON.stringify(initialLegacyModules)),
  legacyCapabilities: JSON.parse(JSON.stringify(initialLegacyCapabilities))
})

// ===== 类目操作 =====
export function addCategory(item) {
  store.categories.push({
    id: nextId(),
    parentId: item.parentId ?? null,
    name: item.name,
    identifier: item.identifier,
    descr: item.descr
  })
}

export function updateCategory(id, item) {
  const cat = store.categories.find(c => c.id === id)
  if (cat) {
    cat.parentId = item.parentId ?? null
    cat.name = item.name
    cat.identifier = item.identifier
    cat.descr = item.descr
  }
}

export function removeCategory(id) {
  // 级联删除所有子孙类目及其能力关联
  const ids = [id, ...getCategoryDescendantIds(id)]
  store.categories = store.categories.filter(c => !ids.includes(c.id))
  store.categoryCaps = store.categoryCaps.filter(cc => !ids.includes(cc.categoryId))
  store.categoryLegacyCaps = store.categoryLegacyCaps.filter(cc => !ids.includes(cc.categoryId))
}

// ===== 类目树辅助 =====
// 取某类目下所有子孙类目 id（不含自身）
export function getCategoryDescendantIds(id) {
  const ids = []
  const walk = (pid) => {
    store.categories.filter(c => c.parentId === pid).forEach(c => {
      ids.push(c.id)
      walk(c.id)
    })
  }
  walk(id)
  return ids
}

// 平铺类目数组 → 树（供 el-table 树形模式 / el-tree-select 使用）
export function buildCategoryTree() {
  const nodes = store.categories.map(c => ({ ...c, children: [] }))
  const map = new Map(nodes.map(n => [n.id, n]))
  const roots = []
  nodes.forEach(n => {
    const p = n.parentId != null ? map.get(n.parentId) : null
    if (p) p.children.push(n)
    else roots.push(n)
  })
  // 叶子节点去掉空 children，避免表格出现无意义的展开箭头
  const prune = (list) => list.forEach(n => {
    if (n.children.length) prune(n.children)
    else delete n.children
  })
  prune(roots)
  return roots
}

// ===== 模块操作 =====
export function addModule(item) {
  store.modules.push({ id: nextId(), name: item.name, identifier: item.identifier })
}

export function updateModule(id, item) {
  const mod = store.modules.find(m => m.id === id)
  if (mod) { mod.name = item.name; mod.identifier = item.identifier }
}

export function removeModule(id) {
  // 删除模块时，同步删除其下的能力及关联
  const capIds = store.capabilities.filter(c => c.moduleId === id).map(c => c.id)
  store.capabilities = store.capabilities.filter(c => c.moduleId !== id)
  store.categoryCaps = store.categoryCaps.filter(cc => !capIds.includes(cc.capabilityId))
  store.modules = store.modules.filter(m => m.id !== id)
}

// ===== 能力项操作（层级：能力模块 → 能力项 → 参数）=====
export function addCapItem(item) {
  const id = nextId()
  store.capItems.push({
    id,
    moduleId: item.moduleId,
    capType: item.capType || 'prop',
    name: item.name,
    identifier: item.identifier,
    accessMode: item.accessMode === 'ro' ? 'ro' : 'rw',
    updateTime: nowStamp()
  })
  return id
}

export function updateCapItem(id, item) {
  const ci = store.capItems.find(x => x.id === id)
  if (ci) {
    ci.moduleId = item.moduleId
    ci.capType = item.capType || 'prop'
    ci.name = item.name
    ci.identifier = item.identifier
    ci.accessMode = item.accessMode === 'ro' ? 'ro' : 'rw'
    ci.updateTime = nowStamp()
    // 读写模式归属能力项：变更后同步到该能力项下的所有参数
    store.capabilities
      .filter(c => c.capItemId === id && c.dataDef)
      .forEach(c => { c.dataDef.accessMode = ci.accessMode })
  }
}

// 删除能力项：其下参数一并删除（连同类目关联）
export function removeCapItem(id) {
  const capIds = store.capabilities.filter(c => c.capItemId === id).map(c => c.id)
  store.capabilities = store.capabilities.filter(c => c.capItemId !== id)
  store.categoryCaps = store.categoryCaps.filter(cc => !capIds.includes(cc.capabilityId))
  store.capItems = store.capItems.filter(x => x.id !== id)
}

export function getCapItemsByModule(moduleId) {
  if (moduleId === 'all' || moduleId == null) return store.capItems
  return store.capItems.filter(x => String(x.moduleId) === String(moduleId))
}

export function getCapsByCapItem(capItemId) {
  return store.capabilities.filter(c => c.capItemId === capItemId)
}

function nowStamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// ===== 能力（参数）操作 =====
export function addCapability(item) {
  const capId = nextId()
  store.capabilities.push({ id: capId, moduleId: item.moduleId, capItemId: item.capItemId, capType: item.capType, name: item.name, identifier: item.identifier, descr: item.descr, dataDef: item.dataDef })
  return capId
}

export function updateCapability(capId, item) {
  const cap = store.capabilities.find(c => c.id === capId)
  if (cap) {
    cap.moduleId = item.moduleId; cap.capItemId = item.capItemId
    cap.capType = item.capType
    cap.name = item.name; cap.identifier = item.identifier
    cap.descr = item.descr; cap.dataDef = item.dataDef
  }
}

export function removeCapability(capId) {
  store.capabilities = store.capabilities.filter(c => c.id !== capId)
  store.categoryCaps = store.categoryCaps.filter(cc => cc.capabilityId !== capId)
}

// ===== 关联表操作 =====
export function linkCapToCategory(categoryId, capabilityId) {
  if (!store.categoryCaps.some(cc => cc.categoryId === categoryId && cc.capabilityId === capabilityId)) {
    store.categoryCaps.push({ categoryId, capabilityId })
  }
}

export function unlinkCapFromCategory(categoryId, capabilityId) {
  store.categoryCaps = store.categoryCaps.filter(cc => !(cc.categoryId === categoryId && cc.capabilityId === capabilityId))
}

export function getCategoryLinkedCapIds(categoryId) {
  return store.categoryCaps.filter(cc => cc.categoryId === categoryId).map(cc => cc.capabilityId)
}

// ===== 类目↔老能力（能力池（老））关联 =====
export function linkLegacyCapToCategory(categoryId, capabilityId) {
  if (!store.categoryLegacyCaps.some(cc => cc.categoryId === categoryId && cc.capabilityId === capabilityId)) {
    store.categoryLegacyCaps.push({ categoryId, capabilityId })
  }
}

export function unlinkLegacyCapFromCategory(categoryId, capabilityId) {
  store.categoryLegacyCaps = store.categoryLegacyCaps.filter(cc => !(cc.categoryId === categoryId && cc.capabilityId === capabilityId))
}

export function getCategoryLinkedLegacyCapIds(categoryId) {
  return store.categoryLegacyCaps.filter(cc => cc.categoryId === categoryId).map(cc => cc.capabilityId)
}

export function getCapLinkedCategoryIds(capabilityId) {
  return store.categoryCaps.filter(cc => cc.capabilityId === capabilityId).map(cc => cc.categoryId)
}

// ===== 查找 =====
export function findCapability(capId) {
  const cap = store.capabilities.find(c => c.id === capId)
  if (!cap) return null
  const mod = store.modules.find(m => m.id === cap.moduleId)
  return { module: mod || null, capability: cap }
}

// ===== 统计 =====
export function getCategoryStats(categoryId) {
  const capIds = getCategoryLinkedCapIds(categoryId)
  // 模块数：从关联能力中反查其 moduleId 去重
  const moduleIds = new Set()
  capIds.forEach(cid => {
    const cap = store.capabilities.find(c => c.id === cid)
    if (cap) moduleIds.add(cap.moduleId)
  })
  const legacyCapIds = getCategoryLinkedLegacyCapIds(categoryId)
  return { moduleCount: moduleIds.size, capabilityCount: capIds.length, legacyCapabilityCount: legacyCapIds.length }
}

// ===== 标识符唯一性校验 =====
export function isIdentifierUnique(identifier, excludeId) {
  return !store.categories.some(c => {
    if (excludeId && c.id === excludeId) return false
    return c.identifier === identifier
  })
}

export function isModuleIdentifierUnique(identifier, excludeModuleId) {
  for (const mod of store.modules) {
    if (excludeModuleId && mod.id === excludeModuleId) continue
    if (mod.identifier === identifier) return false
  }
  return true
}

// ===== 自定义模块操作 =====
export function addCustomModule(item) {
  store.customModules.push({ id: nextId(), name: item.name, identifier: item.identifier })
}

export function updateCustomModule(id, item) {
  const mod = store.customModules.find(m => m.id === id)
  if (mod) { mod.name = item.name; mod.identifier = item.identifier }
}

export function removeCustomModule(id) {
  store.customModules = store.customModules.filter(m => m.id !== id)
  store.customCapabilities = store.customCapabilities.filter(c => c.moduleId !== id)
}

export function isCustomModuleIdentifierUnique(identifier, excludeModuleId) {
  for (const mod of store.customModules) {
    if (excludeModuleId && mod.id === excludeModuleId) continue
    if (mod.identifier === identifier) return false
  }
  return true
}

// ===== 自定义能力操作 =====
export function addCustomCapability(item) {
  const capId = nextId()
  store.customCapabilities.push({ id: capId, moduleId: item.moduleId, capType: item.capType, name: item.name, identifier: item.identifier, descr: item.descr, dataDef: item.dataDef })
  return capId
}

export function updateCustomCapability(capId, item) {
  const cap = store.customCapabilities.find(c => c.id === capId)
  if (cap) { cap.moduleId = item.moduleId; cap.capType = item.capType; cap.name = item.name; cap.identifier = item.identifier; cap.descr = item.descr; cap.dataDef = item.dataDef }
}

export function removeCustomCapability(capId) {
  store.customCapabilities = store.customCapabilities.filter(c => c.id !== capId)
}

export function isCustomCapIdentifierUnique(identifier, excludeCapId, capItemId) {
  for (const cap of store.customCapabilities) {
    if (excludeCapId && cap.id === excludeCapId) continue
    if (capItemId !== undefined && cap.capItemId !== capItemId) continue
    if (cap.identifier === identifier) return false
  }
  return true
}

export function isCapIdentifierUnique(identifier, excludeCapId, capItemId) {
  for (const cap of store.capabilities) {
    if (excludeCapId && cap.id === excludeCapId) continue
    if (capItemId !== undefined && cap.capItemId !== capItemId) continue
    if (cap.identifier === identifier) return false
  }
  return true
}

// ===== 老能力模块操作 =====
export function addLegacyModule(item) {
  store.legacyModules.push({ id: nextId(), name: item.name, identifier: item.identifier })
}

export function updateLegacyModule(id, item) {
  const mod = store.legacyModules.find(m => m.id === id)
  if (mod) { mod.name = item.name; mod.identifier = item.identifier }
}

export function removeLegacyModule(id) {
  store.legacyCapabilities = store.legacyCapabilities.filter(c => c.moduleId !== id)
  store.legacyModules = store.legacyModules.filter(m => m.id !== id)
}

export function isLegacyModuleIdentifierUnique(identifier, excludeId) {
  for (const mod of store.legacyModules) {
    if (excludeId && mod.id === excludeId) continue
    if (mod.identifier === identifier) return false
  }
  return true
}

// ===== 老能力操作 =====
export function addLegacyCapability(item) {
  const capId = nextId()
  store.legacyCapabilities.push({
    id: capId, moduleId: item.moduleId, identifier: item.identifier,
    name: item.name, descr: item.descr, jsonContent: item.jsonContent,
    createTime: item.createTime || new Date().toISOString().replace('T', ' ').slice(0, 19)
  })
  return capId
}

export function updateLegacyCapability(capId, item) {
  const cap = store.legacyCapabilities.find(c => c.id === capId)
  if (cap) {
    cap.moduleId = item.moduleId; cap.identifier = item.identifier
    cap.name = item.name; cap.descr = item.descr; cap.jsonContent = item.jsonContent
  }
}

export function removeLegacyCapability(capId) {
  store.legacyCapabilities = store.legacyCapabilities.filter(c => c.id !== capId)
}

export function isLegacyCapIdentifierUnique(identifier, excludeCapId) {
  for (const cap of store.legacyCapabilities) {
    if (excludeCapId && cap.id === excludeCapId) continue
    if (cap.identifier === identifier) return false
  }
  return true
}

// ========================================================================
// 旧能力共享定义（设备/镜头/麦克风三套） — 能力库与类目页同源
// ========================================================================
export function capSwitch(value) { return { type: 'switch', value } }
export function capCheckbox(options, value) { return { type: 'checkbox', options, value } }
export function capRadio(options, value) { return { type: 'radio', options, value } }
export function capSelect(options, value) { return { type: 'select', options, value } }
export function capNumber(value, min, max, unit) { return { type: 'number', value, min, max, unit } }

// 设备能力（设备级，按 5 模块分组）
export function legacyDeviceDef() {
  return [
    {
      name: '扬声器模块',
      items: [
        { id: 'intercom', name: '对讲能力', supported: '0', defaultValue: capSelect(['半双工', '全双工'], '半双工'), defaultName: '对讲类型', access: 'ro' },
        { id: 'hasSpeaker', name: '喇叭能力', supported: '0', defaultValue: null },
        { id: 'volumeAdjust', name: '音量调节能力', supported: '0', defaultValue: null, children: [
          { id: 'volume', name: '音量', defaultValue: capNumber(1, 0, 100, '') }
        ] },
        { id: 'customRing', name: '自定义铃声能力', supported: '0', defaultValue: null }
      ]
    },
    {
      name: '录制模块',
      items: [
        { id: 'storageMethod', name: '存储能力', supported: '0', defaultValue: capRadio(['TF卡存储', '磁盘存储'], 'TF卡存储'), defaultName: '存储方式', access: 'ro' },
        { id: 'recordMode', name: 'SD卡全天录制能力', supported: '0', defaultValue: capSwitch(false), defaultName: '全天录制开关' },
        { id: 'alarmRecord', name: 'SD卡事件录制能力', supported: '0', defaultValue: null, children: [
          { id: 'alarmDuration', name: '事件录制时长', defaultValue: capNumber(15, 5, 300, '秒') }
        ] }
      ]
    },
    {
      name: '电池模块',
      items: [
        { id: 'hasBattery', name: '电池能力', supported: '0', defaultValue: null },
        { id: 'wakeup', name: '唤醒能力', supported: '0', defaultValue: capRadio(['本地唤醒', '远程唤醒', '本地和远程'], '本地唤醒'), defaultName: '唤醒方式', access: 'ro' }
      ]
    },
    {
      name: '灯光模块',
      items: [
        { id: 'indicator', name: '状态指示灯能力', supported: '0', defaultValue: null },
        { id: 'irLight', name: '红外灯能力', supported: '0', defaultValue: null }
      ]
    },
    {
      name: '云端抓图模块',
      items: [
        { id: 'cloudCapture', name: '云端抓图能力', supported: '0', defaultValue: null, children: [
          { id: 'ccDefaultOn', name: '默认开启', defaultValue: capRadio(['开启', '关闭'], '开启') },
          { id: 'ccSupportGif', name: '支持动图', defaultValue: capRadio(['是', '否'], '否') },
          { id: 'ccGifEnabled', name: '动图开关', defaultValue: capRadio(['开启', '关闭'], '关闭') },
          { id: 'ccQuality', name: '抓图质量', defaultValue: capSelect(['小图', '标清', '高清'], '小图') },
          { id: 'ccStorageDays', name: '存储时长', defaultValue: capNumber(1, 1, 30, '天') },
          { id: 'ccStorageMode', name: '存储方式', defaultValue: capRadio(['事件', '定时'], '事件') },
          { id: 'ccStorageFormat', name: '存储格式', defaultValue: capRadio(['已有格式，带有私有头', '标准jpg'], '已有格式，带有私有头') },
          { id: 'ccCaptureCount', name: '抓图数目', defaultValue: capNumber(1, 0, 99, '') },
          { id: 'ccCaptureInterval', name: '抓拍间隔', defaultValue: capNumber(30, 5, 300, '秒') }
        ] }
      ]
    }
  ]
}

// 镜头能力（每镜头实例一份，按 2 模块分组）
export function legacyLensDef() {
  return [
    {
      name: 'PTZ模块',
      items: [
        { id: 'ptzSupported', name: 'PTZ能力', supported: '0', defaultValue: null, children: [
          { id: 'ptzCaps', name: 'PTZ方向', defaultValue: capCheckbox(['平移', '倾斜', '变焦'], []), access: 'ro' }
        ] },
        { id: 'preset', name: '预置位能力', supported: '0', defaultValue: null },
        { id: 'cruise', name: '自动巡航能力', supported: '0', defaultValue: null },
        { id: 'spatial', name: '空间定位能力', supported: '0', defaultValue: capRadio(['支持3D居中', '支持GPS定位'], '支持3D居中'), defaultName: '定位方式', access: 'ro' },
        { id: 'ptzSpeed', name: 'PTZ转速能力', supported: '0', defaultValue: null }
      ]
    },
    {
      name: '图像采集模块',
      items: [
        { id: 'flip', name: '图像翻转能力', supported: '0', defaultValue: capRadio(['正放', '翻转'], '正放'), defaultName: '翻转方向', access: 'rw' },
        { id: 'mirror', name: '镜像能力', supported: '0', defaultValue: capRadio(['打开', '关闭'], '关闭'), defaultName: '镜像状态', access: 'rw' },
        { id: 'nightVision', name: '夜视能力', supported: '0', defaultValue: null },
        { id: 'wdr', name: '宽动态能力', supported: '0', defaultValue: capSwitch(false), defaultName: '宽动态开关', access: 'rw' },
        { id: 'hdr', name: '高动态能力', supported: '0', defaultValue: capSwitch(false), defaultName: '高动态开关', access: 'rw' },
        { id: 'antiFlicker', name: '抗闪烁能力', supported: '0', defaultValue: capRadio(['50', '60'], '50'), defaultName: '抗闪烁频率', access: 'rw' },
        { id: 'privacyZone', name: '隐私区域能力', supported: '0', defaultValue: null },
        { id: 'logoWatermark', name: 'LOGO水印能力', supported: '0', defaultValue: null },
        { id: 'fisheye', name: '鱼眼矫正能力', supported: '0', defaultValue: capRadio(['设备矫正', 'App矫正'], '设备矫正'), defaultName: '矫正方式', access: 'rw' },
        { id: 'snapshot', name: '抓图能力', supported: '0', defaultValue: null },
        { id: 'humanoidCoord', name: '人形坐标写入能力', supported: '0', defaultValue: null },
        { id: 'compositeStream', name: '合成流能力', supported: '0', defaultValue: null }
      ]
    }
  ]
}

// 麦克风能力（每麦克风实例一份，1 模块）
export function legacyMicDef() {
  return [
    {
      name: '麦克风模块',
      items: [
        { id: 'micSwitch', name: '麦克风开关能力', supported: '0', defaultValue: null },
        { id: 'volumeAdjust', name: '音量调节能力', supported: '0', defaultValue: null, children: [
          { id: 'captureVolume', name: '采集音量', defaultValue: capNumber(0, 0, 100, ''), access: 'rw' }
        ] }
      ]
    }
  ]
}

// ========================================================================
// 算法 & 事件 Mock 数据
// ========================================================================

const initialAlgorithms = [
  {
    id: nextId(), algorithmType: 'device', algorithmId: '4001', algorithmIcon: '🔍', serviceId: '400001',
    algorithmName: JSON.stringify({ '1': '新侦测算法', '2': 'New Detection' }),
    capabilities: JSON.stringify({ MotionDetect: true, AlgorithmSwitch: true, Sensitivity: true, DetectType: true, ScheduledDetect: true, ZoneDetect: true, __detectTypes: { motion: '运动', person: '人形', vehicle: '车辆' } }),
    capabilityIds: JSON.stringify(['MotionDetect', 'AlgorithmSwitch', 'Sensitivity', 'DetectType', 'ScheduledDetect', 'ZoneDetect']),
    eventIds: JSON.stringify([100001, 100002]),
    referencedCount: 3
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1108', algorithmIcon: '📍', serviceId: '300050',
    algorithmName: JSON.stringify({ '1': 'GPS信息处理', '2': 'GPS Info Processing' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch']),
    eventIds: JSON.stringify([]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1109', algorithmIcon: '📦', serviceId: '300025',
    algorithmName: JSON.stringify({ '1': '包裹检测', '2': 'Package Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch']),
    eventIds: JSON.stringify([100006]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1111', algorithmIcon: '🐟', serviceId: '300046',
    algorithmName: JSON.stringify({ '1': '鱼类检测', '2': 'Fish Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch']),
    eventIds: JSON.stringify([]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1112', algorithmIcon: '👤', serviceId: '300018',
    algorithmName: JSON.stringify({ '1': '人脸检测', '2': 'Face Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, PersonDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'PersonDetect']),
    eventIds: JSON.stringify([100002]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1114', algorithmIcon: '🍽️', serviceId: '300049',
    algorithmName: JSON.stringify({ '1': '宠物喂食', '2': 'Pet Feeding' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch']),
    eventIds: JSON.stringify([]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1082', algorithmIcon: '🔥', serviceId: '300038',
    algorithmName: JSON.stringify({ '1': '烟火侦测', '2': 'Fire & Smoke Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, Sensitivity: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'Sensitivity']),
    eventIds: JSON.stringify([]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1004', algorithmIcon: '🔊', serviceId: '300037',
    algorithmName: JSON.stringify({ '1': '声音检测', '2': 'Sound Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, SoundAlarm: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'SoundAlarm']),
    eventIds: JSON.stringify([100003]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1086', algorithmIcon: '🚲', serviceId: '300047',
    algorithmName: JSON.stringify({ '1': '非机动车检测', '2': 'Non-Motor Vehicle Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, VehicleDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'VehicleDetect']),
    eventIds: JSON.stringify([]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1003', algorithmIcon: '📡', serviceId: '300048',
    algorithmName: JSON.stringify({ '1': 'PIR红外检测', '2': 'PIR Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, Sensitivity: true, PersonDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'Sensitivity', 'PersonDetect']),
    eventIds: JSON.stringify([100001]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1088', algorithmIcon: '🚗', serviceId: '300019',
    algorithmName: JSON.stringify({ '1': '车牌识别', '2': 'License Plate Recognition' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, VehicleDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'VehicleDetect']),
    eventIds: JSON.stringify([100008]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1090', algorithmIcon: '🚶', serviceId: '300045',
    algorithmName: JSON.stringify({ '1': '客流统计', '2': 'People Counting' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, PersonDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'PersonDetect']),
    eventIds: JSON.stringify([100002]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1021', algorithmIcon: '🔋', serviceId: '300028',
    algorithmName: JSON.stringify({ '1': '低电检测', '2': 'Low Battery Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch']),
    eventIds: JSON.stringify([100005]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1024', algorithmIcon: '🆘', serviceId: '300020',
    algorithmName: JSON.stringify({ '1': '跌倒检测', '2': 'Fall Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, PersonDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'PersonDetect']),
    eventIds: JSON.stringify([]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1025', algorithmIcon: '🔥', serviceId: '300022',
    algorithmName: JSON.stringify({ '1': '火焰检测', '2': 'Flame Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, Sensitivity: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'Sensitivity']),
    eventIds: JSON.stringify([]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1028', algorithmIcon: '😢', serviceId: '300023',
    algorithmName: JSON.stringify({ '1': '哭声检测', '2': 'Cry Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, SoundAlarm: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'SoundAlarm']),
    eventIds: JSON.stringify([100003]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1029', algorithmIcon: '🐾', serviceId: '300024',
    algorithmName: JSON.stringify({ '1': '宠物检测', '2': 'Pet Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, PetDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'PetDetect']),
    eventIds: JSON.stringify([]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1070', algorithmIcon: '🚫', serviceId: '300043',
    algorithmName: JSON.stringify({ '1': '离岗侦测', '2': 'Absence Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, PersonDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'PersonDetect']),
    eventIds: JSON.stringify([]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1079', algorithmIcon: '🚧', serviceId: '300034',
    algorithmName: JSON.stringify({ '1': '区域闯入', '2': 'Area Intrusion' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, ZoneDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'ZoneDetect']),
    eventIds: JSON.stringify([100001]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1080', algorithmIcon: '🚪', serviceId: '300035',
    algorithmName: JSON.stringify({ '1': '区域离开', '2': 'Area Exit' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, ZoneDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'ZoneDetect']),
    eventIds: JSON.stringify([100001]),
    referencedCount: 0
  },
  {
    id: nextId(), algorithmType: 'device', algorithmId: '1083', algorithmIcon: '🚙', serviceId: '300017',
    algorithmName: JSON.stringify({ '1': '车辆侦测', '2': 'Vehicle Detection' }),
    capabilities: JSON.stringify({ AlgorithmSwitch: true, VehicleDetect: true }),
    capabilityIds: JSON.stringify(['AlgorithmSwitch', 'VehicleDetect']),
    eventIds: JSON.stringify([100008]),
    referencedCount: 0
  }
]

const initialEvents = [
  { id: nextId(), eventId: 100001, eventName: JSON.stringify({ '1': '移动侦测告警', '2': 'Motion Alert' }), eventRemark: 'PIR传感器检测到移动物体时触发', pushCopy: JSON.stringify({ '1': '检测到移动物体', '2': 'Motion detected' }), referencedCount: 2 },
  { id: nextId(), eventId: 100002, eventName: JSON.stringify({ '1': '人形识别告警', '2': 'Person Alert' }), eventRemark: 'AI人形识别到有人出现时触发', pushCopy: JSON.stringify({ '1': '发现有人活动', '2': 'Person detected' }), referencedCount: 1 },
  { id: nextId(), eventId: 100003, eventName: JSON.stringify({ '1': '异常声音告警', '2': 'Abnormal Sound' }), eventRemark: '检测到异常声音时触发（玻璃破碎、尖叫声等）', pushCopy: JSON.stringify({ '1': '检测到异常声音', '2': 'Abnormal sound detected' }), referencedCount: 1 },
  { id: nextId(), eventId: 100004, eventName: JSON.stringify({ '1': '灯光状态变更', '2': 'Light Status Changed' }), eventRemark: '灯光模式切换时触发', pushCopy: JSON.stringify({ '1': '灯光状态已更新', '2': 'Light status updated' }), referencedCount: 1 },
  { id: nextId(), eventId: 100005, eventName: JSON.stringify({ '1': '低电量告警', '2': 'Low Battery' }), eventRemark: '设备电量低于阈值时触发', pushCopy: JSON.stringify({ '1': '设备电量不足，请及时充电', '2': 'Device battery low' }), referencedCount: 1 },
  { id: nextId(), eventId: 100006, eventName: JSON.stringify({ '1': '设备上线通知', '2': 'Device Online' }), eventRemark: '设备从离线恢复在线时触发', pushCopy: JSON.stringify({ '1': '设备已重新上线', '2': 'Device is back online' }), referencedCount: 0 },
  { id: nextId(), eventId: 100007, eventName: JSON.stringify({ '1': '门铃呼叫', '2': 'Bell Ring' }), eventRemark: '访客按下门铃时触发', pushCopy: JSON.stringify({ '1': '有人在门口', '2': 'Someone is at the door' }), referencedCount: 0 },
  { id: nextId(), eventId: 100008, eventName: JSON.stringify({ '1': '车辆识别告警', '2': 'Vehicle Alert' }), eventRemark: 'AI识别到车辆进入监控区域', pushCopy: JSON.stringify({ '1': '检测到车辆进入', '2': 'Vehicle detected' }), referencedCount: 0 }
]

store.algorithms = JSON.parse(JSON.stringify(initialAlgorithms))
store.events = JSON.parse(JSON.stringify(initialEvents))

// ===== 服务类型数据 =====
const initialServices = [
  { id: 1, name: '智能告警', serviceId: '110600', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 2, name: '低电检测服务', serviceId: '300028', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 3, name: '火焰检测', serviceId: '300022', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 4, name: '跌倒检测', serviceId: '300020', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 5, name: '宠物喂食器', serviceId: '300049', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 6, name: 'GPS定位', serviceId: '300050', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 7, name: '低功耗PIR检测', serviceId: '300048', categoryId: 1, algorithmIds: ['4003'], eventIds: [100001, 100005] },
  { id: 8, name: '非机动车检测', serviceId: '300047', categoryId: 1, algorithmIds: ['4001'], eventIds: [100001, 100002, 100008] },
  { id: 9, name: '鱼缸侦测', serviceId: '300046', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 10, name: '客流统计', serviceId: '300045', categoryId: 1, algorithmIds: ['4001'], eventIds: [100002] },
  { id: 11, name: '儿童检测', serviceId: '300044', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 12, name: '离岗侦测', serviceId: '300043', categoryId: 1, algorithmIds: ['4001'], eventIds: [100001] },
  { id: 13, name: '包裹侦测', serviceId: '300025', categoryId: 1, algorithmIds: ['4001'], eventIds: [100006] },
  { id: 14, name: '哭声侦测', serviceId: '300023', categoryId: 1, algorithmIds: ['4002'], eventIds: [100003] },
  { id: 15, name: '智能报警-家门监测', serviceId: '300041', categoryId: 1, algorithmIds: ['4002'], eventIds: [100007] },
  { id: 16, name: '智能报警-厨房安全', serviceId: '300040', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 17, name: '智能报警-宠物监测', serviceId: '300042', categoryId: 1, algorithmIds: [], eventIds: [] },
  { id: 18, name: '智能报警-老人看护', serviceId: '300039', categoryId: 1, algorithmIds: [], eventIds: [] },
  // 以下为演示「一个算法对应多个服务」的额外服务映射
  { id: 19, name: '人脸识别增强', serviceId: '300052', categoryId: 1, algorithmIds: ['1112'], eventIds: [100002] },
  { id: 20, name: 'PIR增强检测', serviceId: '300053', categoryId: 1, algorithmIds: ['1003'], eventIds: [100001, 100005] },
  { id: 21, name: '车辆识别增强', serviceId: '300054', categoryId: 1, algorithmIds: ['1083'], eventIds: [100008] },
  { id: 22, name: '车牌识别增强', serviceId: '300055', categoryId: 1, algorithmIds: ['1088'], eventIds: [100008] },
  { id: 23, name: '烟火侦测增强', serviceId: '300056', categoryId: 1, algorithmIds: ['1082'], eventIds: [] },
  { id: 24, name: '声音检测增强', serviceId: '300057', categoryId: 1, algorithmIds: ['1004'], eventIds: [100003] }
]
store.services = JSON.parse(JSON.stringify(initialServices))

export function getAlgorithmServiceId(algorithmId) {
  const svc = store.services.find(s => s.algorithmIds.includes(algorithmId))
  return svc ? svc.serviceId : '-'
}

export function getAllAlgorithmServices(algorithmId) {
  return store.services.filter(s => s.algorithmIds.includes(algorithmId))
}

export function getAlgorithmEvents(algorithmId) {
  const algo = store.algorithms.find(a => a.algorithmId === algorithmId)
  const algoEventIds = (() => { try { return JSON.parse(algo?.eventIds || '[]') } catch { return [] } })()
  const svcs = store.services.filter(s => s.algorithmIds.includes(algorithmId))
  const svcEventIds = svcs.flatMap(s => s.eventIds)
  return [...new Set([...algoEventIds, ...svcEventIds])]
}

export function listServices() {
  return { code: 0, data: { list: JSON.parse(JSON.stringify(store.services)) } }
}

// ---- 算法 CRUD ----

export function listAlgorithms({ page, pageSize, keyword } = {}) {
  let list = [...store.algorithms]
  if (keyword) {
    const kw = keyword.toLowerCase()
    list = list.filter(a => {
      const name = (() => { try { return JSON.parse(a.algorithmName || '{}')['1'] || '' } catch { return '' } })()
      return a.algorithmId.toLowerCase().includes(kw) || name.includes(kw)
    })
  }
  const total = list.length
  const p = page || 1
  const ps = pageSize || 20
  const start = (p - 1) * ps
  return { code: 0, data: { list: list.slice(start, start + ps), total } }
}

export function getAlgorithm(id) {
  const algo = store.algorithms.find(a => a.id === id)
  if (!algo) return { code: 1, message: '算法不存在' }
  return { code: 0, data: JSON.parse(JSON.stringify(algo)) }
}

export function addAlgorithm(data) {
  const item = {
    id: nextId(),
    algorithmId: data.algorithmId,
    algorithmIcon: data.algorithmIcon || '',
    algorithmName: data.algorithmName || '{}',
    descr: data.descr || '',
    capabilities: data.capabilities || '{}',
    capabilityIds: data.capabilityIds || '[]',
    eventIds: data.eventIds || '[]',
    algorithmType: data.algorithmType || 'device',
    referencedCount: 0
  }
  store.algorithms.push(item)
  return { code: 0 }
}

export function updateAlgorithm(data) {
  const idx = store.algorithms.findIndex(a => a.id === data.id)
  if (idx === -1) return { code: 1, message: '算法不存在' }
  const cur = store.algorithms[idx]
  if (data.algorithmId !== undefined) cur.algorithmId = data.algorithmId
  if (data.algorithmIcon !== undefined) cur.algorithmIcon = data.algorithmIcon
  if (data.algorithmName !== undefined) cur.algorithmName = data.algorithmName
  if (data.descr !== undefined) cur.descr = data.descr
  if (data.capabilities !== undefined) cur.capabilities = data.capabilities
  if (data.capabilityIds !== undefined) cur.capabilityIds = data.capabilityIds
  if (data.eventIds !== undefined) cur.eventIds = data.eventIds
  if (data.serviceIds !== undefined) cur.serviceIds = data.serviceIds
  if (data.algorithmType !== undefined) cur.algorithmType = data.algorithmType
  // 更新事件引用计数
  _updateEventRefCounts()
  return { code: 0 }
}

export function deleteAlgorithm(id) {
  const idx = store.algorithms.findIndex(a => a.id === id)
  if (idx === -1) return { code: 1, message: '算法不存在' }
  store.algorithms.splice(idx, 1)
  _updateEventRefCounts()
  return { code: 0 }
}

// ---- 事件 CRUD ----

export function listEvents({ page, pageSize, keyword } = {}) {
  let list = [...store.events]
  if (keyword) {
    const kw = keyword.toLowerCase()
    list = list.filter(e => {
      const name = (() => { try { return JSON.parse(e.eventName || '{}')['1'] || '' } catch { return '' } })()
      return String(e.eventId).includes(kw) || name.includes(kw)
    })
  }
  const total = list.length
  const p = page || 1
  const ps = pageSize || 20
  const start = (p - 1) * ps
  return { code: 0, data: { list: list.slice(start, start + ps), total } }
}

export function allEvents() {
  return { code: 0, data: { list: JSON.parse(JSON.stringify(store.events)) } }
}

export function getModules() {
  return JSON.parse(JSON.stringify(store.modules))
}

export function getCapabilitiesByIds(identifiers) {
  if (!identifiers || !identifiers.length) return []
  return store.capabilities.filter(c => identifiers.includes(c.identifier)).map(c => JSON.parse(JSON.stringify(c)))
}

export function getAllCapabilities() {
  return JSON.parse(JSON.stringify(store.capabilities))
}

export function getEvent(id) {
  const evt = store.events.find(e => e.id === id)
  if (!evt) return { code: 1, message: '事件不存在' }
  return { code: 0, data: JSON.parse(JSON.stringify(evt)) }
}

export function addEvent(data) {
  const item = {
    id: nextId(),
    eventId: data.eventId,
    eventName: data.eventName || '{}',
    eventRemark: data.eventRemark || '',
    pushCopy: data.pushCopy || '{}',
    referencedCount: 0
  }
  store.events.push(item)
  return { code: 0 }
}

export function updateEvent(data) {
  const idx = store.events.findIndex(e => e.id === data.id)
  if (idx === -1) return { code: 1, message: '事件不存在' }
  const cur = store.events[idx]
  if (data.eventId !== undefined) cur.eventId = data.eventId
  if (data.eventName !== undefined) cur.eventName = data.eventName
  if (data.eventRemark !== undefined) cur.eventRemark = data.eventRemark
  if (data.pushCopy !== undefined) cur.pushCopy = data.pushCopy
  return { code: 0 }
}

export function deleteEvent(id) {
  const idx = store.events.findIndex(e => e.id === id)
  if (idx === -1) return { code: 1, message: '事件不存在' }
  store.events.splice(idx, 1)
  // 清理算法中对事件的引用
  store.algorithms.forEach(a => {
    try {
      const eids = JSON.parse(a.eventIds || '[]')
      a.eventIds = JSON.stringify(eids.filter(eid => eid !== store.events[idx]?.eventId))
    } catch { /* ignore */ }
  })
  return { code: 0 }
}

function _updateEventRefCounts() {
  const counts = {}
  store.algorithms.forEach(a => {
    try {
      JSON.parse(a.eventIds || '[]').forEach(eid => {
        counts[eid] = (counts[eid] || 0) + 1
      })
    } catch { /* ignore */ }
  })
  store.events.forEach(e => { e.referencedCount = counts[e.eventId] || 0 })
  store.algorithms.forEach(a => {
    try {
      a.referencedCount = store.algorithms.filter(o => o !== a && o.capabilities === a.capabilities).length + 1
    } catch { a.referencedCount = 0 }
  })
}
