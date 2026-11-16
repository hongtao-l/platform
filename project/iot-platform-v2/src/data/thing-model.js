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
  mk(MOD_DEV.id, 'prop', 'rw', C('string', 'device_name', '设备名称', '设备名称')),
  mk(MOD_DEV.id, 'prop', 'ro', C('string', 'company_id', '企业ID', '企业ID')),
  mk(MOD_DEV.id, 'prop', 'ro', C('string', 'product_id', '产品ID', '产品ID')),
  mk(MOD_DEV.id, 'prop', 'rw', C('string', 'ctei', '设备授权ID', '设备授权ID')),
  mk(MOD_DEV.id, 'prop', 'rw', C('string', 'did', '设备DID', '设备DID')),
  mk(MOD_DEV.id, 'prop', 'rw', C('string', 'gid', '设备GID', '设备GID，设备绑定组ID')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'capture_stream_count', '采集码流数量', '采集码流数量')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('struct', 'capture_stream_param', 'capture_stream_param', '', { fields: [{ name: '采集码流ID', identifier: 'capture_stream_id', dataType: 'int' }, { name: '合成流类型', identifier: 'conbine_stream_type', dataType: 'int' }, { name: '合并镜头ID列表', identifier: 'conbine_lens_ids', dataType: 'array' }, { name: '采集流翻转类型', identifier: 'flip_type', dataType: 'int' }, { name: '焦距类型', identifier: 'focal_type', dataType: 'int' }, { name: '当前图像焦距长度', identifier: 'focal_length', dataType: 'int' }, { name: '图像焦距支持的最小值', identifier: 'focal_length_min', dataType: 'int' }, { name: '图像焦距支持的最大值', identifier: 'focal_length_max', dataType: 'int' }, { name: '采集码流对应的编码码流数量', identifier: 'encode_stream_count', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'capture_stream_id', '采集码流ID', '采集码流ID，从0开始编号,哪一路采集码流的编码码流属性设置')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'encode_stream_id', '编码码流ID', '编码码流ID，从0开始编号，没路采集码流可以有多路编码码流')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'video_encode_mode', '视频编码模式', '视频编码模式，0:CBR,1:VBR,2:AVBR')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'lens_count', '镜头数量', '镜头数量')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('struct', 'lens_param', 'lens_param', '', { fields: [{ name: '镜头矫正类型', identifier: 'lens_corrent_type', dataType: 'int' }, { name: '算法ID标记', identifier: 'correct_algorithm_id', dataType: 'string' }, { name: '矫正算法参数', identifier: 'correct_algorithm_param', dataType: 'string' }] })),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'pt_control_type', 'P/T控制类型', 'P/T控制类型，0:不支持；1.支持设备控制；2.支持分镜头控制；')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('array', 'pt_ability', '不支持', '不支持：则无此项；支持设备控制：数组只有1个值；支持分镜头控制：几个镜头就几个值；取值：0.不支持P/T；1.支持P；2')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'ptz_3d_position_ability', 'PTZ 3D居中能力', 'PTZ 3D居中能力：0.不支持；1.支持；设备有坐标系；')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'ptz_preset_ability', 'PTZ预置位设置能力', 'PTZ预置位设置能力，0.不支持；1.支持； 多个镜头有多个PTZ的一并控制，归属设备能力；')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'ptz_cruise_ability', 'PTZ巡航能力', 'PTZ巡航能力，0.不支持；1.支持; 多个镜头有多个PTZ的一并控制，归属设备能力；')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('struct', 'coordinate', '当前逻辑坐标', '当前逻辑坐标，0～100', { fields: [{ name: '水平逻辑坐标', identifier: 'x', dataType: 'int' }, { name: '垂直逻辑坐标', identifier: 'y', dataType: 'int' }, { name: '变焦逻辑坐标', identifier: 'z', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('struct', 'step_range', '各轴物理步长总数', '各轴物理步长总数（固件上报，SDK 换算用）', { fields: [{ name: '水平轴步长总数', identifier: 'x', dataType: 'int' }, { name: '垂直轴步长总数', identifier: 'y', dataType: 'int' }, { name: '变焦轴步长总数', identifier: 'z', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('struct', 'speed_range', '速度范围', '速度范围（固件上报，SDK 转动时校验）', { fields: [{ name: '最小速度', identifier: 'min', dataType: 'int' }, { name: '最大速度', identifier: 'max', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'preset_id', '预置位编号', '预置位编号，携带时按预置位调用（与 x/y 二选一）')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'x', '目标水平逻辑坐标', '目标水平逻辑坐标，0～100（按坐标移动时与 y 必填）', { min: 0, max: 100 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'y', '目标垂直逻辑坐标', '目标垂直逻辑坐标，0～100（按坐标移动时与 x 必填）', { min: 0, max: 100 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'speed', '速度', '速度，可选；取值 0～speed_range.max（默认 0～52），缺省取 speed_range.max', { min: 0, max: 52 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('string', 'direction', '转动方向', '转动方向，字符串：stop/up/down/left/right/zoom_in/zoom_out/left_up/le')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'speed', '速度', '速度，可选；取值 0～speed_range.max（默认 0～52），缺省取 speed_range.max', { min: 0, max: 52 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'steps_x', '水平步长', '水平步长，可选；纯水平/斜向转动时非0')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'steps_y', '垂直步长', '垂直步长，可选；纯垂直/斜向转动时非0')),
  mk(MOD_IMAGE.id, 'svc', '-', C('string', 'op', '操作类型', '操作类型：add/del/goto/query')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'preset_id', '预置位编号（1~16）', '预置位编号（1~16）', { min: 1, max: 16 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('string', 'name', '预置位名称', '预置位名称，add 时有效')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'x', '预置位水平逻辑坐标', '预置位水平逻辑坐标，add 时有效')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'y', '预置位垂直逻辑坐标', '预置位垂直逻辑坐标，add 时有效')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'speed', '速度', '速度，可选，goto 时有效；取值 0～speed_range.max（默认 0～52），缺省取 speed_range', { min: 0, max: 52 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('string', 'op', '操作类型', '操作类型：set/cancel')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'preset_id', '看守预置位编号', '看守预置位编号，set 时必填')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'return_delay', '空闲返回延时', '空闲返回延时，单位秒，0=立即返回')),
  mk(MOD_IMAGE.id, 'svc', '-', C('string', 'op', '操作类型', '操作类型：set/start/stop')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'patrol_id', '巡航路线编号（1~4）', '巡航路线编号（1~4），set/start 时必填', { min: 1, max: 4 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('array', 'points', '途经预置位编号数组（1~16 个', '途经预置位编号数组（1~16 个），set 时必填')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'dwell_time', '每点停留秒数', '每点停留秒数，set 时必填')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'lens_id', '镜头ID', '镜头ID，-1 表示全部镜头（设备级）')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'cruise_id', '巡航ID', '巡航ID，从0开始编号')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'cruise_interval', '巡航间隔', '巡航间隔，单位秒;若为0，表示只执行一次；')),
  mk(MOD_IMAGE.id, 'evt', '-', C('int', 'event_type_id', '事件类型ID', '事件类型ID，平台统一定义，推送查询描述')),
  mk(MOD_IMAGE.id, 'evt', '-', C('string', 'state', '状态', '状态：motion_start/motion_done/preset_arrived/guard_returned')),
  mk(MOD_IMAGE.id, 'evt', '-', C('int', 'preset_id', '预置位编号', '预置位编号，到达预置位时携带')),
  mk(MOD_IMAGE.id, 'evt', '-', C('int', 'x', '当前水平逻辑坐标', '当前水平逻辑坐标')),
  mk(MOD_IMAGE.id, 'evt', '-', C('int', 'y', '当前垂直逻辑坐标', '当前垂直逻辑坐标')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'snap_ability', '是否支持抓图', '是否支持抓图，0:不支持，1:支持')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'wdr_ability', '是否支持WDR', '是否支持WDR，0:不支持，1:支持')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'wdr_mode', 'WDR模式', 'WDR模式，0:关闭，1:打开')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'hdr_ability', '是否支持HDR', '是否支持HDR，0:不支持，1:支持')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'hdr_mode', 'HDR模式', 'HDR模式，0:关闭，1:打开')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'anti_flicker_ability', '是否支持防闪', '是否支持防闪，0:不支持，1:支持')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'anti_flicker_mode', '防闪模式', '防闪模式，0:关闭，1:打开')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'scan_frequery', '扫描频率', '扫描频率，单位Hz')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'region_sign_ability', '区域标记能力', '区域标记能力，0:不支持，1:支持')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'privacy_mask_ability', '隐私遮挡能力', '隐私遮挡能力，0:不支持，1:支持')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'custom_osd_ability', '自定义OSD能力', '自定义OSD能力，0:不支持，1:支持')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'osd_show_ability', 'OSD显示能力', 'OSD显示能力，0:APP端显示，1:设备端显示')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'capture_stream_id', '采集码流ID', '采集码流ID，从0开始编号')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'osd_enable', 'OSD是否开启', 'OSD是否开启，0:关闭，1:开启')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'osd_count', 'OSD数量', 'OSD数量')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('struct', 'osd_list', 'osd_list', '', { fields: [{ name: 'OSD ID', identifier: 'osd_id', dataType: 'int' }, { name: 'OSD内容', identifier: 'osd_content', dataType: 'string' }, { name: 'OSD位置', identifier: 'osd_position', dataType: 'int' }, { name: 'OSD大小', identifier: 'osd_size', dataType: 'int' }, { name: 'OSD透明度', identifier: 'osd_transparency', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'privacy_mask_count', '隐私区域设置数量', '隐私区域设置数量')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('struct', 'privacy_mask_list', 'privacy_mask_list', '', { fields: [{ name: '隐私区域ID', identifier: 'privacy_mask_id', dataType: 'int' }, { name: '隐私区域名称', identifier: 'privacy_mask_name', dataType: 'string' }, { name: '隐私区域是否开启', identifier: 'privacy_mask_enable', dataType: 'int' }, { name: '隐私区域x坐标', identifier: 'privacy_mask_x', dataType: 'int' }, { name: '隐私区域y坐标', identifier: 'privacy_mask_y', dataType: 'int' }, { name: '隐私区域宽度', identifier: 'privacy_mask_width', dataType: 'int' }, { name: '隐私区域高度', identifier: 'privacy_mask_height', dataType: 'int' }] })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'nvr_channel_num', '码流路号', '码流路号，0 开始编号（0～7），映射采集流下标；缺省 0', { min: 0, max: 7 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'snap_type', '抓图类型', '抓图类型：1.手动；2.定时；3.事件；4.手动(兼容)；缺省 1')),
  mk(MOD_IMAGE.id, 'svc', '-', C('string', 'picture_format', '图片存储格式', '图片存储格式："jpeg".独立.jpg文件；"hmp".聚合.hmp大文件(500张滚动)；缺省按模块默认')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'picture_count', '抓图张数', '抓图张数，1～10；缺省 1（0 按 1）', { min: 1, max: 10 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'picture_interval', '抓图间隔', '抓图间隔，单位毫秒，0～60000；缺省 0（连拍）', { min: 0, max: 60000 })),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'capture_stream_id', '采集码流ID', '采集码流ID，从0开始编号')),
  mk(MOD_IMAGE.id, 'svc', '-', C('int', 'capture_stream_enable', '采集码流开关', '采集码流开关：0.关闭；1.开启；')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'capture_stream_id', '采集码流ID', '采集码流ID，从0开始编号')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'encode_stream_id', '编码码流ID', '编码码流ID，从0开始编号')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'width', '宽度', '宽度')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'height', '高度', '高度')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'video_encode_type', '视频编码类型', '视频编码类型,1:mJpg,2:H264,4:H265,8:SVAC,16:SVAC3')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'frame_rate', '帧率', '帧率')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'bitrate', '码率', '码率，Kbps，可选')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'capture_stream_id', '采集码流ID（media_typ', '采集码流ID（media_type==0 视频查询时生效）')),
  mk(MOD_IMAGE.id, 'prop', 'ro', C('int', 'encode_stream_id', '编码码流ID（media_typ', '编码码流ID（media_type==0 视频查询时生效）')),
  mk(MOD_IMAGE.id, 'prop', 'rw', C('int', 'media_type', '流类型', '流类型：0.视频；1.音频；')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'micphone_enable', 'micphone_enable', '0.关闭拾音；1.拾音；')),
  mk(MOD_AUDIO.id, 'prop', 'ro', C('int', 'volumn_ability', '是否支持音量调节', '是否支持音量调节，0:不支持，1:支持')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'volumn', '音量', '音量：1. 最小音量；100. 最大音量；')),
  mk(MOD_AUDIO.id, 'prop', 'ro', C('int', 'audio_encode_ability', '支持的编码类型', '支持的编码类型，采用掩码形式：1: pcm, 2: G711A, 4: g711u, 8: AAC, 16: MP3，3')),
  mk(MOD_AUDIO.id, 'prop', 'ro', C('int', 'nr_ability', '降噪能力', '降噪能力;0.不支持；1.支持;')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'nr_level', '噪声抑制等级', '噪声抑制等级，1.低；2.中；3.高；')),
  mk(MOD_AUDIO.id, 'prop', 'ro', C('int', 'aec_ability', '回音消除能力', '回音消除能力；0.不支持；1.支持;')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'aec_enable', '回音消除是否开启', '回音消除是否开启；0.关闭；1.开启；')),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'volumn', '音量', '音量：1. 最小音量；100. 最大音量；')),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'micphone_enable', 'micphone_enable', '0.关闭；1.开启；')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'audio_encode_type', '音频编码类型', '音频编码类型,1:pcm,2:G711A,4:G711U,8:AAC,16:MP3,32:OPUS')),
  mk(MOD_AUDIO.id, 'prop', 'ro', C('int', 'sample_rate', '采样率', '采样率')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'channel_num', '声道数', '声道数')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'depth', '位深', '位深')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'speaker_enable', 'speaker_enable', '0.关闭播放；1.播放；')),
  mk(MOD_AUDIO.id, 'prop', 'ro', C('int', 'volumn_ability', '是否支持音量调节', '是否支持音量调节，0:不支持，1:支持')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'volumn', '音量', '音量：1. 最小音量；100. 最大音量；')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'audio_encode_ablility', '支持解码的音频编码类型', '支持解码的音频编码类型，采用掩码形式：1: pcm, 2: G711A, 4: g711u, 8: AAC, 16: M')),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'volumn', '音量', '音量：1. 最小音量；100. 最大音量；')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'support_sound_file_format', '支持的语音文件格式', '支持的语音文件格式，多种采用掩码表示，1: pcm, 2: G711A, 4: g711u, 8: AAC, 16: M')),
  mk(MOD_AUDIO.id, 'prop', 'ro', C('int', 'audio_upload_ability', '支持自定义语音文件上传', '支持自定义语音文件上传，0.不支持；1.支持；')),
  mk(MOD_AUDIO.id, 'prop', 'ro', C('int', 'tts_ability', '支持tts语音', '支持tts语音，0.不支持；1.支持；')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'max_audio_size', '最大语音文件大小', '最大语音文件大小；')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('int', 'max_sound_size', '最大语音文件数量', '最大语音文件数量')),
  mk(MOD_AUDIO.id, 'prop', 'rw', C('struct', 'sound_file_list', 'sound_file_list', '', { fields: [{ name: '语音文件ID', identifier: 'sound_file_id', dataType: 'string' }, { name: '语音文件名称', identifier: 'sound_file_name', dataType: 'string' }, { name: '语音文件类型', identifier: 'sound_file_type', dataType: 'int' }, { name: 'www.baidu.com/1.', identifier: 'sound_file_url', dataType: 'string' }, { name: '语音文件大小', identifier: 'sound_file_size', dataType: 'int' }, { name: 'tts文本消息', identifier: 'tts_text', dataType: 'string' }] })),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'sound_play_mode', 'sound_play_mode', '0.单次播放；1.loop循环播放')),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'sound_play_priority', '播报优先级', '播报优先级，优先级高的先播放，同优先级顺序播放；1～10，数值越高优先级越高', { min: 1, max: 10 })),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'sound_play_interval', '播报间隔', '播报间隔，单位毫秒，LOOP循环播放间隔；')),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'sound_play_count', '播报次数', '播报次数，LOOP循环播放次数；LOOP时有效')),
  mk(MOD_AUDIO.id, 'svc', '-', C('struct', 'sound_file_list', 'sound_file_list', '', { fields: [{ name: '语音文件ID', identifier: 'sound_file_id', dataType: 'string' }, { name: '语音文件名称', identifier: 'sound_file_name', dataType: 'string' }, { name: '语音文件类型', identifier: 'sound_file_type', dataType: 'int' }, { name: 'www.baidu.com/1.', identifier: 'sound_file_url', dataType: 'string' }, { name: '语音文件大小', identifier: 'sound_file_size', dataType: 'int' }, { name: 'tts文本消息', identifier: 'tts_text', dataType: 'string' }] })),
  mk(MOD_AUDIO.id, 'svc', '-', C('int', 'speaker_enable', 'speaker_enable', '0.关闭；1.打开；')),
  mk(MOD_DISPLAY.id, 'prop', 'ro', C('int', 'display_text_ability', '支持显示文字', '支持显示文字,0.不支持；1.支持；')),
  mk(MOD_DISPLAY.id, 'prop', 'ro', C('int', 'display_richtext_ability', '支持显示富文本', '支持显示富文本，0.不支持；1.支持；')),
  mk(MOD_DISPLAY.id, 'prop', 'ro', C('int', 'display_picture_ability', '支持显示图片', '支持显示图片，0.不支持；1.支持；')),
  mk(MOD_DISPLAY.id, 'prop', 'ro', C('int', 'display_video_ability', '支持显示视频', '支持显示视频，0.不支持；1.支持；')),
  mk(MOD_DISPLAY.id, 'prop', 'ro', C('int', 'url_download_ability', '支持URL下载', '支持URL下载，0.不支持；1.支持；')),
  mk(MOD_DISPLAY.id, 'prop', 'ro', C('int', 'display_screen_split_ability', '支持屏幕分屏显示', '支持屏幕分屏显示，0.不支持；1.支持；')),
  mk(MOD_DISPLAY.id, 'prop', 'rw', C('int', 'screen_width', '屏幕宽度', '屏幕宽度')),
  mk(MOD_DISPLAY.id, 'prop', 'rw', C('int', 'screen_height', '屏幕高度', '屏幕高度')),
  mk(MOD_DISPLAY.id, 'prop', 'rw', C('int', 'support_picture_format', '支持的图片格式', '支持的图片格式，采用掩码形式：1: png, 2: jpg, 4: bmp, 8: gif, 16: webp')),
  mk(MOD_DISPLAY.id, 'prop', 'rw', C('int', 'support_video_encode_format', '支持视频编码格式', '支持视频编码格式，采用掩码形式：1.mjpg;2.h.264;4.h.265;')),
  mk(MOD_DISPLAY.id, 'prop', 'rw', C('int', 'support_text_encode_format', '支持文字格式', '支持文字格式，采用掩码形式：1.UTF-8；2.GBK；4.ASCII；')),
  mk(MOD_DISPLAY.id, 'prop', 'rw', C('int', 'screen_saver_timeout', '进入屏保时长', '进入屏保时长，单位秒， 屏保即关闭屏幕展示；')),
  mk(MOD_DISPLAY.id, 'prop', 'rw', C('int', 'auto_play_mode', '自动播放模式', '自动播放模式，0.不自动播放；1.自动播放；')),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'display_content_type', '屏显内容类型', '屏显内容类型，0.文字；1.图片；2.视频；3.富文本；4.URL；5.实时流；')),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'display_mode', '屏显模式', '屏显模式，0.单次展示；1.循环展示；')),
  mk(MOD_DISPLAY.id, 'svc', '-', C('struct', 'display_content_data', '屏显内容数据', '屏显内容数据，不同类型数据格式不同')),
  mk(MOD_DISPLAY.id, 'svc', '-', C('struct', 'display_content_data', 'display_content_data', '', { fields: [{ name: '文字内容', identifier: 'text_content', dataType: 'string' }, { name: '文字编码格式', identifier: 'text_encode_format', dataType: 'int' }, { name: '文字颜色', identifier: 'text_color', dataType: 'string' }, { name: '文字大小', identifier: 'text_size', dataType: 'int' }, { name: 'text_position', identifier: 'text_position', dataType: 'struct' }, { name: 'x坐标', identifier: 'x', dataType: 'int' }, { name: 'y坐标', identifier: 'y', dataType: 'int' }] })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('struct', 'display_content_data', 'display_content_data', '', { fields: [{ name: '文字内容', identifier: 'text_content', dataType: 'string' }, { name: '文字编码格式', identifier: 'text_encode_format', dataType: 'int' }, { name: '文字颜色', identifier: 'text_color', dataType: 'string' }, { name: '文字大小', identifier: 'text_size', dataType: 'int' }, { name: 'text_position', identifier: 'text_position', dataType: 'struct' }, { name: 'x坐标', identifier: 'x', dataType: 'int' }, { name: 'y坐标', identifier: 'y', dataType: 'int' }] })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('struct', 'display_content_data', 'display_content_data', '', { fields: [{ name: '文字内容', identifier: 'text_content', dataType: 'string' }, { name: '文字编码格式', identifier: 'text_encode_format', dataType: 'int' }, { name: '文字颜色', identifier: 'text_color', dataType: 'string' }, { name: '文字大小', identifier: 'text_size', dataType: 'int' }, { name: 'text_position', identifier: 'text_position', dataType: 'struct' }, { name: 'x坐标', identifier: 'x', dataType: 'int' }, { name: 'y坐标', identifier: 'y', dataType: 'int' }] })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('struct', 'display_richtext_data', 'display_richtext_data', '', { fields: [{ name: '富文本内容', identifier: 'richtext_content', dataType: 'string' }, { name: '富文本编码格式', identifier: 'richtext_encode_format', dataType: 'int' }, { name: '富文本颜色', identifier: 'richtext_color', dataType: 'string' }, { name: '富文本大小', identifier: 'richtext_size', dataType: 'int' }, { name: 'richtext_position', identifier: 'richtext_position', dataType: 'struct' }, { name: 'x坐标', identifier: 'x', dataType: 'int' }, { name: 'y坐标', identifier: 'y', dataType: 'int' }] })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('struct', 'display_content_data', 'display_content_data', '', { fields: [{ name: '文字内容', identifier: 'text_content', dataType: 'string' }, { name: '文字编码格式', identifier: 'text_encode_format', dataType: 'int' }, { name: '文字颜色', identifier: 'text_color', dataType: 'string' }, { name: '文字大小', identifier: 'text_size', dataType: 'int' }, { name: 'text_position', identifier: 'text_position', dataType: 'struct' }, { name: 'x坐标', identifier: 'x', dataType: 'int' }, { name: 'y坐标', identifier: 'y', dataType: 'int' }] })),
  mk(MOD_DISPLAY.id, 'svc', '-', C('string', 'background_picture_url', '背景图URL', '背景图URL')),
  mk(MOD_DISPLAY.id, 'svc', '-', C('int', 'background_picture_format', '背景图格式', '背景图格式，1.png;2.jpg;4.bmp;8.gif;16.webp;')),
  mk(MOD_IOT.id, 'prop', 'ro', C('int', 'max_sub_device_count', '最大子设备数量', '最大子设备数量')),
  mk(MOD_IOT.id, 'prop', 'rw', C('struct', 'sub_device_list', 'sub_device_list', '', { fields: [{ name: '子设备ID', identifier: 'sub_device_id', dataType: 'string' }, { name: '子设备名称', identifier: 'sub_device_name', dataType: 'string' }, { name: '子设备类型', identifier: 'sub_device_type', dataType: 'string' }, { name: '子设备状态', identifier: 'sub_device_status', dataType: 'int' }] })),
  mk(MOD_IOT.id, 'svc', '-', C('int', 'sub_device_edit_type', '子设备编辑类型', '子设备编辑类型，0.删除；1.编辑；2.添加；')),
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_id', '子设备ID', '子设备ID')),
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_name', '子设备名称', '子设备名称')),
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_type', '子设备类型', '子设备类型，物模型定义中设备类型定义')),
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_id', '子设备ID', '子设备ID')),
  mk(MOD_IOT.id, 'svc', '-', C('struct', 'sub_device_property', '子设备属性', '子设备属性')),
  mk(MOD_IOT.id, 'svc', '-', C('string', 'sub_device_id', '子设备ID', '子设备ID')),
  mk(MOD_IOT.id, 'svc', '-', C('struct', 'sub_device_services', 'sub_device_services', '', { fields: [{ name: '服务ID', identifier: 'service_id', dataType: 'string' }, { name: '服务参数', identifier: 'service_params', dataType: 'struct' }] })),
  mk(MOD_TIME.id, 'prop', 'rw', C('string', 'time_zone', '时区', '时区，采用IANA时区数据库名称表示，如：Asia/Shanghai')),
  mk(MOD_TIME.id, 'prop', 'ro', C('int', 'timestamp', '从1970-01-01 00', '从1970-01-01 00:00:00.000开始计算到当前的UTC时间，8字节长度，毫秒级；')),
  mk(MOD_TIME.id, 'prop', 'rw', C('int', 'utc_offset', '当前UTC偏移时间（分钟）', '当前UTC偏移时间（分钟），+/-')),
  mk(MOD_TIME.id, 'prop', 'rw', C('int', 'dst_enable', '夏令时开关', '夏令时开关')),
  mk(MOD_TIME.id, 'prop', 'rw', C('int', 'dst_offset', '夏令时偏移时间（分钟）', '夏令时偏移时间（分钟），+/-')),
  mk(MOD_TIME.id, 'prop', 'rw', C('string', 'dst_start', '夏令时开始时间', '夏令时开始时间：M<month>.<week>.<weekday>/<time>，3月第2个周日 02:00')),
  mk(MOD_TIME.id, 'prop', 'rw', C('string', 'dst_end', '夏令时结束时间', '夏令时结束时间：M<month>.<week>.<weekday>/<time>，4月第1个周日 03:00')),
  mk(MOD_TIME.id, 'prop', 'ro', C('int', 'current_dst_status', '当前夏令时状态', '当前夏令时状态，0.非夏令时；1.夏令时；')),
  mk(MOD_TIME.id, 'svc', '-', C('int', 'timestamp', '从1970-01-01 00', '从1970-01-01 00:00:00.000开始计算到当前的UTC时间，8字节长度，毫秒级')),
  mk(MOD_STORAGE.id, 'prop', 'ro', C('int', 'storage_mount_status', '存储介质是否挂载可用', '存储介质是否挂载可用，0.不可用；1.可用；')),
  mk(MOD_STORAGE.id, 'prop', 'rw', C('int', 'storage_type', '存储介质类型', '存储介质类型：1.SDcard；2.EMMC；3.NAS；4.RAID；5.other')),
  mk(MOD_STORAGE.id, 'prop', 'ro', C('int', 'storage_total', '存储总容量', '存储总容量，单位K；')),
  mk(MOD_STORAGE.id, 'prop', 'ro', C('int', 'storage_used', '存储已使用容量', '存储已使用容量，单位K；')),
  mk(MOD_STORAGE.id, 'prop', 'rw', C('int', 'storage_free', '存储剩余容量', '存储剩余容量，单位K；')),
  mk(MOD_STORAGE.id, 'prop', 'rw', C('string', 'storage_file_system', '存储文件系统类型', '存储文件系统类型，如：ext4、fat32、ntfs等')),
  mk(MOD_STORAGE.id, 'prop', 'ro', C('int', 'storage_support_max_capacity', '设备支持最大存储容量', '设备支持最大存储容量')),
  mk(MOD_STORAGE.id, 'prop', 'rw', C('int', 'storage_erase_flag', '存储自动擦除覆盖标记。0.不自动', '存储自动擦除覆盖标记。0.不自动覆盖（满就停止写入）;1.自动覆盖（满就擦除覆盖）')),
  mk(MOD_STORAGE.id, 'prop', 'rw', C('int', 'storage_protect_flag', '存储保护标记。0.不保护（不限制', '存储保护标记。0.不保护（不限制写入）;1.保护（限制格式化、写操作）')),
  mk(MOD_STORAGE.id, 'svc', '-', C('string', 'storage_file_system', '格式化文件系统格式', '格式化文件系统格式，非必须，不传用系统默认；')),
  mk(MOD_STORAGE.id, 'svc', '-', C('int', 'quick_format_flag', '快速格式化标记', '快速格式化标记；0.常规；1.快速；')),
  mk(MOD_OTA.id, 'prop', 'ro', C('int', 'ota_ability', '设备是否支持OTA升级能力', '设备是否支持OTA升级能力：0.不支持；1.支持；')),
  mk(MOD_OTA.id, 'prop', 'rw', C('int', 'ota_support_mode', '设备支持的OTA升级模式', '设备支持的OTA升级模式：1.全量升级；2.增量升级；4.分区升级；8.断点续传升级；')),
  mk(MOD_OTA.id, 'prop', 'ro', C('string', 'firmware_version', '设备固件版本号', '设备固件版本号')),
  mk(MOD_OTA.id, 'prop', 'ro', C('string', 'sdk_version', 'SDK版本号', 'SDK版本号')),
  mk(MOD_OTA.id, 'prop', 'ro', C('string', 'api_version', 'API版本号', 'API版本号')),
  mk(MOD_OTA.id, 'prop', 'rw', C('array', 'module_versions', 'module_versions', '')),
  mk(MOD_OTA.id, 'svc', '-', C('int', 'ota_upgrade_type', 'OTA升级类型', 'OTA升级类型：0.暂停升级；1.全量升级；2.增量升级；3.分区升级；4.断点续传升级；')),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'firmware_new_version', '升级后的新固件版本号', '升级后的新固件版本号')),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'module', '分区升级模块名称', '分区升级模块名称（扁平字段；V1 不支持嵌套 object）')),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'version', '模块新版本号', '模块新版本号')),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'file_url', '升级文件URL', '升级文件URL')),
  mk(MOD_OTA.id, 'svc', '-', C('int', 'file_size', '升级文件大小', '升级文件大小，单位字节')),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'file_md5', '升级文件MD5值', '升级文件MD5值')),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'public_key', '升级文件下载需要有公钥加密下载', '升级文件下载需要有公钥加密下载，解密下载文件；')),
  mk(MOD_OTA.id, 'svc', '-', C('string', 'signature', '签名', '签名，固件提供方需要有签名验签方可使用；')),
  mk(MOD_OTA.id, 'evt', '-', C('int', 'event_type_id', '事件类型ID', '事件类型ID，平台统一定义，推送查询描述')),
  mk(MOD_OTA.id, 'evt', '-', C('string', 'module', '升级模块', '升级模块，空表示设备整机固件')),
  mk(MOD_OTA.id, 'evt', '-', C('int', 'result', '升级结果', '升级结果：0.失败；1.成功；')),
  mk(MOD_OTA.id, 'evt', '-', C('int', 'reason', '失败原因码', '失败原因码')),
  mk(MOD_OTA.id, 'evt', '-', C('string', 'version', '升级后的新版本号', '升级后的新版本号')),
  mk(MOD_POWER.id, 'prop', 'ro', C('int', 'power_source', '当前供电来源', '当前供电来源：0.AC/DC；1.POE; 2.UPS;3.battery；4.SOLAR；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'input_voltage', '输入电压', '输入电压：单位V；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'input_current', '输入电流', '输入电流：单位A；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'output_voltage', '输出电压', '输出电压：单位V；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'output_current', '输出电流', '输出电流：单位A；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('int', 'power_on_time', 'UTC时间戳', 'UTC时间戳；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('int', 'battery_present', '电池存在标记', '电池存在标记：0.不存在；1.存在；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('int', 'battery_type', 'battery_type', '0.不能充电电池；1.可充电电池；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('int', 'battery_capacity', '电池设计电量', '电池设计电量，单位mAh；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('int', 'battery_full_capacity', '电池满充电量', '电池满充电量，单位mAh 计算电池健康度；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('int', 'battery_remain_capacity', '电池剩余电量', '电池剩余电量，单位mAh')),
  mk(MOD_POWER.id, 'prop', 'rw', C('int', 'battery_lower_threshold', '低电量告警', '低电量告警，剩余20%告警')),
  mk(MOD_POWER.id, 'prop', 'rw', C('int', 'battery_critical_threshold', '严重低电量告警', '严重低电量告警，剩余10%告警')),
  mk(MOD_POWER.id, 'prop', 'rw', C('int', 'battery_shutdown_threshold', '关机阈值', '关机阈值，剩余5%')),
  mk(MOD_POWER.id, 'prop', 'ro', C('int', 'charge_status', '充电状态', '充电状态：0.未充电；1.充电中；2.充满；3.涓流；4.未知状态')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'charge_valtage', '充电电压', '充电电压，单位V')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'charge_current', '充电电流', '充电电流，单位A')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'charge_power', '充电功率', '充电功率，单位W')),
  mk(MOD_POWER.id, 'prop', 'ro', C('int', 'solar_present', '太阳能板存在标记', '太阳能板存在标记：0.不存在；1.存在；')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'solar_valtage', '太阳能板电压', '太阳能板电压，单位：V')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'solar_current', '太阳能板电流', '太阳能板电流，单位：A')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'solar_power', '太阳能板功率', '太阳能板功率，单位：W')),
  mk(MOD_POWER.id, 'prop', 'ro', C('double', 'solar_radiance', '光照强度', '光照强度，单位：W/平米')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('array', 'network_ability', '设备支持的网络能力列表', '设备支持的网络能力列表，1.Ethernet（有线）；2.WIFI；3.Cellular(蜂窝网络3G、4G、5G、 N')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'network_type', '当前正在用的网络类型', '当前正在用的网络类型,0.表示没有网络连接；1.Ethernet（有线）；2.WIFI；3.Cellular(蜂窝网络3')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('int', 'eth_status', '以太网状态', '以太网状态：0.未连接；1.已连接；')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('string', 'eth_mac', '以太网MAC地址', '以太网MAC地址')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('string', 'eth_ip', '以太网IP地址', '以太网IP地址')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'eth_netmask', '以太网子网掩码', '以太网子网掩码')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'eth_gateway', '以太网网关', '以太网网关')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'eth_dns', '以太网DNS服务器', '以太网DNS服务器')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'eth_dns2', '以太网DNS服务器2', '以太网DNS服务器2')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'eth_dhcp_enable', '以太网DHCP开关', '以太网DHCP开关：0.关闭；1.开启；')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('int', 'wifi_status', 'WIFI状态', 'WIFI状态：0.未连接；1.已连接；')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'wifi_mode', 'WIFI模式', 'WIFI模式：1.station；2.ap；3.station+ap；')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'wifi_single_strength', 'WIFI信号强度', 'WIFI信号强度，单位dBm')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'wifi_security_type', 'WIFI安全类型', 'WIFI安全类型：0.无安全；1.WEP；2.WPA-PSK；3.WPA2-PSK；4.WPA-WPA2-PSK；5.W')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_ssid', 'WIFI SSID', 'WIFI SSID，station模式下配置的SSID；')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_password', 'SSID的WIFI密码', 'SSID的WIFI密码，连接路由器用；')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_ap_ssid', 'WIFI BSSID', 'WIFI BSSID，AP模式下的SSID；')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_ap_password', 'WIFI BSSID密码', 'WIFI BSSID密码,AP连接的密码')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('string', 'wifi_mac', 'WIFI MAC地址', 'WIFI MAC地址')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('string', 'wifi_ip', 'WIFI IP地址', 'WIFI IP地址')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_netmask', 'WIFI子网掩码', 'WIFI子网掩码')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_gateway', 'WIFI网关', 'WIFI网关')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_dns', 'WIFI DNS服务器', 'WIFI DNS服务器')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'wifi_dns2', 'WIFI DNS服务器2', 'WIFI DNS服务器2')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'wifi_dhcp_enable', 'WIFI DHCP开关', 'WIFI DHCP开关：0.关闭；1.开启；')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'wifi_band', 'WIFI频段', 'WIFI频段：0.2.4G；1.5.8G；2.6G；3.60G；4.60G+；5.other')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'wifi_channel', 'WIFI信道', 'WIFI信道：1-13')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('int', 'bluetooth_status', '蓝牙状态', '蓝牙状态：0.未连接；1.已连接；')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'bluetooth_name', '蓝牙名称', '蓝牙名称；')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('string', 'bluetooth_mac', '蓝牙MAC地址', '蓝牙MAC地址')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('int', 'bluetooth_version', '蓝牙版本', '蓝牙版本：ENUM：1.4.0；2.4.2；3.5.0；4.5.1；')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'bluetooth_mode', '蓝牙模式', '蓝牙模式：ENUM：1.ble；2.classic；3.dual；')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('int', 'cellular_status', '蜂窝网络状态', '蜂窝网络状态：0.未连接；1.已连接；')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'cellular_type', '蜂窝网络类型', '蜂窝网络类型：0.unknown；1.2G；2.3G；3.4G Cat1；4.4G Cat4; 5.5G；6.NBIot')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'cellular_single_strength', '蜂窝网络信号强度', '蜂窝网络信号强度，单位dBm')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('string', 'cellular_module', '4G模块型号', '4G模块型号')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('string', 'cellular_imei', '4G模组IMEI号', '4G模组IMEI号')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('array', 'cellular_band', '支持的4G频段', '支持的4G频段，如：["B1","B3","B8","B41"]')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('int', 'cellular_slot_count', 'SIM卡槽数量', 'SIM卡槽数量')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('int', 'cellular_active_slot_id', '当前工作的卡槽', '当前工作的卡槽')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('struct', 'cellular_slot_infos', 'cellular_slot_infos', '', { fields: [{ name: '卡槽序号ID', identifier: 'slot_id', dataType: 'int' }, { name: '卡槽状态', identifier: 'slot_status', dataType: 'int' }, { name: '卡槽类型', identifier: 'slot_type', dataType: 'int' }, { name: '卡槽优先级', identifier: 'slot_priority', dataType: 'int' }, { name: 'eSIM种子卡配置信息', identifier: 'esim_boot_profile_info', dataType: 'string' }, { name: 'SIM卡ICCID', identifier: 'sim_iccid', dataType: 'string' }, { name: 'SIM卡IMSI', identifier: 'sim_imsi', dataType: 'string' }, { name: 'SIM卡MSISDN', identifier: 'sim_msisdn', dataType: 'string' }, { name: 'SIM卡运营商名称', identifier: 'sim_operator_name', dataType: 'string' }, { name: 'SIM卡PLMN', identifier: 'sim_plmn', dataType: 'string' }, { name: 'SIM卡MCCMNC', identifier: 'sim_mccmnc', dataType: 'string' }, { name: 'SIM卡APN信息', identifier: 'sim_apn_info', dataType: 'string' }, { name: 'SIM卡锁定状态', identifier: 'sim_lock_status', dataType: 'int' }] })),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('int', 'nat_type', '本地NAT类型', '本地NAT类型：0.未知；1.公网独立IP；2.锥形(映射与目的无关)；3.锥形(映射与目的地址相关)；4.对称型；')),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'wifi_mode', 'WIFI模式', 'WIFI模式：1.station；2.ap；3.station+ap；')),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'wifi_security_type', 'WIFI安全类型', 'WIFI安全类型：0.无安全；1.WEP；2.WPA-PSK；3.WPA2-PSK；4.WPA-WPA2-PSK；5.W')),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'wifi_ssid', 'WIFI SSID', 'WIFI SSID，station模式下配置的SSID；')),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'wifi_password', 'SSID的WIFI密码', 'SSID的WIFI密码，连接路由器用；')),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'wifi_ap_ssid', 'AP模式下的SSID', 'AP模式下的SSID；若是station模式，则无此参数')),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'wifi_ap_password', 'AP连接的密码', 'AP连接的密码，若是station模式，则无此参数')),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'wifi_channel', 'WIFI信道', 'WIFI信道：1-13，非必须，不传用系统默认；')),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'slot_id', '卡槽序号ID', '卡槽序号ID，从0开始')),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'slot_id', '卡槽序号ID', '卡槽序号ID，从0开始')),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'apn_info', 'SIM卡APN信息', 'SIM卡APN信息')),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'slot_id', '卡槽序号ID', '卡槽序号ID，从0开始')),
  mk(MOD_NETWORK.id, 'svc', '-', C('string', 'esim_profile_info', 'eSIM种子卡配置信息', 'eSIM种子卡配置信息,包含ICCID、IMEI、APN等关键信息')),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'network_type', '当前正在用的网络类型', '当前正在用的网络类型,0.表示没有网络连接；1.Ethernet（有线）；2.WIFI；3.Cellular(蜂窝网络3')),
  mk(MOD_NETWORK.id, 'prop', 'ro', C('int', 'wifi_count', 'WIFI列表数量', 'WIFI列表数量')),
  mk(MOD_NETWORK.id, 'prop', 'rw', C('struct', 'wifi_list', 'wifi_list', '', { fields: [{ name: 'WIFI SSID', identifier: 'ssid', dataType: 'string' }, { name: 'WIFI信号强度', identifier: 'single_strength', dataType: 'int' }, { name: 'WIFI频段', identifier: 'band', dataType: 'int' }, { name: 'WIFI信道', identifier: 'channel', dataType: 'int' }, { name: 'WIFI安全类型', identifier: 'security_type', dataType: 'int' }] })),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'scan_filter_flag', '搜索过滤标记', '搜索过滤标记：0.不过滤；1.过滤；过滤SSID名称中为设备热点的WIFI')),
  mk(MOD_NETWORK.id, 'svc', '-', C('int', 'scan_time', '扫描时间长度', '扫描时间长度，单位秒，扫描10秒确定结果，若扫描时间过短，则可能无法获取到WIFI列表；')),
  mk(MOD_RECORD.id, 'prop', 'ro', C('int', 'record_stream_count', 'record_stream_count', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('array', 'record_stream_list', 'record_stream_list', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('struct', 'record_switch', 'record_switch', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'record_type', 'record_type', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'event_record_sec', 'event_record_sec', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'pre_record_sec', 'pre_record_sec', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('struct', 'lifecycle', 'lifecycle', '', { fields: [{ name: 'video_days', identifier: 'video_days', dataType: 'int' }, { name: 'event_days', identifier: 'event_days', dataType: 'int' }, { name: 'overwrite_enable', identifier: 'overwrite_enable', dataType: 'int' }, { name: 'space_watermark', identifier: 'space_watermark', dataType: 'int' }] })),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'picture_enable', 'picture_enable', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'picture_days', 'picture_days', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('string', 'picture_format', 'picture_format', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'timing_period_sec', 'timing_period_sec', '')),
  mk(MOD_RECORD.id, 'prop', 'ro', C('int', 'record_stream_count', 'record_stream_count', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('array', 'record_stream_list', 'record_stream_list', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'record_type', 'record_type', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'storage_days', 'storage_days', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'event_record_sec', 'event_record_sec', '')),
  mk(MOD_RECORD.id, 'prop', 'ro', C('int', 'local_record_status', 'local_record_status', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'record_error_code', 'record_error_code', '')),
  mk(MOD_RECORD.id, 'prop', 'ro', C('int', 'cloud_record_status', 'cloud_record_status', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'cloud_record_error_code', 'cloud_record_error_code', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_mode', 'record_mode', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_streamid', 'record_streamid', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_data_format', 'record_data_format', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_data_interval', 'record_data_interval', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'pre_record_time', 'pre_record_time', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'record_duration', 'record_duration', '')),
  mk(MOD_RECORD.id, 'policy', '-', C('int', 'policy_count', 'policy_count', '')),
  mk(MOD_RECORD.id, 'policy', '-', C('struct', 'policy_list', 'policy_list', '', { fields: [{ name: 'policy_id', identifier: 'policy_id', dataType: 'string' }, { name: 'policy_type', identifier: 'policy_type', dataType: 'string' }, { name: 'policy_name', identifier: 'policy_name', dataType: 'string' }, { name: 'policy_enable', identifier: 'policy_enable', dataType: 'int' }, { name: 'policy_priority', identifier: 'policy_priority', dataType: 'int' }, { name: 'policy_schedule', identifier: 'policy_schedule', dataType: 'struct' }, { name: 'schedule_count', identifier: 'schedule_count', dataType: 'int' }, { name: 'schedule_list', identifier: 'schedule_list', dataType: 'array' }, { name: 'schedule_id', identifier: 'schedule_id', dataType: 'int' }, { name: 'schedule_name', identifier: 'schedule_name', dataType: 'string' }, { name: 'schedule_type', identifier: 'schedule_type', dataType: 'int' }, { name: 'schedule_enable', identifier: 'schedule_enable', dataType: 'int' }, { name: 'schedule_weekday', identifier: 'schedule_weekday', dataType: 'int' }, { name: 'schedule_starttime', identifier: 'schedule_starttime', dataType: 'int' }, { name: 'schedule_endtime', identifier: 'schedule_endtime', dataType: 'int' }, { name: 'policy_condition', identifier: 'policy_condition', dataType: 'struct' }, { name: 'logic', identifier: 'logic', dataType: 'int' }, { name: 'events', identifier: 'events', dataType: 'array' }, { name: 'policy_services', identifier: 'policy_services', dataType: 'array' }, { name: 'service_id', identifier: 'service_id', dataType: 'string' }, { name: 'service_param', identifier: 'service_param', dataType: 'struct' }, { name: 'record', identifier: 'record', dataType: 'int' }, { name: 'pre_record_sec', identifier: 'pre_record_sec', dataType: 'int' }, { name: 'record_duration', identifier: 'record_duration', dataType: 'int' }, { name: 'post_record_sec', identifier: 'post_record_sec', dataType: 'int' }, { name: 'record_interval', identifier: 'record_interval', dataType: 'int' }] })),
  mk(MOD_RECORD.id, 'policy', '-', C('int', 'policy_count', 'policy_count', '')),
  mk(MOD_RECORD.id, 'policy', '-', C('struct', 'policy_list', 'policy_list', '', { fields: [{ name: 'policy_id', identifier: 'policy_id', dataType: 'string' }, { name: 'policy_type', identifier: 'policy_type', dataType: 'string' }, { name: 'policy_name', identifier: 'policy_name', dataType: 'string' }, { name: 'policy_enable', identifier: 'policy_enable', dataType: 'int' }, { name: 'policy_priority', identifier: 'policy_priority', dataType: 'int' }, { name: 'policy_schedule', identifier: 'policy_schedule', dataType: 'struct' }, { name: 'policy_condition', identifier: 'policy_condition', dataType: 'struct' }, { name: 'logic', identifier: 'logic', dataType: 'int' }, { name: 'events', identifier: 'events', dataType: 'array' }, { name: 'policy_services', identifier: 'policy_services', dataType: 'array' }, { name: 'service_id', identifier: 'service_id', dataType: 'string' }, { name: 'service_param', identifier: 'service_param', dataType: 'struct' }, { name: 'record', identifier: 'record', dataType: 'int' }, { name: 'pre_record_sec', identifier: 'pre_record_sec', dataType: 'int' }, { name: 'record_duration', identifier: 'record_duration', dataType: 'int' }, { name: 'post_record_sec', identifier: 'post_record_sec', dataType: 'int' }, { name: 'record_interval', identifier: 'record_interval', dataType: 'int' }] })),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'picture_enable', 'picture_enable', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('int', 'storage_days', 'storage_days', '')),
  mk(MOD_RECORD.id, 'prop', 'rw', C('string', 'picture_format', 'picture_format', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'nvr_channel_num', 'nvr_channel_num', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'snap_type', 'snap_type', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('string', 'picture_format', 'picture_format', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'picture_count', 'picture_count', '')),
  mk(MOD_RECORD.id, 'svc', '-', C('int', 'picture_interval', 'picture_interval', '')),
  mk(MOD_WORKMODE.id, 'prop', 'ro', C('int', 'work_mode_count', '支持的工作模式数量', '支持的工作模式数量；')),
  mk(MOD_WORKMODE.id, 'prop', 'ro', C('int', 'current_work_mode_id', '当前工作模式ID', '当前工作模式ID')),
  mk(MOD_WORKMODE.id, 'prop', 'rw', C('struct', 'work_mode_list', 'work_mode_list', '', { fields: [{ name: '工作模式ID', identifier: 'work_mode_id', dataType: 'int' }, { name: '工作模式名称', identifier: 'work_mode_name', dataType: 'string' }, { name: 'work_mode_param', identifier: 'work_mode_param', dataType: 'struct' }] })),
  mk(MOD_WORKMODE.id, 'svc', '-', C('int', 'work_mode_id', '切换后的工作模式ID', '切换后的工作模式ID')),
  mk(MOD_WORKMODE.id, 'policy', '-', C('string', 'policy_id', '策略ID', '策略ID，编号；')),
  mk(MOD_WORKMODE.id, 'policy', '-', C('string', 'policy_type', '策略类型', '策略类型；')),
  mk(MOD_WORKMODE.id, 'policy', '-', C('string', 'policy_name', '策略名称', '策略名称')),
  mk(MOD_WORKMODE.id, 'policy', '-', C('int', 'policy_enable', 'policy_enable', '0.禁用；1.使用')),
  mk(MOD_WORKMODE.id, 'policy', '-', C('int', 'policy_priority', '策略优先级', '策略优先级，1～10，数值越低，优先级越高', { min: 1, max: 10 })),
  mk(MOD_WORKMODE.id, 'policy', '-', C('struct', 'policy_condition', 'policy_condition', '', { fields: [{ name: 'logic', identifier: 'logic', dataType: 'int' }, { name: 'events', identifier: 'events', dataType: 'array' }] })),
  mk(MOD_WORKMODE.id, 'policy', '-', C('struct', 'policy_services', '策略动作', '策略动作，一个策略可以有多个动作，每个动作是某个能力项的操作；', { fields: [{ name: 'Service能力项ID', identifier: 'service_key', dataType: 'string' }, { name: 'service_param', identifier: 'service_param', dataType: 'struct' }, { name: 'work_mode_id', identifier: 'work_mode_id', dataType: 'int' }] })),
  mk(MOD_LIGHT.id, 'prop', 'ro', C('int', 'light_count', '设备拥有的灯光数量', '设备拥有的灯光数量')),
  mk(MOD_LIGHT.id, 'prop', 'rw', C('struct', 'light_list', 'light_list', '', { fields: [{ name: '灯光ID', identifier: 'light_id', dataType: 'int' }, { name: '灯光名称', identifier: 'light_name', dataType: 'string' }, { name: '灯光是否启用', identifier: 'light_enable', dataType: 'int' }, { name: '灯光类型', identifier: 'light_type', dataType: 'int' }, { name: '支持的灯光模式', identifier: 'light_mode_ability', dataType: 'int' }, { name: '灯光模式', identifier: 'light_mode', dataType: 'int' }, { name: '持续时长', identifier: 'light_duration', dataType: 'int' }, { name: '亮度值', identifier: 'brightness', dataType: 'int' }, { name: '色温值', identifier: 'colortemp', dataType: 'int' }, { name: 'color_mode', identifier: 'color_mode', dataType: 'int' }, { name: 'RGB颜色值', identifier: 'color_rgb', dataType: 'string' }, { name: 'HSV颜色值', identifier: 'color_hsv', dataType: 'string' }, { name: '闪烁次数', identifier: 'flash_count', dataType: 'int' }, { name: '闪烁间隔', identifier: 'flash_interval', dataType: 'int' }] })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'light_id', '要切换的灯光ID', '要切换的灯光ID')),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'light_enable', '灯光是否启用', '灯光是否启用：0.不启用；1.启用')),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'light_mode', '灯光模式', '灯光模式：0.off:关闭；1.on:打开；2.auto:自动（例如红外、双光、警告灯自动触发时打开/关闭）；3.bre')),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'light_duration', '持续时长', '持续时长，单位秒；0为持续；')),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'brightness', '亮度值', '亮度值，0～100；100最亮', { min: 0, max: 100 })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'colortemp', '色温值', '色温值,单位K，2700～6500K', { min: 2700, max: 6500 })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'color_mode', 'color_mode', '0.没有颜色；1.RGB；2.HSV；3.CCT；4.Preset;')),
  mk(MOD_LIGHT.id, 'svc', '-', C('string', 'color_rgb', 'RGB颜色值', 'RGB颜色值，RRGGBB格式，RR为红色值，GG为绿色值，BB为蓝色值，00～FF；')),
  mk(MOD_LIGHT.id, 'svc', '-', C('string', 'color_hsv', 'HSV颜色值', 'HSV颜色值，HH为色调值，SS为饱和度值，VV为明度值，00～FF；')),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'flash_count', '闪烁次数', '闪烁次数，0为无限次；')),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'flash_interval', '闪烁间隔', '闪烁间隔，单位秒；')),
  mk(MOD_LIGHT.id, 'prop', 'ro', C('int', 'light_mode_count', '支持的灯光模式数量', '支持的灯光模式数量')),
  mk(MOD_LIGHT.id, 'prop', 'rw', C('struct', 'light_mode_list', 'light_mode_list', '', { fields: [{ name: '灯光模式ID', identifier: 'light_mode_id', dataType: 'int' }, { name: '灯光模式名称', identifier: 'light_mode_name', dataType: 'string' }, { name: 'light_mode_param', identifier: 'light_mode_param', dataType: 'struct' }, { name: 'light_switch_services', identifier: 'light_switch_services', dataType: 'array' }, { name: '要切换的灯光ID', identifier: 'light_id', dataType: 'int' }, { name: '灯光是否启用', identifier: 'light_enable', dataType: 'int' }, { name: '灯光模式', identifier: 'light_mode', dataType: 'int' }, { name: '持续时长', identifier: 'light_duration', dataType: 'int' }, { name: '亮度值', identifier: 'brightness', dataType: 'int' }, { name: '色温值', identifier: 'colortemp', dataType: 'int' }, { name: 'color_mode', identifier: 'color_mode', dataType: 'int' }, { name: 'RGB颜色值', identifier: 'color_rgb', dataType: 'string' }, { name: 'HSV颜色值', identifier: 'color_hsv', dataType: 'string' }, { name: '闪烁次数', identifier: 'flash_count', dataType: 'int' }, { name: '闪烁间隔', identifier: 'flash_interval', dataType: 'int' }] })),
  mk(MOD_LIGHT.id, 'svc', '-', C('int', 'light_mode_id', '要切换的灯光模式ID', '要切换的灯光模式ID')),
  mk(MOD_ALGO.id, 'prop', 'ro', C('int', 'algorithm_count', '支持的算法能力数量', '支持的算法能力数量')),
  mk(MOD_ALGO.id, 'prop', 'ro', C('int', 'algorithm_running_count', '支持同时工作的算法数', '支持同时工作的算法数；')),
  mk(MOD_ALGO.id, 'prop', 'ro', C('int', 'algorithm_enabled_count', '当前启用的算法数', '当前启用的算法数；')),
  mk(MOD_ALGO.id, 'prop', 'rw', C('struct', 'algorithm_list', 'algorithm_list', '', { fields: [{ name: '算法ID', identifier: 'algorithm_id', dataType: 'string' }, { name: '算法名称', identifier: 'algorithm_name', dataType: 'string' }, { name: '算法是否可用', identifier: 'algorithm_enable', dataType: 'int' }, { name: '算法是否运行中', identifier: 'algorithm_running', dataType: 'int' }, { name: '算法敏感度', identifier: 'algorithm_sensitive', dataType: 'int' }, { name: '分析间隔', identifier: 'analysis_interval', dataType: 'int' }, { name: '算法类型', identifier: 'algorithm_type', dataType: 'int' }] })),
  mk(MOD_ALGO.id, 'svc', '-', C('string', 'algorithm_id', '算法ID', '算法ID,平台定义，唯一；')),
  mk(MOD_ALGO.id, 'svc', '-', C('int', 'algorithm_enable', '算法开关', '算法开关：0.关/1.开；')),
  mk(MOD_ALGO.id, 'svc', '-', C('string', 'algorithm_id', '算法ID', '算法ID,平台定义，唯一；')),
  mk(MOD_ALGO.id, 'svc', '-', C('int', 'algorithm_running', '算法运行开关', '算法运行开关：0.关/1.开；')),
  mk(MOD_GPS.id, 'prop', 'rw', C('int', 'gps_enbale', 'GPS开关', 'GPS开关：0.关；1.开；')),
  mk(MOD_GPS.id, 'prop', 'ro', C('int', 'gps_status', 'GPS状态', 'GPS状态,ENUM, 0.OFF关闭；1.FIXED已定位；2.FIXING定位中；3.LOST信号丢失；')),
  mk(MOD_GPS.id, 'prop', 'ro', C('double', 'gps_latitude', 'GPS纬度', 'GPS纬度,单位度， -90.0～90.0', { min: 0, max: 90 })),
  mk(MOD_GPS.id, 'prop', 'ro', C('double', 'gps_longitude', 'GPS经度', 'GPS经度,单位度， -180.0～180.0', { min: 0, max: 180 })),
  mk(MOD_GPS.id, 'prop', 'ro', C('double', 'gps_altitude', 'GPS海拔高度', 'GPS海拔高度,单位米， -500～10000', { min: 500, max: 10000 })),
  mk(MOD_GPS.id, 'prop', 'ro', C('double', 'gps_speed', 'GPS速度', 'GPS速度,单位km/h，0.0 ～500.0', { min: 0, max: 500 })),
  mk(MOD_GPS.id, 'prop', 'ro', C('double', 'gps_direction', 'GPS方向', 'GPS方向,单位度,0.0～359.9，正北为0度', { min: 0, max: 359 })),
  mk(MOD_GPS.id, 'prop', 'ro', C('int', 'gps_time', 'GPS时间', 'GPS时间,UTC毫秒时间戳；')),
  mk(MOD_GPS.id, 'prop', 'ro', C('double', 'gps_distance', 'GPS累计距离', 'GPS累计距离，单位米；每次汇报完清0.')),
  mk(MOD_GPS.id, 'prop', 'rw', C('string', 'report_mode', 'GPS信息上报模式', 'GPS信息上报模式，1.定时上报（设置上报间隔）；2.距离上报（设置上报距离）；3.混合上报（设置上报间隔和上报距离，两')),
  mk(MOD_GPS.id, 'prop', 'rw', C('int', 'report_interval', 'GPS信息上报间隔', 'GPS信息上报间隔，单位秒；')),
  mk(MOD_GPS.id, 'prop', 'rw', C('double', 'report_distance', 'GPS信息上报距离', 'GPS信息上报距离，单位米；')),
  mk(MOD_GPS.id, 'prop', 'ro', C('int', 'fence_count', '电子围栏数量', '电子围栏数量')),
  mk(MOD_GPS.id, 'prop', 'rw', C('struct', 'fence_list', 'fence_list', '', { fields: [{ name: '电子围栏ID', identifier: 'fence_id', dataType: 'int' }, { name: '电子围栏名称', identifier: 'fence_name', dataType: 'string' }, { name: '电子围栏是否启用', identifier: 'fence_enable', dataType: 'int' }, { name: '电子围栏类型', identifier: 'fence_type', dataType: 'int' }, { name: '电子围栏半径', identifier: 'fence_radius', dataType: 'double' }, { name: 'fence_center', identifier: 'fence_center', dataType: 'struct' }, { name: '电子围栏中心纬度', identifier: 'latitude', dataType: 'double' }, { name: '电子围栏中心经度', identifier: 'longitude', dataType: 'double' }, { name: 'fence_points', identifier: 'fence_points', dataType: 'array' }] })),
  mk(MOD_GPS.id, 'svc', '-', C('int', 'gps_enable', 'GPS开关', 'GPS开关，1.开；0.关；')),
  mk(MOD_GPS.id, 'svc', '-', C('int', 'report_mode', 'GPS信息上报模式', 'GPS信息上报模式，1.定时上报（设置上报间隔）；2.距离上报（设置上报距离）；3.混合上报（设置上报间隔和上报距离，两')),
  mk(MOD_GPS.id, 'svc', '-', C('int', 'report_interval', 'GPS信息上报间隔', 'GPS信息上报间隔，单位秒；')),
  mk(MOD_GPS.id, 'svc', '-', C('double', 'report_distance', 'GPS信息上报距离', 'GPS信息上报距离，单位米；')),
  mk(MOD_GPS.id, 'svc', '-', C('int', 'fence_control', '电子围栏操作方法', '电子围栏操作方法：0.删除；1.新增；')),
  mk(MOD_GPS.id, 'svc', '-', C('array', 'fence_id', '需要删除的fence_id', '需要删除的fence_id，需要删除的电子围栏ID,不传删除所有，可以删除多个；')),
  mk(MOD_GPS.id, 'svc', '-', C('string', 'fence_name', 'fence_name', '')),
  mk(MOD_GPS.id, 'svc', '-', C('int', 'fence_type', '电子围栏类型', '电子围栏类型：0.圆形；1.多边形；')),
  mk(MOD_GPS.id, 'svc', '-', C('double', 'fence_radius', '电子围栏半径', '电子围栏半径，单位米；')),
  mk(MOD_GPS.id, 'svc', '-', C('struct', 'fence_center', 'fence_center', '', { fields: [{ name: '电子围栏中心纬度', identifier: 'latitude', dataType: 'double' }, { name: '电子围栏中心经度', identifier: 'longitude', dataType: 'double' }] })),
  mk(MOD_GPS.id, 'svc', '-', C('struct', 'fence_points', 'fence_points', '', { fields: [{ name: '电子围栏点纬度', identifier: 'latitude', dataType: 'double' }, { name: '电子围栏点经度', identifier: 'longitude', dataType: 'double' }] })),
  mk(MOD_SENSOR.id, 'prop', 'rw', C('int', 'gsensor_enable', 'GSensor开关', 'GSensor开关：0.关；1.开；')),
  mk(MOD_SENSOR.id, 'prop', 'ro', C('int', 'gsensor_status', 'gsensor_status', '0.OFF关闭；1.ON工作中；2.CALIBRATING校准中；3.ERROR错误')),
  mk(MOD_SENSOR.id, 'prop', 'ro', C('double', 'g_x', 'GSensor X轴加速度', 'GSensor X轴加速度，单位g')),
  mk(MOD_SENSOR.id, 'prop', 'ro', C('double', 'g_y', 'GSensor Y轴加速度', 'GSensor Y轴加速度，单位g')),
  mk(MOD_SENSOR.id, 'prop', 'ro', C('double', 'g_z', 'GSensor Z轴加速度', 'GSensor Z轴加速度，单位g')),
  mk(MOD_SENSOR.id, 'prop', 'ro', C('double', 'pitch', 'GSensor 俯仰角', 'GSensor 俯仰角，单位度')),
  mk(MOD_SENSOR.id, 'prop', 'ro', C('double', 'roll', 'GSensor 翻滚角', 'GSensor 翻滚角，单位度')),
  mk(MOD_SENSOR.id, 'prop', 'ro', C('double', 'vibration_level', 'GSensor震动强度', 'GSensor震动强度，单位：g, RMS计算值')),
  mk(MOD_SENSOR.id, 'prop', 'ro', C('double', 'range', 'GSensor量程范围', 'GSensor量程范围，单位：g, RMS计算值 ±2g，±4g，±8g，±16g')),
  mk(MOD_SENSOR.id, 'prop', 'rw', C('int', 'gsensor_sensitivity', '灵敏度', '灵敏度：1.LOW；2.MID；3.HIGH；')),
  mk(MOD_SENSOR.id, 'svc', '-', C('int', 'gsensor_enable', 'GSensor开关', 'GSensor开关：0.关；1.开；')),
  mk(MOD_SENSOR.id, 'svc', '-', C('int', 'gsensor_sensitivity', '灵敏度', '灵敏度：1.LOW；2.MID；3.HIGH；')),
  mk(MOD_DEV.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '离线', val: 109300 }, { name: '在线', val: 109301 }, { name: '休眠', val: 109302 }], defaultVal: '109300' })),
  mk(MOD_DEV.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '运动侦测', val: 100000 }, { name: '人形侦测', val: 100001 }, { name: '人脸侦测', val: 100015 }, { name: '入侵检测', val: 100017 }, { name: '车牌侦测', val: 100020 }, { name: '逗留侦测', val: 100021 }, { name: '声音侦测', val: 100400 }, { name: '低电量侦测', val: 101201 }, { name: '跌倒侦测', val: 102400 }, { name: '火焰侦测', val: 102500 }, { name: '哭声侦测', val: 102800 }, { name: '宠物侦测', val: 102900 }, { name: '区域闯入事件', val: 107900 }, { name: '区域离开事件', val: 108000 }, { name: '烟火侦测', val: 108200 }, { name: '车辆侦测', val: 108300 }, { name: '包裹检测', val: 110900 }, { name: '鸟类侦测', val: 200002 }, { name: '松鼠侦测', val: 200003 }, { name: '包裹侦测', val: 200006 }], defaultVal: '100000' })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '非机动车', val: 108600 }, { name: '电动车', val: 108601 }, { name: '自行车', val: 108602 }, { name: '车位占用', val: 108901 }], defaultVal: '108600' })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '逗留', val: 102901 }, { name: '拆家', val: 102902 }, { name: '喝水', val: 102903 }, { name: '进食', val: 102904 }, { name: '睡觉', val: 102905 }, { name: '屋内排便', val: 102906 }], defaultVal: '102901' })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '儿童检测', val: 109600 }, { name: '哭闹', val: 109601 }, { name: '外出', val: 109602 }, { name: '回家', val: 109603 }, { name: '摔倒', val: 109604 }, { name: '做作业', val: 109605 }, { name: '玩手机', val: 109606 }], defaultVal: '109600' })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '老人检测', val: 109700 }, { name: '外出', val: 109701 }, { name: '回家', val: 109702 }, { name: '摔倒', val: 109703 }], defaultVal: '109700' })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '火焰侦测', val: 102500 }, { name: '烟雾检测', val: 102600 }], defaultVal: '102500' })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '人员离岗', val: 107000 }, { name: '双人在岗', val: 107001 }], defaultVal: '107000' })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '进入', val: 109000 }, { name: '出去', val: 109001 }], defaultVal: '109000' })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_CALL.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '语音呼叫', val: 103700 }, { name: '语音加视频呼叫', val: 103701 }, { name: '挂断呼叫', val: 103702 }], defaultVal: '103700' })),
  mk(MOD_CALL.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_ALGO.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '鱼类检测', val: 111100 }, { name: '精彩瞬间', val: 111101 }], defaultVal: '111100' })),
  mk(MOD_ALGO.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_AROMA.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '缺液报警', val: 120001 }, { name: '喷头堵塞', val: 120002 }], defaultVal: '120001' })),
  mk(MOD_AROMA.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_METER.id, 'evt', '-', C('enum', 'event_type_id', '事件类型ID', '平台统一定义', { enumValues: [{ name: '欠压', val: 130001 }, { name: '过压', val: 130002 }, { name: '过流', val: 130003 }, { name: '漏电', val: 130004 }, { name: '停电', val: 130005 }, { name: '上电', val: 130006 }, { name: '开盖', val: 130007 }, { name: '余额不足', val: 130008 }, { name: '继电器跳闸', val: 130009 }], defaultVal: '130001' })),
  mk(MOD_METER.id, 'evt', '-', C('int', 'event_time', '事件时间', '发生时间，UTC 毫秒戳')),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'spray_enable', '香薰机开关', '香薰机开关：0.关；1.开；')),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'wake_switch', 'wake_switch', '0.关闭；1.开启；')),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'screen_swith', 'screen_swith', '0.关闭；1.开启；')),
  mk(MOD_AROMA.id, 'prop', 'ro', C('int', 'voice_state', '提示音状态', '提示音状态：0.关；1.开；')),
  mk(MOD_AROMA.id, 'prop', 'ro', C('int', 'spray_count', '喷头数量', '喷头数量；')),
  mk(MOD_AROMA.id, 'prop', 'ro', C('int', 'spray_id', '喷头ID', '喷头ID；')),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'spay_duration', '喷雾时长', '喷雾时长，单位秒；')),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'spray_interval', '喷雾间隔', '喷雾间隔，单位秒；')),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'spray_gear', '喷雾档位', '喷雾档位：1.浓香；2.淡香；3.清香；4.超淡香；5.超微香；6.超清香')),
  mk(MOD_AROMA.id, 'prop', 'rw', C('int', 'spray_mode', '喷雾模式', '喷雾模式：1.标准；2.自定义；')),
  mk(MOD_AROMA.id, 'svc', '-', C('int', 'spray_id', '喷头ID', '喷头ID；')),
  mk(MOD_AROMA.id, 'svc', '-', C('int', 'spay_duration', '喷雾时长', '喷雾时长，单位秒；')),
  mk(MOD_AROMA.id, 'svc', '-', C('int', 'spray_interval', '喷雾间隔', '喷雾间隔，单位秒；')),
  mk(MOD_AROMA.id, 'svc', '-', C('int', 'spray_gear', '喷雾档位', '喷雾档位：1.浓香；2.淡香；3.清香；4.超淡香；5.超微香；6.超清香')),
  mk(MOD_AROMA.id, 'svc', '-', C('int', 'spray_mode', '喷雾模式', '喷雾模式：1.标准；2.自定义；')),
  mk(MOD_AROMA.id, 'policy', '-', C('int', 'policy_count', 'policy_count', '')),
  mk(MOD_AROMA.id, 'policy', '-', C('struct', 'policy_list', 'policy_list', '', { fields: [{ name: 'policy_id', identifier: 'policy_id', dataType: 'string' }, { name: 'policy_type', identifier: 'policy_type', dataType: 'string' }, { name: 'policy_name', identifier: 'policy_name', dataType: 'string' }, { name: 'policy_enable', identifier: 'policy_enable', dataType: 'int' }, { name: 'policy_priority', identifier: 'policy_priority', dataType: 'int' }, { name: 'policy_schedule', identifier: 'policy_schedule', dataType: 'struct' }, { name: 'schedule_count', identifier: 'schedule_count', dataType: 'int' }, { name: 'schedule_list', identifier: 'schedule_list', dataType: 'array' }, { name: 'schedule_id', identifier: 'schedule_id', dataType: 'int' }, { name: 'schedule_name', identifier: 'schedule_name', dataType: 'string' }, { name: 'schedule_type', identifier: 'schedule_type', dataType: 'int' }, { name: 'schedule_enable', identifier: 'schedule_enable', dataType: 'int' }, { name: 'schedule_weekday', identifier: 'schedule_weekday', dataType: 'int' }, { name: 'schedule_starttime', identifier: 'schedule_starttime', dataType: 'int' }, { name: 'schedule_endtime', identifier: 'schedule_endtime', dataType: 'int' }, { name: 'policy_condition', identifier: 'policy_condition', dataType: 'struct' }, { name: 'logic', identifier: 'logic', dataType: 'int' }, { name: 'events', identifier: 'events', dataType: 'array' }, { name: 'policy_services', identifier: 'policy_services', dataType: 'array' }, { name: 'service_id', identifier: 'service_id', dataType: 'string' }, { name: 'service_param', identifier: 'service_param', dataType: 'struct' }, { name: 'record', identifier: 'record', dataType: 'int' }, { name: 'pre_record_sec', identifier: 'pre_record_sec', dataType: 'int' }, { name: 'record_duration', identifier: 'record_duration', dataType: 'int' }, { name: 'post_record_sec', identifier: 'post_record_sec', dataType: 'int' }, { name: 'record_interval', identifier: 'record_interval', dataType: 'int' }] })),
  mk(MOD_AROMA.id, 'policy', '-', C('int', 'schedule_count', '时间计划数量', '时间计划数量')),
  mk(MOD_AROMA.id, 'policy', '-', C('struct', 'schedule_list', 'schedule_list', '', { fields: [{ name: '计划ID', identifier: 'schedule_id', dataType: 'int' }, { name: '计划名称', identifier: 'schedule_name', dataType: 'string' }, { name: '0 单次', identifier: 'schedule_type', dataType: 'int' }, { name: '是否启用', identifier: 'schedule_enable', dataType: 'int' }, { name: '星期掩码', identifier: 'schedule_weekday', dataType: 'int' }, { name: '开始时间', identifier: 'schedule_starttime', dataType: 'int' }, { name: '结束时间', identifier: 'schedule_endtime', dataType: 'int' }, { name: '单次计划日期', identifier: 'schedule_date', dataType: 'string' }] })),
]

const initialCapItems = [
  { id: nextId(), moduleId: MOD_DEV.id, name: '设备属性能力项', identifier: 'DeviceProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['device_name', 'company_id', 'product_id', 'ctei', 'did', 'gid'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '采集码流属性定义能力项', identifier: 'CaptureStreamProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['capture_stream_count', 'capture_stream_param'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '编码码流属性定义能力项', identifier: 'EncodeStreamProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['capture_stream_id', 'encode_stream_id', 'video_encode_mode'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '镜头属性定义能力项', identifier: 'LensProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['lens_count', 'lens_param'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'P/T属性定义能力项', identifier: 'PTProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['pt_control_type', 'pt_ability', 'ptz_3d_position_ability', 'ptz_preset_ability', 'ptz_cruise_ability'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'PTZ 坐标属性', identifier: 'PTZCoordinateProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['coordinate', 'step_range', 'speed_range'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'PTZ 移动到坐标/预置位', identifier: 'PTZGotoPositionService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['preset_id', 'x', 'y', 'speed'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'PTZ 转动控制', identifier: 'PTZControlService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['direction', 'speed', 'steps_x', 'steps_y'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'PTZ 预置位管理', identifier: 'PTZPresetManageService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['op', 'preset_id', 'name', 'x', 'y', 'speed'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'PTZ 看守位管理', identifier: 'PTZGuardManageService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['op', 'preset_id', 'return_delay'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'PTZ 巡航位管理', identifier: 'PTZPatrolManageService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['op', 'patrol_id', 'points', 'dwell_time'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'PTZ 坐标系重置', identifier: 'PTZResetService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['lens_id'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '巡航服务定义', identifier: 'CruiseService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['cruise_id', 'cruise_interval'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'PTZ 状态事件', identifier: 'PTZStateEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'state', 'preset_id', 'x', 'y'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '图片采集通用功能属性能力项', identifier: 'ImageCommonProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['snap_ability', 'wdr_ability', 'wdr_mode', 'hdr_ability', 'hdr_mode', 'anti_flicker_ability', 'anti_flicker_mode', 'scan_frequery', 'region_sign_ability', 'privacy_mask_ability', 'custom_osd_ability', 'osd_show_ability'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: 'OSD水印属性定义能力项', identifier: 'OSDProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['capture_stream_id', 'osd_enable', 'osd_count', 'osd_list'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '隐私区域属性能力项', identifier: 'PrivacyMaskProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['privacy_mask_count', 'privacy_mask_list'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '抓图业务', identifier: 'RecordSnapshotService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['nvr_channel_num', 'snap_type', 'picture_format', 'picture_count', 'picture_interval'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '采集码流开关设置业务能力项', identifier: 'CaptureStreamSwitchService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['capture_stream_id', 'capture_stream_enable'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '视频流参数属性能力项', identifier: 'video_param', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['capture_stream_id', 'encode_stream_id', 'width', 'height', 'video_encode_type', 'frame_rate', 'bitrate'] },
  { id: nextId(), moduleId: MOD_IMAGE.id, name: '流参数查询业务能力项', identifier: 'query_media_param', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['capture_stream_id', 'encode_stream_id', 'media_type'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '麦克风参数定义能力项', identifier: 'MicrophoneProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['micphone_enable', 'volumn_ability', 'volumn', 'audio_encode_ability', 'nr_ability', 'nr_level', 'aec_ability', 'aec_enable'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '麦克风音量调节业务定义能力项', identifier: 'MicrophoneVolumnService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['volumn'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '麦克风采集业务关闭能力项', identifier: 'MicrophoneCloseService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['micphone_enable'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '音频流参数属性能力项', identifier: 'audio_param', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['audio_encode_type', 'sample_rate', 'channel_num', 'depth'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '扬声器参数定义能力项', identifier: 'SpeakerProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['speaker_enable', 'volumn_ability', 'volumn', 'audio_encode_ablility'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '扬声器音量调节业务定义能力项', identifier: 'SpeakerVolumnService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['volumn'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '设备自定义语音能力项', identifier: 'SoundFileProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['support_sound_file_format', 'audio_upload_ability', 'tts_ability', 'max_audio_size', 'max_sound_size', 'sound_file_list'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '设备语音播报业务能力项', identifier: 'SoundFilePlayService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['sound_play_mode', 'sound_play_priority', 'sound_play_interval', 'sound_play_count', 'sound_file_list'] },
  { id: nextId(), moduleId: MOD_AUDIO.id, name: '设备语音播报开关设置业务能力项', identifier: 'SpeakerEnableService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['speaker_enable'] },
  { id: nextId(), moduleId: MOD_DISPLAY.id, name: '屏显参数定义能力项', identifier: 'DisPlayProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['display_text_ability', 'display_richtext_ability', 'display_picture_ability', 'display_video_ability', 'url_download_ability', 'display_screen_split_ability', 'screen_width', 'screen_height', 'support_picture_format', 'support_video_encode_format', 'support_text_encode_format', 'screen_saver_timeout', 'auto_play_mode'] },
  { id: nextId(), moduleId: MOD_DISPLAY.id, name: '屏显内容下发业务能力项', identifier: 'DisPlayContentService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['display_content_type', 'display_mode', 'display_content_data', 'display_content_data', 'display_content_data', 'display_content_data', 'display_richtext_data', 'display_content_data'] },
  { id: nextId(), moduleId: MOD_DISPLAY.id, name: '屏显背景图设置业务能力项', identifier: 'DisPlayBackgroundService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['background_picture_url', 'background_picture_format'] },
  { id: nextId(), moduleId: MOD_IOT.id, name: '子设备管理参数定义能力项', identifier: 'IoTGatewayProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['max_sub_device_count', 'sub_device_list'] },
  { id: nextId(), moduleId: MOD_IOT.id, name: '管理子设备业务能力项', identifier: 'IoTGatewayManageService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['sub_device_edit_type', 'sub_device_id', 'sub_device_name', 'sub_device_type'] },
  { id: nextId(), moduleId: MOD_IOT.id, name: '编辑子设备属性业务能力项', identifier: 'IoTGatewayEditSubDeviceService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['sub_device_id', 'sub_device_property'] },
  { id: nextId(), moduleId: MOD_IOT.id, name: '执行子设备操作业务能力项', identifier: 'IoTGatewayExecuteSubDeviceService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['sub_device_id', 'sub_device_services'] },
  { id: nextId(), moduleId: MOD_TIME.id, name: '设备时间管理参数定义能力项', identifier: 'TimeProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['time_zone', 'timestamp', 'utc_offset', 'dst_enable', 'dst_offset', 'dst_start', 'dst_end', 'current_dst_status'] },
  { id: nextId(), moduleId: MOD_TIME.id, name: '设备时间同步业务能力项', identifier: 'TimeSyncService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['timestamp'] },
  { id: nextId(), moduleId: MOD_STORAGE.id, name: '设备存储模块管理参数定义能力项', identifier: 'StorageProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['storage_mount_status', 'storage_type', 'storage_total', 'storage_used', 'storage_free', 'storage_file_system', 'storage_support_max_capacity', 'storage_erase_flag', 'storage_protect_flag'] },
  { id: nextId(), moduleId: MOD_STORAGE.id, name: '设备格式化存储业务能力项', identifier: 'FormatStorageService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['storage_file_system', 'quick_format_flag'] },
  { id: nextId(), moduleId: MOD_OTA.id, name: '设备OTA相关参数定义能力项', identifier: 'OTAProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['ota_ability', 'ota_support_mode', 'firmware_version', 'sdk_version', 'api_version', 'module_versions'] },
  { id: nextId(), moduleId: MOD_OTA.id, name: '设备OTA固件升级业务能力项', identifier: 'OTAUpgradeService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['ota_upgrade_type', 'firmware_new_version', 'module', 'version', 'file_url', 'file_size', 'file_md5', 'public_key', 'signature'] },
  { id: nextId(), moduleId: MOD_OTA.id, name: '设备OTA升级结果上报事件能力项', identifier: 'OTAUpgradeEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'module', 'result', 'reason', 'version'] },
  { id: nextId(), moduleId: MOD_POWER.id, name: '设备电源参数定义能力项', identifier: 'PowerProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['power_source', 'input_voltage', 'input_current', 'output_voltage', 'output_current', 'power_on_time', 'battery_present', 'battery_type', 'battery_capacity', 'battery_full_capacity', 'battery_remain_capacity', 'battery_lower_threshold', 'battery_critical_threshold', 'battery_shutdown_threshold', 'charge_status', 'charge_valtage', 'charge_current', 'charge_power', 'solar_present', 'solar_valtage', 'solar_current', 'solar_power', 'solar_radiance'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '设备网络参数定义能力项', identifier: 'NetworkProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['network_ability', 'network_type', 'eth_status', 'eth_mac', 'eth_ip', 'eth_netmask', 'eth_gateway', 'eth_dns', 'eth_dns2', 'eth_dhcp_enable', 'wifi_status', 'wifi_mode', 'wifi_single_strength', 'wifi_security_type', 'wifi_ssid', 'wifi_password', 'wifi_ap_ssid', 'wifi_ap_password', 'wifi_mac', 'wifi_ip', 'wifi_netmask', 'wifi_gateway', 'wifi_dns', 'wifi_dns2', 'wifi_dhcp_enable', 'wifi_band', 'wifi_channel', 'bluetooth_status', 'bluetooth_name', 'bluetooth_mac', 'bluetooth_version', 'bluetooth_mode', 'cellular_status', 'cellular_type', 'cellular_single_strength', 'cellular_module', 'cellular_imei', 'cellular_band', 'cellular_slot_count', 'cellular_active_slot_id', 'cellular_slot_infos', 'nat_type'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '设备WI-FI设置业务能力项', identifier: 'WiFiSettingService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['wifi_mode', 'wifi_security_type', 'wifi_ssid', 'wifi_password', 'wifi_ap_ssid', 'wifi_ap_password', 'wifi_channel'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '设备蜂窝网络工作卡槽切换业务能力项', identifier: 'CellularSlotSwitchService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['slot_id'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '设备蜂窝网络卡槽APN信息配置业务能力项', identifier: 'CellularSlotAPNService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['slot_id', 'apn_info'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '设备蜂窝网络ESIM卡Profile设置业务能力项', identifier: 'CellularSlotESIMService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['slot_id', 'esim_profile_info'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '设备工作网络切换业务能力项', identifier: 'NetworkSwitchService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['network_type'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '设备搜索到的可连接的WIFI列表属性能力项', identifier: 'WiFiScanListProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['wifi_count', 'wifi_list'] },
  { id: nextId(), moduleId: MOD_NETWORK.id, name: '搜索周边WIFI业务能力项', identifier: 'WiFiScanService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['scan_filter_flag', 'scan_time'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '本地录像能力项', identifier: 'LocalRecordProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['record_stream_count', 'record_stream_list', 'record_switch', 'record_type', 'event_record_sec', 'pre_record_sec', 'lifecycle'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '本地抓图能力项', identifier: 'LocalPictureProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['picture_enable', 'picture_days', 'picture_format', 'timing_period_sec'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '云录像能力项', identifier: 'CloudRecordProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['record_stream_count', 'record_stream_list', 'record_type', 'storage_days', 'event_record_sec'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '录像状态能力项', identifier: 'RecordStatusProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['local_record_status', 'record_error_code', 'cloud_record_status', 'cloud_record_error_code'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '录像能力业务能力项', identifier: 'RecordService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['record_mode', 'record_streamid', 'record_data_format', 'record_data_interval', 'pre_record_time', 'record_duration'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '定时录像策略定义', identifier: 'LocalScheduleRecordPolicy', capType: 'policy', updateTime: '2026-11-13 10:00:00',
    params: ['policy_count', 'policy_list'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '事件录像策略定义', identifier: 'LocalEventRecordPolicy', capType: 'policy', updateTime: '2026-11-13 10:00:00',
    params: ['policy_count', 'policy_list'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '云图片能力项', identifier: 'CloudPictureProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['picture_enable', 'storage_days', 'picture_format'] },
  { id: nextId(), moduleId: MOD_RECORD.id, name: '抓图服务能力项', identifier: 'RecordSnapshotService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['nvr_channel_num', 'snap_type', 'picture_format', 'picture_count', 'picture_interval'] },
  { id: nextId(), moduleId: MOD_WORKMODE.id, name: '工作模式参数定义能力项', identifier: 'WorkModeProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['work_mode_count', 'current_work_mode_id', 'work_mode_list'] },
  { id: nextId(), moduleId: MOD_WORKMODE.id, name: '工作模式切换业务能力项', identifier: 'WorkModeSwitchService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['work_mode_id'] },
  { id: nextId(), moduleId: MOD_WORKMODE.id, name: 'AOV工作模式切换策略', identifier: 'AOVWorkModeSwitchPolicy', capType: 'policy', updateTime: '2026-11-13 10:00:00',
    params: ['policy_id', 'policy_type', 'policy_name', 'policy_enable', 'policy_priority', 'policy_condition', 'policy_services'] },
  { id: nextId(), moduleId: MOD_LIGHT.id, name: '设备灯光参数定义能力项', identifier: 'LightProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['light_count', 'light_list'] },
  { id: nextId(), moduleId: MOD_LIGHT.id, name: '灯光切换业务能力项', identifier: 'LightSwitchService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['light_id', 'light_enable', 'light_mode', 'light_duration', 'brightness', 'colortemp', 'color_mode', 'color_rgb', 'color_hsv', 'flash_count', 'flash_interval'] },
  { id: nextId(), moduleId: MOD_LIGHT.id, name: '灯光模式参数定义能力项', identifier: 'LightModeProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['light_mode_count', 'light_mode_list'] },
  { id: nextId(), moduleId: MOD_LIGHT.id, name: '灯光模式切换业务能力项', identifier: 'LightModeSwitchService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['light_mode_id'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '设备算法能力定义能力项', identifier: 'AlgorithmProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['algorithm_count', 'algorithm_running_count', 'algorithm_enabled_count', 'algorithm_list'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '启用/禁用算法业务项', identifier: 'AlgorithmEnableService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['algorithm_id', 'algorithm_enable'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '启动/停止算法业务项', identifier: 'AlgorithmRunningService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['algorithm_id', 'algorithm_running'] },
  { id: nextId(), moduleId: MOD_GPS.id, name: 'GPS定位能力参数能力项', identifier: 'GPSProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['gps_enbale', 'gps_status', 'gps_latitude', 'gps_longitude', 'gps_altitude', 'gps_speed', 'gps_direction', 'gps_time', 'gps_distance', 'report_mode', 'report_interval', 'report_distance'] },
  { id: nextId(), moduleId: MOD_GPS.id, name: 'GPS定位电子围栏能力项', identifier: 'GPSFenceProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['fence_count', 'fence_list'] },
  { id: nextId(), moduleId: MOD_GPS.id, name: 'GPS上报策略调整业务能力项', identifier: 'GPSReportService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['gps_enable', 'report_mode', 'report_interval', 'report_distance'] },
  { id: nextId(), moduleId: MOD_GPS.id, name: 'GPS电子围栏设置业务能力项', identifier: 'GPSFenceService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['fence_control', 'fence_id', 'fence_name', 'fence_type', 'fence_radius', 'fence_center', 'fence_points'] },
  { id: nextId(), moduleId: MOD_SENSOR.id, name: 'GSENSOR传感能力参数能力项', identifier: 'GSensorProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['gsensor_enable', 'gsensor_status', 'g_x', 'g_y', 'g_z', 'pitch', 'roll', 'vibration_level', 'range', 'gsensor_sensitivity'] },
  { id: nextId(), moduleId: MOD_SENSOR.id, name: 'GSensor业务能力项', identifier: 'GSensorService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['gsensor_enable', 'gsensor_sensitivity'] },
  { id: nextId(), moduleId: MOD_DEV.id, name: '设备状态事件', identifier: 'DeviceEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '目标检测事件', identifier: 'TargetDetectEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '车辆车位事件', identifier: 'VehicleEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '宠物行为事件', identifier: 'PetBehaviorEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '儿童看护事件', identifier: 'ChildCareEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '老人看护事件', identifier: 'ElderCareEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '厨房安全事件', identifier: 'KitchenSafetyEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '岗位管理事件', identifier: 'StaffEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '出入事件', identifier: 'AccessEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_CALL.id, name: '呼叫事件', identifier: 'CallEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_ALGO.id, name: '鱼类事件', identifier: 'FishEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '香薰事件', identifier: 'AromaEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_METER.id, name: '电表事件', identifier: 'MeterEvent', capType: 'evt', updateTime: '2026-11-13 10:00:00',
    params: ['event_type_id', 'event_time'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '香薰机基础属性能力项', identifier: 'SprayProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['spray_enable', 'wake_switch', 'screen_swith', 'voice_state', 'spray_count'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '香薰机喷头属性能力项', identifier: 'SprayHeadProperty', capType: 'prop', updateTime: '2026-11-13 10:00:00',
    params: ['spray_id', 'spay_duration', 'spray_interval', 'spray_gear', 'spray_mode'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '香薰机喷头喷雾业务能力项', identifier: 'SprayService', capType: 'svc', updateTime: '2026-11-13 10:00:00',
    params: ['spray_id', 'spay_duration', 'spray_interval', 'spray_gear', 'spray_mode'] },
  { id: nextId(), moduleId: MOD_AROMA.id, name: '香薰机定时策略', identifier: 'SpraySchedulePolicy', capType: 'policy', updateTime: '2026-11-13 10:00:00',
    params: ['policy_count', 'policy_list', 'schedule_count', 'schedule_list'] },
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
  legacyCapabilities: JSON.parse(JSON.stringify(initialLegacyCapabilities)),
  eventCategories: []   // 事件分类（独立数据源，不取自能力库）
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
    ci.updateTime = nowStamp()
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
  { id: nextId(), eventId: 109300, eventName: "{\"1\": \"\u79bb\u7ebf\"}", category: '设备状态事件', pushCopy: "{\"1\": \"\u79bb\u7ebf\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109301, eventName: "{\"1\": \"\u5728\u7ebf\"}", category: '设备状态事件', pushCopy: "{\"1\": \"\u5728\u7ebf\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109302, eventName: "{\"1\": \"\u4f11\u7720\"}", category: '设备状态事件', pushCopy: "{\"1\": \"\u4f11\u7720\"}", referencedCount: 0 },
  { id: nextId(), eventId: 100000, eventName: "{\"1\": \"\u8fd0\u52a8\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u8fd0\u52a8\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 100001, eventName: "{\"1\": \"\u4eba\u5f62\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u4eba\u5f62\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 100015, eventName: "{\"1\": \"\u4eba\u8138\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u4eba\u8138\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 100017, eventName: "{\"1\": \"\u5165\u4fb5\u68c0\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u5165\u4fb5\u68c0\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 100020, eventName: "{\"1\": \"\u8f66\u724c\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u8f66\u724c\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 100021, eventName: "{\"1\": \"\u9017\u7559\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u9017\u7559\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 100400, eventName: "{\"1\": \"\u58f0\u97f3\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u58f0\u97f3\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 101201, eventName: "{\"1\": \"\u4f4e\u7535\u91cf\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u4f4e\u7535\u91cf\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102400, eventName: "{\"1\": \"\u8dcc\u5012\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u8dcc\u5012\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102500, eventName: "{\"1\": \"\u706b\u7130\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u706b\u7130\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102800, eventName: "{\"1\": \"\u54ed\u58f0\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u54ed\u58f0\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102900, eventName: "{\"1\": \"\u5ba0\u7269\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u5ba0\u7269\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 107900, eventName: "{\"1\": \"\u533a\u57df\u95ef\u5165\u4e8b\u4ef6\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u533a\u57df\u95ef\u5165\u4e8b\u4ef6\"}", referencedCount: 0 },
  { id: nextId(), eventId: 108000, eventName: "{\"1\": \"\u533a\u57df\u79bb\u5f00\u4e8b\u4ef6\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u533a\u57df\u79bb\u5f00\u4e8b\u4ef6\"}", referencedCount: 0 },
  { id: nextId(), eventId: 108200, eventName: "{\"1\": \"\u70df\u706b\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u70df\u706b\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 108300, eventName: "{\"1\": \"\u8f66\u8f86\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u8f66\u8f86\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 110900, eventName: "{\"1\": \"\u5305\u88f9\u68c0\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u5305\u88f9\u68c0\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 200002, eventName: "{\"1\": \"\u9e1f\u7c7b\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u9e1f\u7c7b\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 200003, eventName: "{\"1\": \"\u677e\u9f20\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u677e\u9f20\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 200006, eventName: "{\"1\": \"\u5305\u88f9\u4fa6\u6d4b\"}", category: '目标检测事件', pushCopy: "{\"1\": \"\u5305\u88f9\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 108600, eventName: "{\"1\": \"\u975e\u673a\u52a8\u8f66\"}", category: '车辆车位事件', pushCopy: "{\"1\": \"\u975e\u673a\u52a8\u8f66\"}", referencedCount: 0 },
  { id: nextId(), eventId: 108601, eventName: "{\"1\": \"\u7535\u52a8\u8f66\"}", category: '车辆车位事件', pushCopy: "{\"1\": \"\u7535\u52a8\u8f66\"}", referencedCount: 0 },
  { id: nextId(), eventId: 108602, eventName: "{\"1\": \"\u81ea\u884c\u8f66\"}", category: '车辆车位事件', pushCopy: "{\"1\": \"\u81ea\u884c\u8f66\"}", referencedCount: 0 },
  { id: nextId(), eventId: 108901, eventName: "{\"1\": \"\u8f66\u4f4d\u5360\u7528\"}", category: '车辆车位事件', pushCopy: "{\"1\": \"\u8f66\u4f4d\u5360\u7528\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102901, eventName: "{\"1\": \"\u9017\u7559\"}", category: '宠物行为事件', pushCopy: "{\"1\": \"\u9017\u7559\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102902, eventName: "{\"1\": \"\u62c6\u5bb6\"}", category: '宠物行为事件', pushCopy: "{\"1\": \"\u62c6\u5bb6\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102903, eventName: "{\"1\": \"\u559d\u6c34\"}", category: '宠物行为事件', pushCopy: "{\"1\": \"\u559d\u6c34\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102904, eventName: "{\"1\": \"\u8fdb\u98df\"}", category: '宠物行为事件', pushCopy: "{\"1\": \"\u8fdb\u98df\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102905, eventName: "{\"1\": \"\u7761\u89c9\"}", category: '宠物行为事件', pushCopy: "{\"1\": \"\u7761\u89c9\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102906, eventName: "{\"1\": \"\u5c4b\u5185\u6392\u4fbf\"}", category: '宠物行为事件', pushCopy: "{\"1\": \"\u5c4b\u5185\u6392\u4fbf\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109600, eventName: "{\"1\": \"\u513f\u7ae5\u68c0\u6d4b\"}", category: '儿童看护事件', pushCopy: "{\"1\": \"\u513f\u7ae5\u68c0\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109601, eventName: "{\"1\": \"\u54ed\u95f9\"}", category: '儿童看护事件', pushCopy: "{\"1\": \"\u54ed\u95f9\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109602, eventName: "{\"1\": \"\u5916\u51fa\"}", category: '儿童看护事件', pushCopy: "{\"1\": \"\u5916\u51fa\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109603, eventName: "{\"1\": \"\u56de\u5bb6\"}", category: '儿童看护事件', pushCopy: "{\"1\": \"\u56de\u5bb6\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109604, eventName: "{\"1\": \"\u6454\u5012\"}", category: '儿童看护事件', pushCopy: "{\"1\": \"\u6454\u5012\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109605, eventName: "{\"1\": \"\u505a\u4f5c\u4e1a\"}", category: '儿童看护事件', pushCopy: "{\"1\": \"\u505a\u4f5c\u4e1a\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109606, eventName: "{\"1\": \"\u73a9\u624b\u673a\"}", category: '儿童看护事件', pushCopy: "{\"1\": \"\u73a9\u624b\u673a\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109700, eventName: "{\"1\": \"\u8001\u4eba\u68c0\u6d4b\"}", category: '老人看护事件', pushCopy: "{\"1\": \"\u8001\u4eba\u68c0\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109701, eventName: "{\"1\": \"\u5916\u51fa\"}", category: '老人看护事件', pushCopy: "{\"1\": \"\u5916\u51fa\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109702, eventName: "{\"1\": \"\u56de\u5bb6\"}", category: '老人看护事件', pushCopy: "{\"1\": \"\u56de\u5bb6\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109703, eventName: "{\"1\": \"\u6454\u5012\"}", category: '老人看护事件', pushCopy: "{\"1\": \"\u6454\u5012\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102500, eventName: "{\"1\": \"\u706b\u7130\u4fa6\u6d4b\"}", category: '厨房安全事件', pushCopy: "{\"1\": \"\u706b\u7130\u4fa6\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 102600, eventName: "{\"1\": \"\u70df\u96fe\u68c0\u6d4b\"}", category: '厨房安全事件', pushCopy: "{\"1\": \"\u70df\u96fe\u68c0\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 107000, eventName: "{\"1\": \"\u4eba\u5458\u79bb\u5c97\"}", category: '岗位管理事件', pushCopy: "{\"1\": \"\u4eba\u5458\u79bb\u5c97\"}", referencedCount: 0 },
  { id: nextId(), eventId: 107001, eventName: "{\"1\": \"\u53cc\u4eba\u5728\u5c97\"}", category: '岗位管理事件', pushCopy: "{\"1\": \"\u53cc\u4eba\u5728\u5c97\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109000, eventName: "{\"1\": \"\u8fdb\u5165\"}", category: '出入事件', pushCopy: "{\"1\": \"\u8fdb\u5165\"}", referencedCount: 0 },
  { id: nextId(), eventId: 109001, eventName: "{\"1\": \"\u51fa\u53bb\"}", category: '出入事件', pushCopy: "{\"1\": \"\u51fa\u53bb\"}", referencedCount: 0 },
  { id: nextId(), eventId: 103700, eventName: "{\"1\": \"\u8bed\u97f3\u547c\u53eb\"}", category: '呼叫事件', pushCopy: "{\"1\": \"\u8bed\u97f3\u547c\u53eb\"}", referencedCount: 0 },
  { id: nextId(), eventId: 103701, eventName: "{\"1\": \"\u8bed\u97f3\u52a0\u89c6\u9891\u547c\u53eb\"}", category: '呼叫事件', pushCopy: "{\"1\": \"\u8bed\u97f3\u52a0\u89c6\u9891\u547c\u53eb\"}", referencedCount: 0 },
  { id: nextId(), eventId: 103702, eventName: "{\"1\": \"\u6302\u65ad\u547c\u53eb\"}", category: '呼叫事件', pushCopy: "{\"1\": \"\u6302\u65ad\u547c\u53eb\"}", referencedCount: 0 },
  { id: nextId(), eventId: 111100, eventName: "{\"1\": \"\u9c7c\u7c7b\u68c0\u6d4b\"}", category: '鱼类事件', pushCopy: "{\"1\": \"\u9c7c\u7c7b\u68c0\u6d4b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 111101, eventName: "{\"1\": \"\u7cbe\u5f69\u77ac\u95f4\"}", category: '鱼类事件', pushCopy: "{\"1\": \"\u7cbe\u5f69\u77ac\u95f4\"}", referencedCount: 0 },
  { id: nextId(), eventId: 120001, eventName: "{\"1\": \"\u7f3a\u6db2\u62a5\u8b66\"}", category: '香薰事件', pushCopy: "{\"1\": \"\u7f3a\u6db2\u62a5\u8b66\"}", referencedCount: 0 },
  { id: nextId(), eventId: 120002, eventName: "{\"1\": \"\u55b7\u5934\u5835\u585e\"}", category: '香薰事件', pushCopy: "{\"1\": \"\u55b7\u5934\u5835\u585e\"}", referencedCount: 0 },
  { id: nextId(), eventId: 130001, eventName: "{\"1\": \"\u6b20\u538b\"}", category: '电表事件', pushCopy: "{\"1\": \"\u6b20\u538b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 130002, eventName: "{\"1\": \"\u8fc7\u538b\"}", category: '电表事件', pushCopy: "{\"1\": \"\u8fc7\u538b\"}", referencedCount: 0 },
  { id: nextId(), eventId: 130003, eventName: "{\"1\": \"\u8fc7\u6d41\"}", category: '电表事件', pushCopy: "{\"1\": \"\u8fc7\u6d41\"}", referencedCount: 0 },
  { id: nextId(), eventId: 130004, eventName: "{\"1\": \"\u6f0f\u7535\"}", category: '电表事件', pushCopy: "{\"1\": \"\u6f0f\u7535\"}", referencedCount: 0 },
  { id: nextId(), eventId: 130005, eventName: "{\"1\": \"\u505c\u7535\"}", category: '电表事件', pushCopy: "{\"1\": \"\u505c\u7535\"}", referencedCount: 0 },
  { id: nextId(), eventId: 130006, eventName: "{\"1\": \"\u4e0a\u7535\"}", category: '电表事件', pushCopy: "{\"1\": \"\u4e0a\u7535\"}", referencedCount: 0 },
  { id: nextId(), eventId: 130007, eventName: "{\"1\": \"\u5f00\u76d6\"}", category: '电表事件', pushCopy: "{\"1\": \"\u5f00\u76d6\"}", referencedCount: 0 },
  { id: nextId(), eventId: 130008, eventName: "{\"1\": \"\u4f59\u989d\u4e0d\u8db3\"}", category: '电表事件', pushCopy: "{\"1\": \"\u4f59\u989d\u4e0d\u8db3\"}", referencedCount: 0 },
  { id: nextId(), eventId: 130009, eventName: "{\"1\": \"\u7ee7\u7535\u5668\u8df3\u95f8\"}", category: '电表事件', pushCopy: "{\"1\": \"\u7ee7\u7535\u5668\u8df3\u95f8\"}", referencedCount: 0 },
]

store.algorithms = JSON.parse(JSON.stringify(initialAlgorithms))
store.events = JSON.parse(JSON.stringify(initialEvents))

// ===== 事件分类（独立维护）=====
const initialEventCategories = [
  '设备状态事件', '目标检测事件', '车辆车位事件', '宠物行为事件', '儿童看护事件',
  '老人看护事件', '厨房安全事件', '岗位管理事件', '出入事件', '呼叫事件',
  '鱼类事件', '香薰事件', '电表事件'
]
store.eventCategories = initialEventCategories.map(name => ({ id: nextId(), name }))

export function addEventCategory(name) {
  const n = (name || '').trim()
  if (!n) return { code: 1, message: '分类名称不能为空' }
  if (store.eventCategories.some(c => c.name === n)) return { code: 1, message: '分类已存在' }
  store.eventCategories.push({ id: nextId(), name: n })
  return { code: 0 }
}

export function updateEventCategory(id, name) {
  const n = (name || '').trim()
  if (!n) return { code: 1, message: '分类名称不能为空' }
  if (store.eventCategories.some(c => c.name === n && c.id !== id)) return { code: 1, message: '分类已存在' }
  const cat = store.eventCategories.find(c => c.id === id)
  if (!cat) return { code: 1, message: '分类不存在' }
  const old = cat.name
  cat.name = n
  // 同步更新事件上的分类名
  store.events.forEach(e => { if (e.category === old) e.category = n })
  return { code: 0 }
}

export function deleteEventCategory(id) {
  const idx = store.eventCategories.findIndex(c => c.id === id)
  if (idx === -1) return { code: 1, message: '分类不存在' }
  const used = store.events.filter(e => e.category === store.eventCategories[idx].name).length
  if (used) return { code: 1, message: `该分类下还有 ${used} 个事件，请先调整后再删除` }
  store.eventCategories.splice(idx, 1)
  return { code: 0 }
}

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
    category: data.category || '',
    descr: data.descr || '{}',
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
  if (data.category !== undefined) cur.category = data.category
  if (data.descr !== undefined) cur.descr = data.descr
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
